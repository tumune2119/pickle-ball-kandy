// Public runtime config. Values prefixed with EXPO_PUBLIC_ are inlined by
// Metro at build time from `.env` (see `.env.example` for the full list) -
// no extra app.json wiring required (Expo SDK 49+).

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

// The Next.js app's URL. Defaults to the standard local dev port.
//
// IMPORTANT: `localhost` only resolves to "this device" on a simulator/web.
// On a physical device or an Android emulator, `localhost` refers to the
// device itself, not your dev machine - point this at your dev machine's
// LAN IP instead, e.g. EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:3000
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "[env] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY are not set. " +
      "Copy mobile/.env.example to mobile/.env and fill in your Supabase project values."
  );
}
