import { db } from "@/lib/db/db";
import { bookings, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { verifyNotifySignature, PAYHERE_STATUS } from "@/lib/payhere";

// POST /api/payments/notify - PayHere server-to-server payment confirmation.
// This is called by PayHere directly, never by the browser.
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const merchantId = form.get("merchant_id")?.toString() ?? "";
    const orderId = form.get("order_id")?.toString() ?? "";
    const payhereAmount = form.get("payhere_amount")?.toString() ?? "";
    const payhereCurrency = form.get("payhere_currency")?.toString() ?? "";
    const statusCode = form.get("status_code")?.toString() ?? "";
    const md5sig = form.get("md5sig")?.toString() ?? "";

    const isValid = verifyNotifySignature({
      merchantId,
      orderId,
      payhereAmount,
      payhereCurrency,
      statusCode,
      md5sig,
    });

    if (!isValid) {
      console.error("PayHere notify: invalid signature", { orderId });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, orderId))
      .limit(1);

    if (!payment.length) {
      console.error("PayHere notify: payment not found", { orderId });
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (statusCode === PAYHERE_STATUS.SUCCESS) {
      await db
        .update(payments)
        .set({
          status: "completed",
          gatewayTransactionId: form.get("payment_id")?.toString() ?? null,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, orderId));

      await db
        .update(bookings)
        .set({
          status: "confirmed",
          paymentStatus: "paid",
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, payment[0].bookingId));
    } else if (
      statusCode === PAYHERE_STATUS.CANCELLED ||
      statusCode === PAYHERE_STATUS.FAILED
    ) {
      await db
        .update(payments)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(payments.id, orderId));
    }
    // PENDING (0) and CHARGED_BACK (-3): leave payment/booking as-is; PayHere
    // will send a follow-up notification once the state settles.

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayHere notify error:", error);
    return NextResponse.json(
      { error: "Failed to process notification" },
      { status: 500 }
    );
  }
}
