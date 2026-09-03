import CryptoJS from "crypto-js";

// PayHere requires amounts formatted with exactly 2 decimal places, no thousands separators.
export function formatPayHereAmount(amount: number): string {
  return amount.toFixed(2);
}

function merchantSecretHash(): string {
  const secret = process.env.PAYHERE_SECRET;
  if (!secret) {
    throw new Error("PAYHERE_SECRET is not set");
  }
  return CryptoJS.MD5(secret).toString().toUpperCase();
}

// Hash for the client-side checkout form (PayHere "Start Payment" flow).
// See: https://support.payhere.lk/api-&-mobile-sdk/payhere-checkout
export function generateCheckoutHash(params: {
  merchantId: string;
  orderId: string;
  amount: number;
  currency: string;
}): string {
  const { merchantId, orderId, amount, currency } = params;
  const raw =
    merchantId +
    orderId +
    formatPayHereAmount(amount) +
    currency +
    merchantSecretHash();
  return CryptoJS.MD5(raw).toString().toUpperCase();
}

// Verifies the md5sig PayHere sends to the server-to-server notify_url webhook.
export function verifyNotifySignature(params: {
  merchantId: string;
  orderId: string;
  payhereAmount: string;
  payhereCurrency: string;
  statusCode: string;
  md5sig: string;
}): boolean {
  const { merchantId, orderId, payhereAmount, payhereCurrency, statusCode, md5sig } =
    params;
  const raw =
    merchantId +
    orderId +
    payhereAmount +
    payhereCurrency +
    statusCode +
    merchantSecretHash();
  const localSig = CryptoJS.MD5(raw).toString().toUpperCase();
  return localSig === md5sig.toUpperCase();
}

// PayHere status codes sent to notify_url.
export const PAYHERE_STATUS = {
  SUCCESS: "2",
  PENDING: "0",
  CANCELLED: "-1",
  FAILED: "-2",
  CHARGED_BACK: "-3",
} as const;
