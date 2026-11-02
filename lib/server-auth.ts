import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Server-side client used only to validate bearer tokens against Supabase
// Auth (auth.getUser(token) asks "is this JWT valid, and if so who is it" -
// it doesn't need the service role key, the anon key is enough for this).
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface AuthenticatedUser {
  id: string;
  email: string;
}

function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

type AuthResult =
  | { user: AuthenticatedUser; response?: undefined }
  | { user?: undefined; response: NextResponse };

const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// Validates the request's "Authorization: Bearer <access_token>" header
// against Supabase Auth. Every API route except /api/auth/signup,
// /api/auth/login, and /api/payments/notify (PayHere's own server-to-server
// webhook - authenticated by its md5 signature, not a Supabase session)
// should call this before doing anything else.
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const token = extractBearerToken(request);
  if (!token) return { response: unauthorized() };

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return { response: unauthorized() };

  return { user: { id: data.user.id, email: data.user.email ?? "" } };
}

// Like requireAuth, but for routes that accept either a signed-in user or a
// guest (e.g. booking creation) - returns the user when a valid bearer token
// is present, or null otherwise, and never itself responds with 401.
export async function getOptionalAuth(request: NextRequest): Promise<AuthenticatedUser | null> {
  const token = extractBearerToken(request);
  if (!token) return null;

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email ?? "" };
}

type AdminAuthResult =
  | { user: typeof users.$inferSelect; response?: undefined }
  | { user?: undefined; response: NextResponse };

// Same as requireAuth, but also requires the caller's row in `users` to
// have role "admin" or "staff". Returns the DB row (not just the auth
// identity) since callers usually want more than just the id at that point.
export async function requireAdmin(request: NextRequest): Promise<AdminAuthResult> {
  const auth = await requireAuth(request);
  if (auth.response) return { response: auth.response };

  const rows = await db.select().from(users).where(eq(users.id, auth.user.id)).limit(1);
  const dbUser = rows[0];

  if (!dbUser || (dbUser.role !== "admin" && dbUser.role !== "staff")) {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user: dbUser };
}
