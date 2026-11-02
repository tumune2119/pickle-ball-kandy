import { db } from "@/lib/db/db";
import { bookings, payments, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { generateCheckoutHash, formatPayHereAmount } from "@/lib/payhere";
import { COURT_NAME } from "@/lib/constants";
import { getOptionalAuth } from "@/lib/server-auth";

// POST /api/payments/initiate - Create a pending payment and return the
// PayHere checkout form fields for the client to submit. Works for an
// account booking (caller must be signed in as that booking's owner) or a
// guest booking (no account exists to sign in as, so anyone holding the
// booking id - which the client only ever learns right after creating it -
// can pay for it; that id is a uuid, not something to guess).
export async function POST(request: NextRequest) {
  const auth = await getOptionalAuth(request);

  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing bookingId" },
        { status: 400 }
      );
    }

    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking.length) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const bookingRecord = booking[0];

    if (bookingRecord.userId && bookingRecord.userId !== auth?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const amount = bookingRecord.amountLkr
      ? parseFloat(bookingRecord.amountLkr as string)
      : 0;

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Booking has no amount to charge" },
        { status: 400 }
      );
    }

    // Account booking -> bill to the user's profile; guest booking -> bill
    // to the contact details collected at checkout.
    let fullName: string;
    let email: string;
    let phone: string;

    if (bookingRecord.userId) {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, bookingRecord.userId))
        .limit(1);

      if (!user.length) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      fullName = user[0].fullName;
      email = user[0].email;
      phone = user[0].phoneNumber;
    } else {
      if (!bookingRecord.guestName || !bookingRecord.guestEmail || !bookingRecord.guestPhone) {
        return NextResponse.json({ error: "Guest contact details missing" }, { status: 400 });
      }
      fullName = bookingRecord.guestName;
      email = bookingRecord.guestEmail;
      phone = bookingRecord.guestPhone;
    }

    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID;
    const checkoutUrl = process.env.PAYHERE_BASE_URL;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!merchantId || !checkoutUrl || !appUrl) {
      return NextResponse.json(
        { error: "PayHere is not configured" },
        { status: 500 }
      );
    }

    const payment = await db
      .insert(payments)
      .values({
        bookingId: bookingRecord.id,
        userId: bookingRecord.userId,
        amountLkr: amount.toString(),
        gateway: "payhere",
        status: "pending",
      })
      .returning();

    const orderId = payment[0].id;
    const hash = generateCheckoutHash({
      merchantId,
      orderId,
      amount,
      currency: "LKR",
    });

    const [firstName, ...rest] = fullName.split(" ");
    // A guest has no "my bookings" page to land on (no account to view it
    // with) - send them back to the booking page instead.
    const successUrl = bookingRecord.userId
      ? `${appUrl}/my-bookings?payment=success`
      : `${appUrl}/book?payment=success`;

    return NextResponse.json({
      checkoutUrl,
      fields: {
        merchant_id: merchantId,
        return_url: successUrl,
        cancel_url: `${appUrl}/book?payment=cancelled`,
        notify_url: `${appUrl}/api/payments/notify`,
        order_id: orderId,
        items: `${COURT_NAME} booking`,
        currency: "LKR",
        amount: formatPayHereAmount(amount),
        first_name: firstName || fullName,
        last_name: rest.join(" ") || "-",
        email: email,
        phone: phone,
        address: COURT_NAME,
        city: "Kandy",
        country: "Sri Lanka",
        hash,
      },
    });
  } catch (error) {
    console.error("Initiate payment error:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
