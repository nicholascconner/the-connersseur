import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { OrderWithItems, Order, OrderItem, MenuItem } from '@/types';

async function sendEmail(to: string[], subject: string, html: string) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'The Connerseur', email: 'nicholasc.conner@gmail.com' },
      to: to.map((email) => ({ email })),
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Brevo API error: ${error}`);
  }
}

const RECIPIENTS = ['Nicholasc.conner@gmail.com', 'econnertx@outlook.com'];

interface MonthlyStats {
  month: string;
  year: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalDrinksOrdered: number;
  uniqueGuests: number;
  groupOrders: number;
  topDrinks: { name: string; count: number }[];
  topGuests: { name: string; drinkCount: number; orderCount: number }[];
  busiestHour: { hour: number; count: number } | null;
  avgCompletionMinutes: number | null;
  longestOrder: { guestName: string; minutes: number; drinks: string[] } | null;
  customDrinkCount: number;
  menuDrinkCount: number;
  customDrinks: { name: string; note: string | null; count: number }[];
}

function sanitizeNote(note: string | null): string | null {
  if (!note) return null;
  const stripped = note
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!stripped) return null;
  return stripped.length > 90 ? `${stripped.slice(0, 87)}...` : stripped;
}

function computeStats(orders: OrderWithItems[], monthLabel: string, yearLabel: string): MonthlyStats {
  const completed = orders.filter((o) => o.status === 'completed');
  const cancelled = orders.filter((o) => o.status === 'cancelled');
  const allItems = orders.flatMap((o) => o.order_items);

  const drinkCounts: Record<string, number> = {};
  allItems.forEach((item) => {
    drinkCounts[item.item_name] = (drinkCounts[item.item_name] || 0) + item.quantity;
  });
  const topDrinks = Object.entries(drinkCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const customAgg: Record<string, { note: string | null; count: number }> = {};
  allItems.filter((i) => i.is_custom).forEach((item) => {
    const key = item.item_name.trim();
    if (!customAgg[key]) customAgg[key] = { note: null, count: 0 };
    customAgg[key].count += item.quantity;
    if (!customAgg[key].note) customAgg[key].note = sanitizeNote(item.notes);
  });
  const customDrinks = Object.entries(customAgg)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([name, v]) => ({ name, note: v.note, count: v.count }));

  const guestStats: Record<string, { drinks: number; orders: number }> = {};
  orders.forEach((order) => {
    const totalDrinks = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
    if (!guestStats[order.guest_name]) guestStats[order.guest_name] = { drinks: 0, orders: 0 };
    guestStats[order.guest_name].drinks += totalDrinks;
    guestStats[order.guest_name].orders += 1;
  });
  const topGuests = Object.entries(guestStats)
    .sort((a, b) => b[1].drinks - a[1].drinks)
    .slice(0, 5)
    .map(([name, stats]) => ({ name, drinkCount: stats.drinks, orderCount: stats.orders }));

  const hourCounts: Record<number, number> = {};
  orders.forEach((order) => {
    const hour = new Date(order.created_at).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const busiestHourEntry = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  const busiestHour = busiestHourEntry
    ? { hour: parseInt(busiestHourEntry[0]), count: parseInt(busiestHourEntry[1].toString()) }
    : null;

  const completionTimes = completed.map((o) => {
    return (new Date(o.updated_at).getTime() - new Date(o.created_at).getTime()) / 60000;
  });
  const avgCompletionMinutes =
    completionTimes.length > 0
      ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
      : null;

  let longestOrder = null;
  if (completed.length > 0) {
    const longest = completed.reduce((max, order) => {
      const mins = (new Date(order.updated_at).getTime() - new Date(order.created_at).getTime()) / 60000;
      const maxMins = (new Date(max.updated_at).getTime() - new Date(max.created_at).getTime()) / 60000;
      return mins > maxMins ? order : max;
    });
    longestOrder = {
      guestName: longest.guest_name,
      minutes: Math.round((new Date(longest.updated_at).getTime() - new Date(longest.created_at).getTime()) / 60000),
      drinks: longest.order_items.map((i) => i.item_name),
    };
  }

  return {
    month: monthLabel,
    year: yearLabel,
    totalOrders: orders.length,
    completedOrders: completed.length,
    cancelledOrders: cancelled.length,
    totalDrinksOrdered: allItems.reduce((sum, i) => sum + i.quantity, 0),
    uniqueGuests: Object.keys(guestStats).length,
    groupOrders: orders.filter((o) => o.group_name).length,
    topDrinks,
    topGuests,
    busiestHour,
    avgCompletionMinutes,
    longestOrder,
    customDrinkCount: allItems.filter((i) => i.is_custom).reduce((sum, i) => sum + i.quantity, 0),
    menuDrinkCount: allItems.filter((i) => !i.is_custom).reduce((sum, i) => sum + i.quantity, 0),
    customDrinks,
  };
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

interface RecipeTwist {
  twistName: string;
  build: string[];
  method: string;
  garnish: string;
  glass: string;
}

// Hand-built twists for the drinks most likely to top the list. Falls back to a
// generated build for anything not in this library (see genericTwist below).
const RECIPE_TWISTS: Record<string, RecipeTwist> = {
  'old fashioned': {
    twistName: 'The Upper West Old Fashioned',
    build: ['2 oz Bourbon or Rye', '0.25 oz Amaro', '1 barspoon Antica Formula sweet vermouth', '2 dashes Angostura Bitters', '1 sugar cube or 0.25 oz simple syrup'],
    method: 'Stir all ingredients with ice for 30 seconds. Strain over one large rock.',
    garnish: 'Orange peel, expressed over the glass and dropped in.',
    glass: 'Rocks glass',
  },
  manhattan: {
    twistName: 'The Smoked Manhattan',
    build: ['2 oz Rye Whiskey', '1 oz Sweet Vermouth', '2 dashes Angostura Bitters', '1 dash Orange Bitters'],
    method: 'Stir with ice until well chilled, about 30 seconds. Strain into a chilled coupe.',
    garnish: 'Flamed orange peel, Luxardo cherry.',
    glass: 'Coupe',
  },
  martini: {
    twistName: 'The Bone-Dry Twist Martini',
    build: ['2.5 oz Gin or Vodka', '0.25 oz Dry Vermouth', '1 dash Orange Bitters'],
    method: 'Stir, never shake, with ice for 30 seconds. Strain into a chilled martini glass.',
    garnish: 'Three olives, or a lemon twist.',
    glass: 'Martini glass',
  },
  'amaretto sour': {
    twistName: 'The Smoky Amaretto Sour',
    build: ['1.5 oz Amaretto', '0.5 oz Bourbon', '0.75 oz Fresh Lemon Juice', '0.5 oz Simple Syrup', '1 Egg White'],
    method: 'Dry shake without ice for 15 seconds, then add ice and shake again for 15 seconds. Double strain into a rocks glass over one large cube.',
    garnish: '3 drops Angostura bitters on the foam, orange peel.',
    glass: 'Rocks glass',
  },
  margarita: {
    twistName: 'The Chili-Salt Margarita',
    build: ['2 oz Tequila', '1 oz Cointreau', '1 oz Fresh Lime Juice', '0.25 oz Agave Nectar'],
    method: 'Shake hard with ice for 10 to 12 seconds. Strain over fresh ice.',
    garnish: 'Tajin and chili-salt rim, lime wheel.',
    glass: 'Rocks glass',
  },
  'moscow mule': {
    twistName: 'The Ginger-Forward Mule',
    build: ['2 oz Vodka', '0.5 oz Fresh Lime Juice', '4 to 5 oz Ginger Beer', '2 slices fresh ginger, muddled'],
    method: 'Muddle the ginger in a copper mug, add vodka and lime, fill with ice, top with ginger beer, stir once.',
    garnish: 'Candied ginger, lime wheel.',
    glass: 'Copper mug',
  },
  'whiskey sour': {
    twistName: 'The Frothy Whiskey Sour',
    build: ['2 oz Bourbon', '0.75 oz Fresh Lemon Juice', '0.75 oz Simple Syrup', '1 Egg White'],
    method: 'Dry shake, then shake again with ice. Strain into a rocks glass over one large cube.',
    garnish: '3 dashes Angostura bitters drawn through the foam, brandied cherry.',
    glass: 'Rocks glass',
  },
  negroni: {
    twistName: 'The Barrel-Rested Negroni',
    build: ['1 oz Gin', '1 oz Campari', '1 oz Sweet Vermouth'],
    method: 'Stir with ice for 20 seconds. Strain over one large rock.',
    garnish: 'Orange peel.',
    glass: 'Rocks glass',
  },
  cosmopolitan: {
    twistName: 'The Blood Orange Cosmo',
    build: ['1.5 oz Vodka', '0.5 oz Cointreau', '0.5 oz Fresh Lime Juice', '0.5 oz Cranberry Juice, swap in blood orange juice for the twist'],
    method: 'Shake hard with ice for 10 seconds. Double strain into a chilled coupe.',
    garnish: 'Flamed orange peel.',
    glass: 'Coupe',
  },
  'espresso martini': {
    twistName: 'The Vanilla Bean Espresso Martini',
    build: ['1.5 oz Vodka', '0.5 oz Coffee Liqueur', '1 oz fresh espresso, pulled hot', '0.25 oz vanilla bean simple syrup'],
    method: 'Shake hard with ice for 12 to 15 seconds to build the foam. Double strain into a chilled coupe.',
    garnish: '3 coffee beans.',
    glass: 'Coupe',
  },
  mojito: {
    twistName: 'The Berry Mojito',
    build: ['2 oz White Rum', '0.75 oz Fresh Lime Juice', '2 tsp Sugar', '8 to 10 fresh mint leaves', 'Soda Water to top'],
    method: 'Gently muddle mint and sugar in the glass. Add rum and lime, fill with crushed ice, top with soda, stir.',
    garnish: 'Mint sprig, fresh berries.',
    glass: 'Highball',
  },
  paloma: {
    twistName: 'The Grapefruit Paloma',
    build: ['2 oz Tequila', '0.5 oz Fresh Lime Juice', 'Grapefruit Soda to top', 'Pinch of salt'],
    method: 'Build over ice in a salt-rimmed glass, squeeze the lime, top with grapefruit soda, stir once.',
    garnish: 'Grapefruit wedge.',
    glass: 'Highball',
  },
  sazerac: {
    twistName: 'The Absinthe-Rinsed Sazerac',
    build: ['2 oz Rye Whiskey', '1 sugar cube', '3 dashes Peychaud’s Bitters', 'Absinthe rinse'],
    method: 'Rinse a chilled rocks glass with absinthe and discard the excess. Stir the rye, sugar, and bitters with ice separately, then strain into the prepared glass.',
    garnish: 'Lemon peel, expressed and discarded.',
    glass: 'Rocks glass, no ice',
  },
  'the godfather': {
    twistName: 'The Godfather, Reimagined',
    build: ['2 oz Blended Scotch or Single Malt', '0.5 oz Amaretto'],
    method: 'Build over one large ice cube, stir once to combine.',
    garnish: 'None needed. Keep it simple.',
    glass: 'Rocks glass',
  },
  'upper west side': {
    twistName: 'The Upper West Side, Perfected',
    build: ['1.5 oz Whiskey', '1 oz Rye', '0.25 oz Amaro', '0.25 oz Antica Formula', '2 dashes Angostura Bitters'],
    method: 'Stir with ice for 30 seconds. Strain over one large rock.',
    garnish: 'Orange peel.',
    glass: 'Rocks glass',
  },
  'french martini': {
    twistName: 'The French Martini, Extra Foam',
    build: ['1.5 oz Vodka', '0.5 oz Chambord', '2 oz Pineapple Juice'],
    method: 'Shake hard with ice for 12 seconds to build the pineapple foam. Strain into a chilled coupe.',
    garnish: '3 raspberries on a pick.',
    glass: 'Coupe',
  },
  boulevardier: {
    twistName: 'The Smoked Boulevardier',
    build: ['1.5 oz Bourbon', '1 oz Campari', '1 oz Sweet Vermouth'],
    method: 'Stir with ice, strain over one large rock.',
    garnish: 'Orange peel.',
    glass: 'Rocks glass',
  },
  'vesper martini': {
    twistName: 'The Original Vesper',
    build: ['3 oz Gin', '1 oz Vodka', '0.5 oz Lillet Blanc'],
    method: 'Shake hard with ice for 10 seconds. Strain into a chilled martini glass.',
    garnish: 'Lemon twist.',
    glass: 'Martini glass',
  },
  'gin and tonic': {
    twistName: 'The Peppered G&T',
    build: ['2 oz Premium Gin', '4 oz Tonic Water', 'Fresh lime squeeze'],
    method: 'Build over ice, gin first, top with tonic, squeeze and drop the lime.',
    garnish: 'Lime wedge, cracked black pepper.',
    glass: 'Highball',
  },
  'tom collins': {
    twistName: 'The Elderflower Collins',
    build: ['2 oz Gin', '0.75 oz Fresh Lemon Juice', '0.5 oz Simple Syrup', 'Soda Water to top'],
    method: 'Shake gin, lemon, and syrup with ice. Strain into a highball over fresh ice, top with soda.',
    garnish: 'Lemon slice, cherry.',
    glass: 'Highball',
  },
};

function genericTwist(item: MenuItem): RecipeTwist {
  const parts = item.ingredients.split(',').map((s) => s.trim()).filter(Boolean);
  const base = parts[0] || 'the base spirit';
  return {
    twistName: `The ${item.name} Twist`,
    build: [`2 oz ${base}`, ...parts.slice(1).map((p) => `0.5 oz ${p}`)],
    method: 'Combine with ice, stir if it is spirit-forward or shake if it has juice or egg white, then strain.',
    garnish: 'A citrus peel to match.',
    glass: 'Whatever glass suits the occasion',
  };
}

function suggestDrinkOfMonth(topDrinks: { name: string; count: number }[], menuItems: MenuItem[], isAllTime = false): { name: string; description: string; twist: RecipeTwist } {
  let sourceItem: MenuItem | undefined;
  for (const d of topDrinks) {
    const match = menuItems.find((m) => m.name.toLowerCase() === d.name.toLowerCase());
    if (match && match.category === 'Cocktails') {
      sourceItem = match;
      break;
    }
  }
  if (!sourceItem) {
    sourceItem = menuItems.find((m) => m.category === 'Cocktails');
  }

  const inspiration = sourceItem?.name || topDrinks[0]?.name || 'the classics';
  const key = inspiration.toLowerCase();
  const twist = RECIPE_TWISTS[key] || (sourceItem ? genericTwist(sourceItem) : {
    twistName: `The ${inspiration} Twist`,
    build: ['2 oz your favorite base spirit', '0.5 oz something bright'],
    method: 'Combine with ice and strain.',
    garnish: 'A citrus peel.',
    glass: 'Your favorite glass',
  });

  return {
    name: inspiration,
    description: isAllTime
      ? `${inspiration} is the all-time crowd favorite, so we built a specific twist on it instead of just telling you to wing it.`
      : `${inspiration} was the crowd favorite this month, so we built a specific twist on it instead of just telling you to wing it.`,
    twist,
  };
}

function generateNewsletter(stats: MonthlyStats, menuItems: MenuItem[], isAllTime = false): string {
  const noOrders = stats.totalOrders === 0;
  const drink = suggestDrinkOfMonth(stats.topDrinks, menuItems, isAllTime);
  const topGuest = stats.topGuests[0];

  const punnyTitles: Record<string, string> = {
    January: 'Dry January? We Don\'t Know Her',
    February: 'Rosé All Day, Every Day',
    March: 'In Like a Pour, Out Like a Wine',
    April: 'April Pours',
    May: 'May the Best Drink Win',
    June: 'Summer Sippin\' Has Come So Easy',
    July: 'Red, White & Brewed',
    August: 'The Dog Days of Pourin\'',
    September: 'Fallin\' for These Drinks',
    October: 'Things Are Getting Spirited',
    November: 'Pour-giving Season',
    December: '\'Tis the Season to Be Tipsy',
  };

  const title = isAllTime ? 'The Story So Far' : (punnyTitles[stats.month] || `The ${stats.month} Sip Report`);

  const statRows = [
    { label: '🍹 Total Orders', value: stats.totalOrders },
    { label: '✅ Completed', value: stats.completedOrders },
    { label: '❌ Cancelled', value: stats.cancelledOrders },
    { label: '🥂 Total Drinks Poured', value: stats.totalDrinksOrdered },
    { label: '👥 Unique Guests', value: stats.uniqueGuests },
    { label: '🎉 Group Orders', value: stats.groupOrders },
    { label: '🎨 Custom Creations', value: stats.customDrinkCount },
    { label: '📋 Menu Drinks', value: stats.menuDrinkCount },
    ...(stats.avgCompletionMinutes !== null
      ? [{ label: '⏱ Avg. Time to Complete', value: `${stats.avgCompletionMinutes} min` }]
      : []),
    ...(stats.busiestHour
      ? [{ label: '🔥 Busiest Hour', value: `${formatHour(stats.busiestHour.hour)} (${stats.busiestHour.count} orders)` }]
      : []),
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The Connerseur: ${stats.month} ${stats.year}</title>
</head>
<body style="margin:0;padding:0;background:#F0EDE8;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#FAFAF5;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2d2d2d 0%,#1a1a1a 100%);padding:36px 32px 28px;text-align:center;">
      <img src="https://the-connerseur.vercel.app/logo-connerseur.png" alt="The Connerseur" style="max-width:220px;height:auto;margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;" />
      <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:#FFD700;font-style:italic;">${title}</h1>
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);letter-spacing:2px;text-transform:uppercase;">${isAllTime ? `${stats.year} &nbsp;•&nbsp; All-Time Sip Report` : `${stats.month} ${stats.year} &nbsp;•&nbsp; Monthly Sip Report`}</p>
    </div>

    <!-- Gold bar -->
    <div style="height:4px;background:linear-gradient(90deg,#8B1538,#FFD700,#8B1538);"></div>

    <!-- Opening -->
    <div style="padding:32px;border-bottom:2px solid #F0EDE8;">
      <p style="margin:0;font-size:16px;line-height:1.8;color:#2d2d2d;">
        ${noOrders
          ? `It was a quiet month at The Connerseur. The glasses were clean, the bar was still, and the ice sat untouched. Consider this the calm before the pour. We'll be back next month with more to report.`
          : isAllTime
          ? `Every order, every pour, every questionable 2am custom creation, we counted it all. Since day one, The Connerseur has poured <strong style="color:#8B1538;">${stats.totalDrinksOrdered} drinks</strong> across <strong style="color:#8B1538;">${stats.totalOrders} orders</strong>. Not bad for a family operation. Pull up a stool and let's look back at the whole story so far.`
          : `The bar has spoken, the drinks have been counted, and the verdict is in: <strong>${stats.month}</strong> was a <em>vintage</em> month. <strong style="color:#8B1538;">${stats.totalDrinksOrdered} drinks</strong> poured across <strong style="color:#8B1538;">${stats.totalOrders} orders</strong>. Not bad for a family operation. Pull up a stool and let's break it down.`
        }
      </p>
    </div>

    ${noOrders ? '' : `
    <!-- By the Numbers -->
    <div style="padding:32px;border-bottom:2px solid #F0EDE8;">
      <h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:18px;color:#8B1538;text-transform:uppercase;letter-spacing:2px;border-left:4px solid #FFD700;padding-left:12px;">By the Numbers</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${statRows.map((row, i) => `
        <tr style="background:${i % 2 === 0 ? '#F5F5DC' : '#FAFAF5'};">
          <td style="padding:11px 14px;font-size:14px;color:#555;">${row.label}</td>
          <td style="padding:11px 14px;font-size:14px;font-weight:bold;color:#8B1538;text-align:right;">${row.value}</td>
        </tr>`).join('')}
      </table>
    </div>

    <!-- Top Drinks -->
    ${stats.topDrinks.length > 0 ? `
    <div style="padding:32px;border-bottom:2px solid #F0EDE8;">
      <h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:18px;color:#8B1538;text-transform:uppercase;letter-spacing:2px;border-left:4px solid #FFD700;padding-left:12px;">The Hit Parade 🏆</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#666;">${isAllTime ? 'The most-requested pours of all time:' : "This month's most-requested pours:"}</p>
      ${stats.topDrinks.map((d, i) => `
      <div style="display:flex;align-items:center;margin-bottom:8px;padding:12px 14px;background:${i === 0 ? '#8B1538' : '#F5F5DC'};border-radius:8px;">
        <span style="font-size:18px;margin-right:12px;">${['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
        <span style="flex:1;font-size:15px;color:${i === 0 ? '#FFD700' : '#2d2d2d'};font-weight:${i === 0 ? 'bold' : 'normal'};">${d.name}</span>
        <span style="font-size:13px;color:${i === 0 ? '#FFD700' : '#8B1538'};font-weight:bold;">${d.count}x</span>
      </div>`).join('')}
    </div>` : ''}

    <!-- Custom Creations -->
    ${stats.customDrinks.length > 0 ? `
    <div style="padding:32px;border-bottom:2px solid #F0EDE8;">
      <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:18px;color:#8B1538;text-transform:uppercase;letter-spacing:2px;border-left:4px solid #FFD700;padding-left:12px;">The Mad Scientist Corner 🧪</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#666;">Nobody asked for these. Somebody made them anyway.</p>
      ${stats.customDrinks.map((c) => `
      <div style="margin-bottom:8px;padding:12px 14px;background:#F5F5DC;border-radius:8px;border-left:3px solid #8B1538;">
        <p style="margin:0;font-size:14px;color:#2d2d2d;"><strong style="color:#8B1538;">${c.name}</strong>${c.count > 1 ? ` <span style="font-size:12px;color:#8B1538;">(ordered ${c.count}x)</span>` : ''}</p>
        ${c.note ? `<p style="margin:4px 0 0;font-size:13px;color:#666;font-style:italic;">"${c.note}"</p>` : ''}
      </div>`).join('')}
    </div>` : ''}

    <!-- Guest Spotlight -->
    ${topGuest ? `
    <div style="padding:32px;border-bottom:2px solid #F0EDE8;background:#FDF8F0;">
      <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:18px;color:#8B1538;text-transform:uppercase;letter-spacing:2px;border-left:4px solid #FFD700;padding-left:12px;">Guest Spotlight 🌟</h2>
      <p style="margin:0 0 10px;font-size:16px;color:#2d2d2d;">
        ${isAllTime ? 'The all-time MVP of the bar cart' : "This month's MVP of the bar cart"}: <strong style="color:#8B1538;">${topGuest.name}</strong>
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:#555;">
        With <strong>${topGuest.drinkCount} drinks</strong> across <strong>${topGuest.orderCount} order${topGuest.orderCount !== 1 ? 's' : ''}</strong>, ${topGuest.name} carried the bar on their back${isAllTime ? '' : ' this month'}. Whether they were the life of the party or simply very, very thirsty, we salute them. Hydration is important.
      </p>
      ${stats.topGuests.length > 1 ? `
      <div style="padding:14px;background:#F5F5DC;border-radius:8px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8B1538;font-weight:bold;">Also giving it their all:</p>
        ${stats.topGuests.slice(1).map(g => `
        <p style="margin:4px 0;font-size:13px;color:#555;">• <strong style="color:#2d2d2d;">${g.name}</strong>: ${g.drinkCount} drink${g.drinkCount !== 1 ? 's' : ''}</p>`).join('')}
      </div>` : ''}
    </div>` : ''}

    <!-- Bartender's Diaries -->
    <div style="padding:32px;border-bottom:2px solid #F0EDE8;">
      <h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:18px;color:#8B1538;text-transform:uppercase;letter-spacing:2px;border-left:4px solid #FFD700;padding-left:12px;">The Bartender's Diaries 📓</h2>
      ${stats.busiestHour ? `
      <div style="margin-bottom:12px;padding:14px;background:#F5F5DC;border-radius:8px;border-left:3px solid #8B1538;">
        <p style="margin:0;font-size:14px;color:#2d2d2d;">⏰ <strong>Rush Hour:</strong> The bar hit peak chaos at <strong style="color:#8B1538;">${formatHour(stats.busiestHour.hour)}</strong> with ${stats.busiestHour.count} orders flying in. The bartender was not amused. The guests were.</p>
      </div>` : ''}
      ${stats.avgCompletionMinutes !== null ? `
      <div style="margin-bottom:12px;padding:14px;background:#F5F5DC;border-radius:8px;border-left:3px solid #8B1538;">
        <p style="margin:0;font-size:14px;color:#2d2d2d;">⚡ <strong>Speed of Service:</strong> Average completion time clocked in at <strong style="color:#8B1538;">${stats.avgCompletionMinutes} minutes</strong>. ${stats.avgCompletionMinutes <= 5 ? "Impressively fast. Our bartender deserves a raise." : stats.avgCompletionMinutes <= 10 ? "A respectable pour time. Craftsmanship takes time." : "Good things come to those who wait. And wait. And wait."}</p>
      </div>` : ''}
      ${stats.longestOrder ? `
      <div style="margin-bottom:12px;padding:14px;background:#F5F5DC;border-radius:8px;border-left:3px solid #8B1538;">
        <p style="margin:0;font-size:14px;color:#2d2d2d;">🐢 <strong>The Long Pour Award:</strong> ${stats.longestOrder.guestName}'s order took a heroic <strong style="color:#8B1538;">${stats.longestOrder.minutes} minutes</strong> to complete${stats.longestOrder.drinks.length > 0 ? ` (${stats.longestOrder.drinks.join(', ')})` : ''}. Worth the wait, we're sure.</p>
      </div>` : ''}
      ${stats.customDrinkCount > 0 ? `
      <div style="padding:14px;background:#F5F5DC;border-radius:8px;border-left:3px solid #8B1538;">
        <p style="margin:0;font-size:14px;color:#2d2d2d;">🎨 <strong>Creative License:</strong> <strong style="color:#8B1538;">${stats.customDrinkCount} custom creation${stats.customDrinkCount !== 1 ? 's' : ''}</strong> were ordered${isAllTime ? '' : ' this month'}. Someone came in with a vision. We respect that.</p>
      </div>` : ''}
    </div>

    <!-- Drink of the Month -->
    <div style="padding:32px;border-bottom:2px solid #F0EDE8;background:#8B1538;">
      <h2 style="margin:0 0 4px;font-family:Georgia,serif;font-size:18px;color:#FFD700;text-transform:uppercase;letter-spacing:2px;">${isAllTime ? 'Next Round On Us' : 'Drink of the Month'} ✨</h2>
      <p style="margin:0 0 20px;font-size:12px;color:rgba(255,255,255,0.6);letter-spacing:1px;text-transform:uppercase;">The Connerseur Recommends</p>
      <h3 style="margin:0 0 4px;font-family:Georgia,serif;font-size:22px;color:#FFFFFF;">${drink.twist.twistName}</h3>
      <p style="margin:0 0 16px;font-size:13px;color:rgba(255,255,255,0.6);font-style:italic;">Built off ${drink.name}, the drink that earned it.</p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.85);">${drink.description}</p>
      <div style="padding:16px;background:rgba(0,0,0,0.25);border-radius:8px;border-left:3px solid #FFD700;">
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#FFD700;font-weight:bold;">The Recipe</p>
        <ul style="margin:0 0 14px;padding-left:18px;font-size:14px;line-height:1.8;color:#F5F5DC;">
          ${drink.twist.build.map((line) => `<li>${line}</li>`).join('')}
        </ul>
        <p style="margin:0 0 6px;font-size:13px;line-height:1.7;color:#F5F5DC;"><strong style="color:#FFD700;">Method:</strong> ${drink.twist.method}</p>
        <p style="margin:0 0 6px;font-size:13px;line-height:1.7;color:#F5F5DC;"><strong style="color:#FFD700;">Garnish:</strong> ${drink.twist.garnish}</p>
        <p style="margin:0;font-size:13px;line-height:1.7;color:#F5F5DC;"><strong style="color:#FFD700;">Glass:</strong> ${drink.twist.glass}</p>
      </div>
    </div>
    `}

    <!-- Footer -->
    <div style="height:4px;background:linear-gradient(90deg,#8B1538,#FFD700,#8B1538);"></div>
    <div style="padding:28px 32px;text-align:center;background:#2d2d2d;">
      <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:15px;color:#FFD700;font-style:italic;">${isAllTime ? 'Here\'s to many more rounds' : 'Until next month, may your glass be full'}</p>
      <p style="margin:0 0 16px;font-size:13px;color:rgba(255,255,255,0.5);">and your orders never cancelled.</p>
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:2px;text-transform:uppercase;">The Connerseur &nbsp;•&nbsp; ${isAllTime ? stats.year : `${stats.month} ${stats.year}`}</p>
    </div>

  </div>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const isTest = request.nextUrl.searchParams.get('test') === 'true';
  const isPreview = request.nextUrl.searchParams.get('preview') === 'true';
  const isAllTime = request.nextUrl.searchParams.get('range') === 'all';
  const bartenderKey = request.nextUrl.searchParams.get('key');

  if (isTest || isPreview) {
    if (bartenderKey !== process.env.BARTENDER_DASH_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const recipients = isTest ? ['Nicholasc.conner@gmail.com'] : RECIPIENTS;

  try {
    const now = new Date();
    // In test mode use current month, otherwise last month; range=all ignores both
    const firstOfLastMonth = isTest
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstOfThisMonth = isTest
      ? new Date(now.getFullYear(), now.getMonth() + 1, 1)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    let ordersQuery = supabaseAdmin.from('orders').select('*').order('created_at', { ascending: true });
    if (!isAllTime) {
      ordersQuery = ordersQuery
        .gte('created_at', firstOfLastMonth.toISOString())
        .lt('created_at', firstOfThisMonth.toISOString());
    }
    const { data: ordersData, error: ordersError } = await ordersQuery;

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    const orders: Order[] = ordersData || [];
    let ordersWithItems: OrderWithItems[] = [];

    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      const { data: itemsData } = await supabaseAdmin
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      ordersWithItems = orders.map((order) => ({
        ...order,
        order_items: (itemsData || []).filter((item: OrderItem) => item.order_id === order.id),
      }));
    }

    const { data: menuItems } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('is_active', true);

    const monthLabelText = isAllTime ? 'All-Time' : (isTest ? now : firstOfLastMonth).toLocaleString('default', { month: 'long' });
    const yearLabelText = isAllTime
      ? `Through ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`
      : String((isTest ? now : firstOfLastMonth).getFullYear());

    const stats = computeStats(ordersWithItems, monthLabelText, yearLabelText);
    const html = generateNewsletter(stats, (menuItems as MenuItem[]) || [], isAllTime);

    const periodLabel = `${stats.month} ${stats.year}`;

    if (isPreview) {
      return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    await sendEmail(recipients, `🍷 The Connerseur: ${periodLabel} Sip Report`, html);

    return NextResponse.json({ success: true, period: periodLabel, totalOrders: stats.totalOrders });
  } catch (error) {
    console.error('Monthly report error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal server error', detail: message }, { status: 500 });
  }
}
