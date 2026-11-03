import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidPhoneNumber } from "@/lib/utils";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const MAX_SIGNUP_ATTEMPTS = 5;
const SIGNUP_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// POST /api/auth/signup - Create an account (email + password)
export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(`signup:${clientIp(request)}`, MAX_SIGNUP_ATTEMPTS, SIGNUP_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const body = await request.json();
    const { phone, fullName, password } = body;
    // Normalized once, used everywhere below - the pre-check, the Supabase
    // Auth call, and the users row - so "Foo@x.com" and "foo@x.com" can't
    // pass the duplicate check as two different identities.
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : body.email;

    if (!email || !phone || !fullName || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { error: "Enter a valid Sri Lankan phone number" },
        { status: 400 }
      );
    }

    // Check if user exists. The distinct "already registered" message is a
    // known, accepted email-enumeration trade-off (flagged, not silently
    // left undocumented) - rate limiting above is the real mitigation,
    // since it caps how many emails any one source can probe.
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Create user in Supabase (service role key required for admin-created users)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create user in database. If this fails after the Auth user above was
    // already created, that email would otherwise be permanently stuck:
    // Supabase says the account exists, but there's no matching `users` row
    // for anything else in the app to work with. Compensate by deleting the
    // just-created Auth user so the signup can be retried cleanly instead.
    let newUser;
    try {
      newUser = await db
        .insert(users)
        .values({
          id: data.user?.id || "",
          email,
          phoneNumber: phone,
          fullName,
          role: "customer",
        })
        .returning();
    } catch (dbError) {
      console.error("Signup DB insert failed, rolling back Auth user:", dbError);
      if (data.user?.id) {
        await supabase.auth.admin.deleteUser(data.user.id).catch((cleanupError) => {
          console.error("Signup rollback also failed to delete the orphaned Auth user:", cleanupError);
        });
      }
      return NextResponse.json(
        { error: "Failed to sign up" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Signup successful",
        user: newUser[0],
        userId: data.user?.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to sign up" },
      { status: 500 }
    );
  }
}
