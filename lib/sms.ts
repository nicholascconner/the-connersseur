import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const bartenderPhone = process.env.BARTENDER_PHONE || '4698789400';

function getClient() {
  if (!accountSid || !authToken) return null;
  return twilio(accountSid, authToken);
}

// Format phone to E.164 (assumes US numbers)
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}

// Build a drink summary string from order items
function drinkSummary(items: { item_name: string; quantity: number }[]): string {
  return items
    .map((i) => (i.quantity > 1 ? `${i.quantity}x ${i.item_name}` : i.item_name))
    .join(', ');
}

// --- BARTENDER NOTIFICATION ---
export function sendBartenderNewOrderSMS(order: {
  order_number: number;
  guest_name: string;
  items: { item_name: string; quantity: number }[];
}) {
  const body = `🍸 New order #${order.order_number} from ${order.guest_name}: ${drinkSummary(order.items)}`;
  sendSMS(formatPhone(bartenderPhone), body);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- GUEST NOTIFICATIONS ---
export function sendGuestOrderConfirmedSMS(phone: string, orderNumber: number) {
  const n = orderNumber;
  const messages = [
    `Your order #${n} is in! We're not wine-ing about it — your drinks are queued up and the bartender has been notified. Sit tight! 🍷`,
    `You've just placed a very Connerseur-level order. Order #${n}. Your sips are lining up! Stay tuned for deliciousness.`,
    `Order #${n} is being uncorked in our system, and getting the VIP treatment at the bar while we queue up the perfect pour. Great taste never goes unnoticed here.`,
    `Your inner Connerseur just made an excellent call with Order #${n}. Your order has been received, the bartender's on alert, and your next round of joy is now officially upcoming.`,
  ];
  sendSMS(formatPhone(phone), pick(messages));
}

export function sendGuestOrderInProgressSMS(phone: string, orderNumber: number) {
  const n = orderNumber;
  const messages = [
    `Shaken, not forgotten! Order #${n} is being crafted right now. Your bartender is pouring their heart (and spirits) into it. 🧊`,
    `Connerseur magic in progress. Order #${n} is swirling behind the bar right now while your bartender fine-tunes every last drop.`,
    `Your inner Connerseur has been heard. Order #${n} is in the shaker and our bartender is crafting it with top-shelf care.`,
    `From click to clink, we're on it. Order #${n} is being mixed behind the bar—custom-built for your excellent taste.`,
  ];
  sendSMS(formatPhone(phone), pick(messages));
}

export function sendGuestOrderCompletedSMS(phone: string, orderNumber: number) {
  const n = orderNumber;
  const messages = [
    `It's the moment you've been waiting pour! Order #${n} is ready for pickup. Come and get it before the ice gets lonely! 🥂`,
    `Your Connerseur moment has arrived. Order #${n} is ready for pickup—come claim your sips before the ice starts practicing a backstroke.`,
    `From our bar to your hands, just like a true Connerseur. Order #${n} is poured, ready, and waiting—swing by and make it official.`,
    `Your next round of joy is ready. Order #${n} is chilled, crafted, and ready for pickup—come rescue your drink before the bartender drinks it himself.`,
    `Your Connerseur creation is ready and waiting. Come grab Order #${n} before the ice melts and the bartender starts questioning whether to welcome you back.`,
  ];
  sendSMS(formatPhone(phone), pick(messages));
}

// --- LOW-LEVEL SEND ---
async function sendSMS(to: string, body: string) {
  const client = getClient();
  if (!client || !twilioPhone) {
    console.log(`SMS skipped (Twilio not configured): ${body}`);
    return;
  }
  try {
    const message = await client.messages.create({
      body,
      from: formatPhone(twilioPhone),
      to,
    });
    console.log(`SMS sent to ${to}: ${message.sid}`);
  } catch (error) {
    console.error(`Failed to send SMS to ${to}:`, error);
  }
}
