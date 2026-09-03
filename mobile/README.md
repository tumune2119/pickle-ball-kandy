# Kandy 1st Court — Mobile

Expo (React Native + TypeScript) starter for the **customer-facing** side of
the Kandy 1st Court pickleball booking platform. Admin stays web-only; this
app covers login, signup, home, booking, my bookings, and profile.

Built with Expo Router (file-based routing, same mental model as the
Next.js App Router used by the web app) against the *same* Next.js backend
API - no server code here, no changes to the web app.

## Prerequisites

- Node.js 20+ and npm
- The Next.js web app running (`npm run dev` from the repo root) - this
  mobile app calls its `/api/*` routes directly, it does not reimplement them
- A Supabase project (the same one the web app uses)
- [Expo Go](https://expo.dev/go) on your phone, or an iOS/Android
  simulator/emulator, for actually running the app

## Setup

```bash
cd mobile
npm install
cp .env.example .env
```

Edit `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` - same
  Supabase project as the web app (see the repo root's own `.env` for the
  values, using the *anon* key here, not the service role key).
- `EXPO_PUBLIC_API_BASE_URL` - the Next.js app's URL.
  - Simulator/emulator on the same machine as `next dev`, or `expo start
    --web`: `http://localhost:3000` works as-is.
  - **A physical device, or an Android emulator that can't resolve the
    host's `localhost`: this must be your dev machine's LAN IP**, e.g.
    `http://192.168.1.20:3000`, with the Next.js dev server started as
    `next dev -H 0.0.0.0` so it accepts connections from other devices on
    the network.

Then start the dev server:

```bash
npx expo start
```

From there, press `a` for Android, `i` for iOS (macOS only), `w` for web, or
scan the QR code with Expo Go on a physical device.

## Project layout

```
mobile/
  app/                  Expo Router screens (file-based routing)
    _layout.tsx         Auth-gated root Stack (Stack.Protected)
    login.tsx
    signup.tsx
    payhere-checkout.tsx WebView that auto-submits the PayHere form
    (tabs)/
      _layout.tsx       Bottom tab bar
      index.tsx         Home
      book.tsx          Book a court
      my-bookings.tsx   My Bookings
      profile.tsx       Profile
  context/
    AuthContext.tsx     Session + cached profile, login/signup/logout
  lib/
    api.ts              Typed fetch wrappers for every backend endpoint used
    supabase.ts          Supabase client (AsyncStorage-backed session)
    env.ts, constants.ts, format.ts, dates.ts, pricing.ts, theme.ts
```

## Auth model

Matches the brief: the backend has no session cookies, so this app calls
`POST /api/auth/login` / `POST /api/auth/signup` directly, then mirrors the
returned Supabase session into the RN Supabase client via
`supabase.auth.setSession()` so `@supabase/supabase-js` (with
`@react-native-async-storage/async-storage` as its storage adapter) keeps
the session refreshed and persisted across app restarts.

**Deviation worth knowing about:** `/api/auth/login` only returns
`{ id, email }` - there is no "get my profile" endpoint in the given
contract, so the Profile screen can't fetch `fullName`/`phone` after a plain
login. `/api/auth/signup`, by contrast, returns the full user row. To keep
the Profile screen genuinely useful without inventing a new backend
endpoint, `AuthContext` caches whatever profile fields it has seen (in
AsyncStorage, keyed by user id) and re-merges them on the next login for the
same id. Practically: sign up on a device once, and full name/phone stick
around across logout/login on that same device; a login on a fresh device
with no prior signup there only shows email until the backend gains a
profile endpoint.

## Booking flow

`app/(tabs)/book.tsx` mirrors `components/BookingForm.tsx` functionally, but
fetches **real** availability from `GET /api/bookings/availability` (the web
`BookingForm` currently uses hardcoded demo slot data) - same for
`my-bookings.tsx`, which does a real `GET /api/bookings` fetch instead of the
static demo array in `components/MyBookingsList.tsx`.

Slot selection is a two-tap range picker (tap a start slot, tap an end slot)
rather than free multi-select, so the "one or more **consecutive** slots"
requirement is enforced by the UI itself instead of relying on selection
order like the web demo does.

Date selection is a horizontal strip of day chips for today through
+30 days, rather than a native date-picker dependency - it enforces the same
range without adding a native module we can't test here without a
simulator.

Pricing (off-peak before 5 PM / peak after) is calculated client-side from
`lib/pricing.ts`, mirroring the same hardcoded rates the web `BookingForm`
uses (there's no pricing-lookup endpoint in the given contract either -
the backend just stores whatever `amountLkr` it's sent).

## PayHere checkout

`POST /api/payments/initiate` returns a `checkoutUrl` plus a `fields` object
that PayHere expects as a real HTML form POST (not a GET with query
params) - the web app does this with
`document.createElement('form'); form.submit()`.

**Approach chosen:** `app/payhere-checkout.tsx` opens a `react-native-webview`
loaded with a small inline HTML string (`source={{ html }}`) containing a
`<form method="POST" action={checkoutUrl}>` with one hidden `<input>` per
field, plus a `<script>` that calls `.submit()` on load - functionally
identical to the web app's approach, just running inside a WebView instead
of the top-level document. This was picked over
`expo-web-browser`'s `openBrowserAsync`/`openAuthSessionAsync` because those
can only *navigate* to a URL (GET) - they can't submit a POST body, so they
can't hit PayHere's checkout endpoint correctly without a hosted
intermediary redirect page, which is more moving parts than a self-contained
WebView needs.

The backend's `return_url`/`cancel_url` point at the *web app's* pages
(`/my-bookings?payment=success`, `/book?payment=cancelled`), so after PayHere
redirects there the WebView briefly shows the Next.js page before
`onNavigationStateChange` in `payhere-checkout.tsx` detects the URL and hands
control back to the native "My Bookings" tab (or pops back on cancel).

## Verifying this starter (no simulator available in this environment)

```bash
npm install          # already run once while building this
npx tsc --noEmit      # (or: npm run typecheck)
npx expo-doctor       # validates the Expo project config/dependencies
```

To actually try it on a device once you have Expo Go / a simulator:

```bash
cd mobile
npm install
cp .env.example .env   # fill in Supabase + API base URL
npx expo start
```

Then, in another terminal, from the repo root: `npm run dev` (the Next.js
app must be running for any screen beyond the login form to do anything).
