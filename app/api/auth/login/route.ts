import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

// signInWithPassword doesn't need the service-role key - the anon key (same
// client lib/server-auth.ts uses for token validation) is sufficient and
// keeps this route from holding admin-level credentials it doesn't need.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// `clientIp` trusts the X-Forwarded-For header, which is only accurate
// behind a reverse proxy that sets it itself (true on Vercel; NOT
// guaranteed on the Docker path - docker-compose.yml exposes :3000
// directly with no proxy in front). An attacker who can set that header
// gets a fresh per-IP budget on every request, defeating the limiter
// above. This second check is keyed on the email alone, deliberately with
// a much looser budget (generous enough that a real user retrying their
// own password a few times, even from several devices, never hits it) -
// it exists only to put a ceiling on total guesses across every spoofed
// IP, not to replace the per-IP limiter's tighter, legitimate-user-safe
// budget.
const MAX_LOGIN_ATTEMPTS_PER_EMAIL = 20;
const LOGIN_EMAIL_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// POST /api/auth/login - Login with email/password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    // Rate-limited per IP+email so one attacker can't lock out a real
    // customer's account by spamming failed logins for their email from a
    // different IP, while still throttling credential-stuffing against any
    // single account - including the admin account, which is the gateway to
    // every customer's data.
    const rateLimitKey = `login:${clientIp(request)}:${email.toLowerCase()}`;
    const rateLimit = checkRateLimit(rateLimitKey, MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW_MS);
    const emailRateLimit = checkRateLimit(
      `login-email:${email.toLowerCase()}`,
      MAX_LOGIN_ATTEMPTS_PER_EMAIL,
      LOGIN_EMAIL_WINDOW_MS
    );
    if (!rateLimit.allowed || !emailRateLimit.allowed) {
      const retryAfterSeconds = Math.max(rateLimit.retryAfterSeconds, emailRateLimit.retryAfterSeconds);
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
      session: data.session,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}
