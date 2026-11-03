// Booking-confirmation SMS, shaped for text.lk per the POS proposal's own
// recommendation (a local Sri Lankan gateway - far cheaper than a global
// provider for a Sri Lanka-only audience, with built-in OTP support if that's
// ever wired up too). No account exists yet: without TEXT_LK_API_KEY this
// logs instead of sending and never throws, so nothing that calls it needs
// to handle an SMS failure as anything but a no-op.
//
// IMPORTANT: the endpoint/payload shape below is text.lk's documented REST
// API as of this writing - verify it against their current docs
// (https://text.lk) before relying on it in production, same caveat the
// original POS proposal makes about every third-party price/API figure.

const TEXT_LK_SEND_URL = "https://app.text.lk/api/v3/sms/send";

export interface BookingSmsDetails {
  courtName: string;
  bookingDate: string; // yyyy-mm-dd
  startTime: string; // HH:MM or HH:MM:SS
  bookingRef: string; // full booking id - caller may shorten it
}

function formatMessage({ courtName, bookingDate, startTime, bookingRef }: BookingSmsDetails): string {
  const [y, m, d] = bookingDate.split("-").map(Number);
  const date = new Date(y, m - 1, d).toLocaleDateString("en-LK", { month: "short", day: "numeric" });
  const ref = bookingRef.slice(0, 8).toUpperCase();
  return `Pickle Rush: booking confirmed - ${courtName} on ${date} at ${startTime.slice(0, 5)}. Ref ${ref}. Show this at the counter.`;
}

// Normalizes to the digits-only local format text.lk expects (947XXXXXXXX),
// accepting the +94/0-prefixed forms already used throughout this app's
// phone inputs.
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("94")) return digits;
  if (digits.startsWith("0")) return `94${digits.slice(1)}`;
  return `94${digits}`;
}

export async function sendBookingSms(toPhone: string, details: BookingSmsDetails): Promise<void> {
  const apiKey = process.env.TEXT_LK_API_KEY;
  const senderId = process.env.TEXT_LK_SENDER_ID;
  const message = formatMessage(details);

  if (!apiKey) {
    console.log(`SMS not sent: TEXT_LK_API_KEY not configured. Would have sent to ${toPhone}: "${message}"`);
    return;
  }

  try {
    const res = await fetch(TEXT_LK_SEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: normalizePhone(toPhone),
        sender_id: senderId || "TextLKDemo",
        type: "plain",
        message,
      }),
    });

    if (!res.ok) {
      console.error(`SMS send failed (${res.status}):`, await res.text().catch(() => ""));
    }
  } catch (error) {
    // Never let an SMS failure break the booking flow that triggered it.
    console.error("SMS send error:", error);
  }
}
