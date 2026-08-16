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

// Shown as a banner near the top of the newsletter when non-empty. Clear this out once
// the announcement has gone stale (e.g. after a month or two).
const FEATURE_ALERTS: { title: string; body: string }[] = [
  {
    title: 'Search the Menu',
    body: 'The guest ordering page now has a search bar right up top. Know you want a martini, or just know you are in the mood for tequila? Type it in. It matches drink names, liquor type, and category in real time, so you can jump straight to what you want instead of scrolling the whole list.',
  },
];

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
  drinkName: string;
  build: string[];
  method: string;
  garnish: string;
  glass: string;
}

type SpiritFamily = 'whiskey' | 'gin' | 'vodka' | 'tequila' | 'rum' | 'other';

function classifyFamily(ingredients: string): SpiritFamily | null {
  const s = ingredients.toLowerCase();
  if (/bourbon|\brye\b|whiskey|whisky|scotch/.test(s)) return 'whiskey';
  if (/\bgin\b/.test(s)) return 'gin';
  if (/vodka/.test(s)) return 'vodka';
  if (/tequila|mezcal/.test(s)) return 'tequila';
  if (/\brum\b/.test(s)) return 'rum';
  return null;
}

// Recommendations for drinks that are NOT currently in menu_items, grouped by the
// spirit family they belong to. Picked to be genuinely new additions, not twists on
// something already on the menu. Each family has a couple of options in case the
// first pick ever ends up getting added to the real menu.
const OFF_MENU_LIBRARY: Record<SpiritFamily, RecipeTwist[]> = {
  whiskey: [
    {
      drinkName: 'New York Sour',
      build: ['2 oz Bourbon', '0.75 oz Fresh Lemon Juice', '0.75 oz Simple Syrup', '0.5 oz Dry Red Wine, floated on top'],
      method: 'Shake the bourbon, lemon, and syrup hard with ice for 10 seconds. Strain into a rocks glass over one large cube. Slowly pour the red wine over the back of a spoon so it sits on top.',
      garnish: 'Lemon twist. Let the wine float be the show.',
      glass: 'Rocks glass',
    },
    {
      drinkName: 'Kentucky Mule',
      build: ['2 oz Bourbon', '0.5 oz Fresh Lime Juice', '4 oz Ginger Beer'],
      method: 'Build over ice in a copper mug, bourbon and lime first, top with ginger beer, stir once.',
      garnish: 'Lime wheel, candied ginger.',
      glass: 'Copper mug',
    },
  ],
  gin: [
    {
      drinkName: 'Clover Club',
      build: ['2 oz Gin', '0.75 oz Fresh Lemon Juice', '0.5 oz Raspberry Syrup', '1 Egg White'],
      method: 'Dry shake without ice for 15 seconds, then add ice and shake hard for 15 more. Double strain into a chilled coupe.',
      garnish: 'Three fresh raspberries on a pick.',
      glass: 'Coupe',
    },
    {
      drinkName: 'Southside',
      build: ['2 oz Gin', '0.75 oz Fresh Lime Juice', '0.75 oz Simple Syrup', '6 to 8 fresh mint leaves'],
      method: 'Shake hard with ice for 10 seconds. Double strain into a chilled coupe.',
      garnish: 'Mint sprig.',
      glass: 'Coupe',
    },
  ],
  vodka: [
    {
      drinkName: 'Bloody Mary',
      build: ['2 oz Vodka', '4 oz Tomato Juice', '0.5 oz Fresh Lemon Juice', '2 dashes Worcestershire Sauce', '2 dashes Hot Sauce', 'Pinch of Celery Salt and Black Pepper'],
      method: 'Combine in a shaker with ice, roll gently to mix without over-diluting. Strain into a highball over fresh ice.',
      garnish: 'Celery stalk, lemon wedge, olives.',
      glass: 'Highball',
    },
    {
      drinkName: 'Sea Breeze',
      build: ['1.5 oz Vodka', '3 oz Cranberry Juice', '1 oz Fresh Grapefruit Juice'],
      method: 'Build over ice in a highball, stir once.',
      garnish: 'Lime wedge.',
      glass: 'Highball',
    },
  ],
  tequila: [
    {
      drinkName: 'Ranch Water',
      build: ['2 oz Tequila', '0.5 oz Fresh Lime Juice', 'Topo Chico or other sparkling mineral water to top'],
      method: 'Build over ice, tequila and lime first, top with sparkling water, stir once.',
      garnish: 'Lime wedge.',
      glass: 'Highball',
    },
    {
      drinkName: 'El Diablo',
      build: ['1.5 oz Tequila', '0.5 oz Creme de Cassis', '0.5 oz Fresh Lime Juice', '3 oz Ginger Beer'],
      method: 'Build over ice in a highball, stir once.',
      garnish: 'Lime wheel.',
      glass: 'Highball',
    },
  ],
  rum: [
    {
      drinkName: 'Painkiller',
      build: ['2 oz Dark Rum', '4 oz Pineapple Juice', '1 oz Cream of Coconut', '0.5 oz Fresh Orange Juice'],
      method: 'Shake hard with ice for 10 seconds. Strain over crushed ice.',
      garnish: 'Fresh grated nutmeg, pineapple wedge.',
      glass: 'Rocks glass',
    },
    {
      drinkName: 'Hurricane',
      build: ['1 oz Light Rum', '1 oz Dark Rum', '1 oz Fresh Orange Juice', '1 oz Fresh Lime Juice', '0.5 oz Grenadine', '0.5 oz Passion Fruit Syrup'],
      method: 'Shake hard with ice for 10 seconds. Strain over fresh ice.',
      garnish: 'Orange slice, cherry.',
      glass: 'Hurricane glass, or a big rocks glass',
    },
  ],
  other: [
    {
      drinkName: 'Ranch Water',
      build: ['2 oz Tequila', '0.5 oz Fresh Lime Juice', 'Topo Chico or other sparkling mineral water to top'],
      method: 'Build over ice, tequila and lime first, top with sparkling water, stir once.',
      garnish: 'Lime wedge.',
      glass: 'Highball',
    },
  ],
};

const FAMILY_LABEL: Record<SpiritFamily, string> = {
  whiskey: 'whiskey-forward',
  gin: 'gin-forward',
  vodka: 'vodka-forward',
  tequila: 'tequila-forward',
  rum: 'rum-forward',
  other: 'house',
};

function suggestFutureDrink(topDrinks: { name: string; count: number }[], menuItems: MenuItem[], isAllTime = false): { description: string; twist: RecipeTwist } {
  const familyScores: Partial<Record<SpiritFamily, number>> = {};
  const familyExamples: Partial<Record<SpiritFamily, string[]>> = {};

  for (const d of topDrinks) {
    const item = menuItems.find((m) => m.name.toLowerCase() === d.name.toLowerCase());
    if (!item || item.category !== 'Cocktails') continue;
    const family = classifyFamily(item.ingredients);
    if (!family) continue;
    familyScores[family] = (familyScores[family] || 0) + d.count;
    (familyExamples[family] = familyExamples[family] || []).push(d.name);
  }

  const ranked = (Object.entries(familyScores) as [SpiritFamily, number][]).sort((a, b) => b[1] - a[1]);
  const topFamily: SpiritFamily = ranked[0]?.[0] || 'other';
  const examples = familyExamples[topFamily] || [];

  const existingNames = new Set(menuItems.map((m) => m.name.toLowerCase()));
  const candidates = OFF_MENU_LIBRARY[topFamily];
  const twist = candidates.find((c) => !existingNames.has(c.drinkName.toLowerCase())) || candidates[0];

  const period = isAllTime ? 'since day one' : 'this month';
  const description = examples.length > 0
    ? `${examples.slice(0, 2).join(' and ')} ${examples.length > 1 ? 'have' : 'has'} been carrying the ${FAMILY_LABEL[topFamily]} lineup ${period}. Here's something in that same lane that isn't on the menu yet.`
    : `No clean pattern yet, so here's a crowd-pleaser worth adding to the lineup.`;

  return { description, twist };
}

function generateNewsletter(stats: MonthlyStats, menuItems: MenuItem[], isAllTime = false): string {
  const noOrders = stats.totalOrders === 0;
  const drink = suggestFutureDrink(stats.topDrinks, menuItems, isAllTime);
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

    <!-- Feature Alerts -->
    ${FEATURE_ALERTS.length > 0 ? `
    <div style="padding:24px 32px;border-bottom:2px solid #F0EDE8;background:#FDF6E3;">
      ${FEATURE_ALERTS.map((f) => `
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <span style="font-size:20px;">📣</span>
        <div>
          <p style="margin:0 0 4px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#8B1538;font-weight:bold;">New Feature Alert</p>
          <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#2d2d2d;">${f.title}</p>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#555;">${f.body}</p>
        </div>
      </div>`).join('<div style="height:16px;"></div>')}
    </div>` : ''}

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
      <h3 style="margin:0 0 4px;font-family:Georgia,serif;font-size:22px;color:#FFFFFF;">${drink.twist.drinkName}</h3>
      <p style="margin:0 0 16px;font-size:13px;color:rgba(255,255,255,0.6);font-style:italic;">Not on the menu. Yet.</p>
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
  const isManualSend = request.nextUrl.searchParams.get('send') === 'true';
  const isAllTime = request.nextUrl.searchParams.get('range') === 'all';
  const toParam = request.nextUrl.searchParams.get('to');
  const bartenderKey = request.nextUrl.searchParams.get('key');

  if (isTest || isPreview || isManualSend) {
    if (bartenderKey !== process.env.BARTENDER_DASH_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const manualRecipients = toParam ? toParam.split(',').map((e) => e.trim()).filter(Boolean) : null;
  const recipients = isManualSend && manualRecipients ? manualRecipients : isTest ? ['Nicholasc.conner@gmail.com'] : RECIPIENTS;

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

    // Fetch the full library (not just is_active) so the "not on the menu" recommendation
    // never suggests something already sitting in the recipe library, toggled off or not.
    const { data: menuItems } = await supabaseAdmin
      .from('menu_items')
      .select('*');

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
