import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import nodemailer from 'nodemailer';
import { OrderWithItems, Order, OrderItem, MenuItem } from '@/types';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: 'Nicholasc.conner@gmail.com',
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
});

const RECIPIENTS = ['Nicholasc.conner@gmail.com', 'econnertx@outlook.com'];

interface MonthlyStats {
  month: string;
  year: number;
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
}

function computeStats(orders: OrderWithItems[]): MonthlyStats {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthName = lastMonth.toLocaleString('default', { month: 'long' });

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
    month: monthName,
    year: lastMonth.getFullYear(),
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
  };
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

function suggestDrinkOfMonth(topDrinks: { name: string; count: number }[], menuItems: MenuItem[]): { name: string; description: string; recipe: string } {
  const inspiration = topDrinks[0]?.name || menuItems[0]?.name || 'the classics';
  return {
    name: `The "${inspiration}" Remix`,
    description: `Inspired by ${inspiration} being the crowd favorite this month, we're shaking things up with a twist on a beloved classic.`,
    recipe: `Take everything you love about ${inspiration} and add a splash of something unexpected — a dash of fresh citrus, a hint of herb, or a float of something sparkling. Experiment and make it your own. That's the Connersseur way.`,
  };
}

function generateNewsletter(stats: MonthlyStats, menuItems: MenuItem[]): string {
  const noOrders = stats.totalOrders === 0;
  const drink = suggestDrinkOfMonth(stats.topDrinks, menuItems);
  const topGuest = stats.topGuests[0];

  const punnyTitles: Record<string, string> = {
    January: 'New Year, New Pour',
    February: 'Love at First Sip',
    March: 'March Sadness (No Bracket for This)',
    April: 'April Pours',
    May: 'May the Best Drink Win',
    June: 'Juneteenth Cheers',
    July: 'Red, White & Booze',
    August: 'The Dog Days of Drinking',
    September: 'Sip Sip Hooray, Fall is Here',
    October: 'Things Are Getting Spirited',
    November: 'Grateful for the Good Stuff',
    December: 'The Most Wonderful Time for a Drink',
  };

  const title = punnyTitles[stats.month] || `The ${stats.month} Sip Report`;

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
  <title>The Connersseur — ${stats.month} ${stats.year}</title>
</head>
<body style="margin:0;padding:0;background:#0f0515;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#1a0a2e;color:#f5f0e8;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a0a2e 0%,#3d1060 100%);padding:40px 32px;text-align:center;border-bottom:3px solid #c9a84c;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:4px;text-transform:uppercase;color:#c9a84c;">The Connersseur</p>
      <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:28px;color:#f5f0e8;">${title}</h1>
      <p style="margin:0;font-size:14px;color:#c9a84c;">${stats.month} ${stats.year} &nbsp;•&nbsp; Monthly Sip Report</p>
    </div>

    <!-- Opening -->
    <div style="padding:32px;border-bottom:1px solid #3d1060;">
      <p style="margin:0;font-size:16px;line-height:1.7;color:#e8ddd0;">
        ${noOrders
          ? `It was a quiet month at The Connersseur — the glasses were clean, the bar was still, and the ice sat untouched. Consider this the calm before the pour. We'll be back next month with more to report.`
          : `The bar has spoken, the drinks have been counted, and the verdict is in: ${stats.month} was a <em>vintage</em> month. ${stats.totalDrinksOrdered} drinks poured across ${stats.totalOrders} orders — not bad for a family operation. Pull up a stool and let's break it down.`
        }
      </p>
    </div>

    ${noOrders ? '' : `
    <!-- By the Numbers -->
    <div style="padding:32px;border-bottom:1px solid #3d1060;">
      <h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:20px;color:#c9a84c;text-transform:uppercase;letter-spacing:2px;">By the Numbers</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${statRows.map((row, i) => `
        <tr style="background:${i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent'};">
          <td style="padding:10px 12px;font-size:14px;color:#b8a898;">${row.label}</td>
          <td style="padding:10px 12px;font-size:14px;font-weight:bold;color:#f5f0e8;text-align:right;">${row.value}</td>
        </tr>`).join('')}
      </table>
    </div>

    <!-- Top Drinks -->
    ${stats.topDrinks.length > 0 ? `
    <div style="padding:32px;border-bottom:1px solid #3d1060;">
      <h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:20px;color:#c9a84c;text-transform:uppercase;letter-spacing:2px;">The Hit Parade 🏆</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#b8a898;">This month's most-requested pours:</p>
      ${stats.topDrinks.map((d, i) => `
      <div style="display:flex;align-items:center;margin-bottom:10px;padding:10px 14px;background:rgba(201,168,76,${0.08 - i * 0.01});border-left:3px solid ${i === 0 ? '#c9a84c' : '#3d1060'};border-radius:0 4px 4px 0;">
        <span style="font-size:18px;margin-right:12px;">${['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
        <span style="flex:1;font-size:15px;color:#f5f0e8;">${d.name}</span>
        <span style="font-size:13px;color:#c9a84c;font-weight:bold;">${d.count}x</span>
      </div>`).join('')}
    </div>` : ''}

    <!-- Guest Spotlight -->
    ${topGuest ? `
    <div style="padding:32px;border-bottom:1px solid #3d1060;background:rgba(139,26,74,0.15);">
      <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:20px;color:#c9a84c;text-transform:uppercase;letter-spacing:2px;">Guest Spotlight 🌟</h2>
      <p style="margin:0 0 12px;font-size:16px;color:#f5f0e8;">
        This month's MVP of the bar cart: <strong style="color:#c9a84c;">${topGuest.name}</strong>
      </p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#b8a898;">
        With <strong style="color:#f5f0e8;">${topGuest.drinkCount} drinks</strong> across <strong style="color:#f5f0e8;">${topGuest.orderCount} order${topGuest.orderCount !== 1 ? 's' : ''}</strong>, ${topGuest.name} carried the bar on their back this month. Whether they were the life of the party or simply very, very thirsty — we salute them. Hydration is important.
      </p>
      ${stats.topGuests.length > 1 ? `
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #3d1060;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8b6a9a;">Also giving it their all:</p>
        ${stats.topGuests.slice(1).map(g => `
        <p style="margin:4px 0;font-size:13px;color:#b8a898;">• <strong style="color:#e8ddd0;">${g.name}</strong> — ${g.drinkCount} drink${g.drinkCount !== 1 ? 's' : ''}</p>`).join('')}
      </div>` : ''}
    </div>` : ''}

    <!-- Bartender's Diaries -->
    <div style="padding:32px;border-bottom:1px solid #3d1060;">
      <h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:20px;color:#c9a84c;text-transform:uppercase;letter-spacing:2px;">The Bartender's Diaries 📓</h2>
      ${stats.busiestHour ? `
      <div style="margin-bottom:16px;padding:14px;background:rgba(255,255,255,0.04);border-radius:6px;">
        <p style="margin:0;font-size:14px;color:#b8a898;">⏰ <strong style="color:#f5f0e8;">Rush Hour:</strong> The bar hit peak chaos at <strong style="color:#c9a84c;">${formatHour(stats.busiestHour.hour)}</strong> with ${stats.busiestHour.count} orders flying in. The bartender was not amused. The guests were.</p>
      </div>` : ''}
      ${stats.avgCompletionMinutes !== null ? `
      <div style="margin-bottom:16px;padding:14px;background:rgba(255,255,255,0.04);border-radius:6px;">
        <p style="margin:0;font-size:14px;color:#b8a898;">⚡ <strong style="color:#f5f0e8;">Speed of Service:</strong> Average completion time clocked in at <strong style="color:#c9a84c;">${stats.avgCompletionMinutes} minutes</strong>. ${stats.avgCompletionMinutes <= 5 ? "Impressively fast. Our bartender deserves a raise." : stats.avgCompletionMinutes <= 10 ? "A respectable pour time. Craftsmanship takes time." : "Good things come to those who wait. And wait. And wait."}</p>
      </div>` : ''}
      ${stats.longestOrder ? `
      <div style="margin-bottom:16px;padding:14px;background:rgba(255,255,255,0.04);border-radius:6px;">
        <p style="margin:0;font-size:14px;color:#b8a898;">🐢 <strong style="color:#f5f0e8;">The Long Pour Award:</strong> ${stats.longestOrder.guestName}'s order took a heroic <strong style="color:#c9a84c;">${stats.longestOrder.minutes} minutes</strong> to complete${stats.longestOrder.drinks.length > 0 ? ` (${stats.longestOrder.drinks.join(', ')})` : ''}. Worth the wait, we're sure.</p>
      </div>` : ''}
      ${stats.customDrinkCount > 0 ? `
      <div style="padding:14px;background:rgba(255,255,255,0.04);border-radius:6px;">
        <p style="margin:0;font-size:14px;color:#b8a898;">🎨 <strong style="color:#f5f0e8;">Creative License:</strong> <strong style="color:#c9a84c;">${stats.customDrinkCount} custom creation${stats.customDrinkCount !== 1 ? 's' : ''}</strong> were ordered this month. Someone came in with a vision. We respect that.</p>
      </div>` : ''}
    </div>

    <!-- Drink of the Month -->
    <div style="padding:32px;border-bottom:1px solid #3d1060;background:rgba(201,168,76,0.06);">
      <h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:20px;color:#c9a84c;text-transform:uppercase;letter-spacing:2px;">Drink of the Month ✨</h2>
      <p style="margin:0 0 20px;font-size:12px;color:#8b6a9a;letter-spacing:1px;text-transform:uppercase;">The Connersseur Recommends</p>
      <h3 style="margin:0 0 12px;font-family:Georgia,serif;font-size:22px;color:#f5f0e8;">${drink.name}</h3>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#b8a898;">${drink.description}</p>
      <div style="padding:16px;background:rgba(0,0,0,0.3);border-radius:6px;border-left:3px solid #c9a84c;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;">The Recipe</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#e8ddd0;">${drink.recipe}</p>
      </div>
    </div>
    `}

    <!-- Footer -->
    <div style="padding:32px;text-align:center;background:#0f0515;">
      <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:16px;color:#c9a84c;">Until next month — may your glass be full</p>
      <p style="margin:0 0 20px;font-size:13px;color:#6b5a7a;">and your orders never cancelled.</p>
      <p style="margin:0;font-size:11px;color:#4a3a5a;letter-spacing:2px;text-transform:uppercase;">The Connersseur &nbsp;•&nbsp; ${stats.month} ${stats.year}</p>
    </div>

  </div>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: ordersData, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .gte('created_at', firstOfLastMonth.toISOString())
      .lt('created_at', firstOfThisMonth.toISOString())
      .order('created_at', { ascending: true });

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

    const stats = computeStats(ordersWithItems);
    const html = generateNewsletter(stats, (menuItems as MenuItem[]) || []);

    const monthLabel = `${stats.month} ${stats.year}`;
    await transporter.sendMail({
      from: '"The Connersseur" <Nicholasc.conner@gmail.com>',
      to: RECIPIENTS.join(', '),
      subject: `🍷 The Connersseur — ${monthLabel} Sip Report`,
      html,
    });

    return NextResponse.json({ success: true, month: monthLabel, totalOrders: stats.totalOrders });
  } catch (error) {
    console.error('Monthly report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
