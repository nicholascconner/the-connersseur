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

// --- GUEST NOTIFICATIONS ---
export function sendGuestOrderConfirmedSMS(phone: string, orderNumber: number) {
  const body = `Your order #${orderNumber} is in! We're not wine-ing about it — your drinks are queued up and the bartender has been notified. Sit tight! 🍷`;
  sendSMS(formatPhone(phone), body);
}

export function sendGuestOrderInProgressSMS(phone: string, orderNumber: number) {
  const body = `Shaken, not forgotten! Order #${orderNumber} is being crafted right now. Your bartender is pouring their heart (and spirits) into it. 🧊`;
  sendSMS(formatPhone(phone), body);
}

export function sendGuestOrderCompletedSMS(phone: string, orderNumber: number) {
  const body = `It's the moment you've been waiting pour! Order #${orderNumber} is ready for pickup. Come and get it before the ice gets lonely! 🥂`;
  sendSMS(formatPhone(phone), body);
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
