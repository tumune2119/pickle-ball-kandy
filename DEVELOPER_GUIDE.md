# Developer Guide — Pickle Rush

This is the code-level reference for this repo: every table, every route, every
gotcha found while building it. It assumes no familiarity with the running app —
everything here is derived from the source, not the UI.

Companion docs: [README.md](./README.md) (quick start), [DEPLOYMENT.md](./DEPLOYMENT.md)
(Vercel/Docker).

---

## 1. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | See "Next.js 16 gotchas" below — this version has breaking changes vs. older docs/training data. `node_modules/next/dist/docs/` has the real docs for this version. |
| Language | TypeScript | `strict` mode is on (`tsconfig.json`) |
| Styling | Tailwind CSS v4 | **Not** the same class names as v3 — see gotchas |
| Database | PostgreSQL via Supabase | Any Postgres works; Supabase is used for Auth too |
| ORM | Drizzle ORM (`drizzle-orm/node-postgres` + `pg`) | Schema-first, migrations via `drizzle-kit` |
| Auth | Supabase Auth | Email/password. No cookie/session middleware — see "Authentication model" |
| Payments | PayHere (Sri Lanka) | Custom integration in `lib/payhere.ts`, no SDK |

---

## 2. Repository layout

```
app/
  layout.tsx                 Root layout (html/body, global metadata) - required by Next, do not delete
  not-found.tsx               404 page
  (public)/                   Marketing site route group - / /about /pricing /contact
    layout.tsx                 Wraps pages with Navigation + Footer
    _components/                Private folder (leading _ excludes from routing)
  (auth)/                     Login/signup route group
    layout.tsx                  Centered gradient card layout
  (customer)/                 Logged-in customer area - /book /dashboard /my-bookings /profile
    layout.tsx                  "My Account" header + content wrapper
  admin/                      Admin portal - /admin/dashboard /admin/bookings /admin/customers /admin/settings /admin/reports
    layout.tsx                  Sidebar nav layout, gated by AdminAuthGate.tsx
  api/                        API routes (see section 6 for full reference)

components/                  Shared client components used by app/ pages
  BookingForm.tsx              Booking wizard - real pricing/availability from the API, signed-in or guest
  LoginForm.tsx, SignupForm.tsx, ManageBookingForm.tsx
  MyBookingsList.tsx, AdminBookingsTable.tsx, AdminCustomersTable.tsx  All fetch real data from their API routes

lib/
  db/
    schema.ts                  Drizzle schema - source of truth for the DB shape
    db.ts                      Drizzle client (drizzle-orm/node-postgres + pg.Pool)
    seed.ts                    Standalone script (`npm run db:seed`) - inserts demo rows directly, bypasses Supabase Auth
  auth.ts                      Browser-side Supabase client + auth helper functions
  payhere.ts                   PayHere checkout-hash and webhook-signature logic
  payhere-client.ts            Browser-only PayHere checkout redirect (shared by booking, retry payment, guest manage)
  cancellation.ts              Shared cancellation-window check (account-holder and guest self-service)
  pricing.ts                   Real per-court/per-slot rates, read by booking creation and availability
  rate-limit.ts                In-memory rate limiter + clientIp - login, booking lookup, guest cancel
  constants.ts                 App-wide constants (court info, pricing, enums)
  utils.ts                     Formatting/date/slot helpers

drizzle.config.ts            drizzle-kit config (loads .env.local explicitly - see gotchas)
next.config.ts                output: "standalone" (for Docker)
```

### Route groups, explained

`(public)`, `(auth)`, `(customer)` are Next.js **route groups** — the
parenthesized name is invisible in the URL. `app/(public)/page.tsx` and
`app/(customer)/book/page.tsx` map to `/` and `/book` respectively. Each group
has its own `layout.tsx` that wraps only pages inside it, nested inside the
root `app/layout.tsx`.

**Trap already hit once:** a file directly at `app/page.tsx` (no group) also
maps to `/`, and Next/Turbopack did not error on the conflict — it silently
let the top-level file win, so the real homepage in `app/(public)/page.tsx`
was completely unreachable until the stray file was deleted. If you ever see
a page's content not showing up, check for a same-path file outside the
route group first.

---

## 3. Environment variables

All read from `process.env`; see `.env.example` for the full template.

| Variable | Used by | Notes |
|---|---|---|
| `DATABASE_URL` | `lib/db/db.ts`, `lib/db/seed.ts`, `drizzle.config.ts` | Postgres connection string. **Use the session-mode pooler (port 5432), not transaction-mode (6543/`pgbouncer=true`)** — `drizzle-orm/node-postgres` relies on prepared statements, which pgbouncer's transaction mode breaks. |
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/auth.ts`, all API routes using `createClient` | Project URL only, no path suffix (not `/rest/v1/...`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/auth.ts` (browser client) | Public, safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | `app/api/auth/*` | Server-only, bypasses RLS — never expose to the browser |
| `NEXT_PUBLIC_PAYHERE_MERCHANT_ID` | `app/api/payments/initiate/route.ts` | |
| `PAYHERE_SECRET` | `lib/payhere.ts` | Server-only, used for MD5 hash signing |
| `PAYHERE_BASE_URL` | `app/api/payments/initiate/route.ts` | `https://sandbox.payhere.lk/pay/checkout` (test) or `https://www.payhere.lk/pay/checkout` (live) |
| `NEXT_PUBLIC_APP_URL` | payments initiate route | Used to build PayHere's `return_url`/`cancel_url`/`notify_url` — must be a publicly reachable URL for `notify_url` to work (PayHere calls it server-to-server) |
| `NEXT_PUBLIC_COURT_ID` | `app/api/bookings/availability/route.ts` | Fallback court id if none passed - see Known Gaps, this is stale/unused in practice since `/api/courts` exists now |

**CLI scripts don't get `.env.local` for free.** `next dev`/`next build`
auto-load it, but `drizzle-kit` and `tsx lib/db/seed.ts` are standalone
processes — both explicitly `import { config } from "dotenv"; config({ path:
".env.local" })` at the top for this reason. If you add another standalone
script that touches the DB, do the same.

---

## 4. Database schema (`lib/db/schema.ts`)

7 tables, all UUID primary keys (`gen_random_uuid()`), all with
`createdAt`/`updatedAt` timestamps unless noted.

- **`users`** — `email` (unique), `phoneNumber` (unique), `fullName`, `role` (`customer`/`admin`/`staff`, default `customer`). **Id must match the Supabase Auth user id** for a row to be a real, loggable-in account (see Authentication model) — rows inserted any other way (e.g. `seed.ts`) are DB-only and can't log in.
- **`courts`** — `name`, `location`, `googleMapsUrl`, `openingTime`/`closingTime` (defaults 06:00/22:00), `slotDuration` (minutes, default 60). The venue has 3 real courts; the customer booking flow, admin bookings table, and weekly schedule all let you pick/filter by court.
- **`bookings`** — `userId`/`courtId` (FK, cascade delete), `bookingDate`, `startTime`, `endTime`, `numPlayers`, `status` (`confirmed`/`pending_payment`/`paid`/`cancelled`), `paymentStatus` (`unpaid`/`paid`/`refunded`), `amountLkr`, `notes`. **Unique index on `(courtId, bookingDate, startTime)`** — this is the actual double-booking guard, enforced at the DB level, not just app logic.
- **`payments`** — `bookingId`/`userId` (FK), `amountLkr`, `gateway` (`payhere`/`manual`), `gatewayTransactionId`, `status` (`pending`/`completed`/`failed`/`refunded`). Created by `/api/payments/initiate`, updated by `/api/payments/notify`.
- **`pricing`** — `courtId` (FK), `dayOfWeek` (0-6, null = all days), `startTime`/`endTime`, `ratePerHour`, `peak` (bool). Read by `lib/pricing.ts`, the single source of truth used by booking creation, reschedule, and the availability endpoint - falls back to a hardcoded default only if a court has no rows yet.
- **`blackoutDates`** — `courtId` (FK), `blackoutDate`, `startTime`/`endTime`, `reason`. Defined in schema; **no code reads or writes this table yet.**
- **`settings`** — `courtId` (FK), `key`, `value` (both text) — a generic key/value store, not one row per setting. Read/written by `/api/admin/settings`, including by the admin Settings page itself (court hours, pricing, cancellation window).

### Migrations

```bash
npm run db:generate   # drizzle-kit generate - writes SQL migration files to ./drizzle
npm run db:push       # drizzle-kit push - applies schema.ts diff directly (no migration files)
```

`db:push` is what's been used so far (fine for a single-developer/early-stage
project). It prompts for confirmation on data-loss changes — non-interactive
shells need `npx drizzle-kit push --force` instead (safe on an empty/dev DB,
**read the diff first on a DB with real data**).

---

## 5. Authentication model

There is **no session cookie or middleware** — auth state lives in the
Supabase JS client (browser-side) plus a real JWT check on every API route
that needs one. Three moving parts:

1. **Signup** (`POST /api/auth/signup`, called by `components/SignupForm.tsx`): validates the email/phone aren't already in the `users` table and that the phone looks like a real Sri Lankan number, then calls `supabase.auth.admin.createUser({ email, password, email_confirm: true })` **using the service-role key** (needed for admin-level user creation), then inserts a matching row into `users` with `id: data.user.id`. If that insert fails, the just-created Auth user is deleted again (compensating transaction - there's no cross-service transaction spanning Supabase Auth + Postgres). This is why `users.id` and the Supabase Auth user id are always the same value for real accounts.

2. **Login** (`POST /api/auth/login`, called by `components/LoginForm.tsx`): rate-limited per IP+email (`lib/rate-limit.ts`, 5 attempts / 15 min), then calls `supabase.auth.signInWithPassword` server-side **using the anon key** (not service-role - signing in doesn't need elevated privileges) and returns the resulting `session` (access/refresh tokens) in the JSON response. **The API route validating credentials does not, by itself, log the browser in** — `LoginForm.tsx` must take that `session` and call `supabase.auth.setSession({ access_token, refresh_token })` on the *browser's* Supabase client (the `supabase` export from `lib/auth.ts`, which also uses the anon key). If you ever add another login entry point, don't skip that step.

3. **Client-side checks**: `lib/auth.ts` exports `getCurrentUser()` (wraps `supabase.auth.getUser()`) and `getSession()`. Pages that need to know who's logged in call these directly in a `useEffect` (see `app/(customer)/book/page.tsx`) — there's no shared `AuthContext`/provider on the web app.

**Server-side API routes validate a real Supabase JWT**, not a trusted
client-supplied header. `lib/server-auth.ts` exports three helpers, used
throughout `app/api/**`:
- `requireAuth(request)` — reads the `Authorization: Bearer <token>` header, calls `supabaseAuth.auth.getUser(token)`, returns 401 if missing/invalid.
- `getOptionalAuth(request)` — same, but returns `null` instead of 401 when there's no valid token (used where signed-in and guest are both valid, e.g. `POST /api/bookings`).
- `requireAdmin(request)` — `requireAuth` plus a DB check that the user's `users.role` is `admin`/`staff`, 403 otherwise.

`GET /api/users/me` returns the signed-in user's full `users` row (used by `components/CustomerProfile.tsx`) - there is a real "get my profile" endpoint.

---

## 6. API reference

All routes are under `app/api/`, all return JSON, all `NextRequest`/`NextResponse`.

### Bookings

| Route | Method | Auth | Notes |
|---|---|---|---|
| `/api/bookings` | GET | `requireAuth` | That user's own bookings only |
| `/api/bookings` | POST | `getOptionalAuth` (signed-in or guest) | `{ courtId, bookingDate, startTime, endTime, numPlayers, paymentMode, guestName?, guestPhone?, guestEmail? }` — `userId` comes from the token, never the client; server computes `amountLkr` itself from `lib/pricing.ts`. Checks the unique-index slot first (`409` if taken). `status` is `pending_payment` for `paymentMode === "payhere"`, `confirmed` otherwise. |
| `/api/bookings/[id]` | GET | `requireAuth` (owner or admin/staff) | Single booking by id |
| `/api/bookings/[id]` | PATCH | `requireAuth` (owner or admin/staff) | `{ bookingDate?, startTime?, endTime? }` — reschedule; re-checks the slot is free, recomputes price |
| `/api/bookings/[id]` | DELETE | `requireAuth` (owner or admin/staff) | Sets `status: "cancelled"` (soft). Self-cancel (not staff) is blocked inside `cancellation_policy_hours` of the booking - see `lib/cancellation.ts` |
| `/api/bookings/manage` | POST | none (guest lookup) | `{ code, phone }` - looks up a guest booking by its short confirmation code + the phone given at booking time. Rate-limited per IP. |
| `/api/bookings/manage/[id]` | DELETE | none (re-verifies `{ phone }` itself) | Guest self-service cancel, same window rule as the account-holder path |
| `/api/bookings/availability` | GET | none | `?date=YYYY-MM-DD&courtId=<uuid>` → `{ availableSlots, bookedSlots, totalSlots, rates }`, `rates` from `lib/pricing.ts` |
| `/api/courts` | GET | none | Lists all courts - the venue currently has 3 |
| `/api/users/me` | GET | `requireAuth` | The signed-in user's own `users` row |

### Auth

| Route | Method | Body | Notes |
|---|---|---|---|
| `/api/auth/signup` | POST | `{ email, phone, fullName, password }` | See Authentication model |
| `/api/auth/login` | POST | `{ email, password }` | Rate-limited 5/15min per IP+email. See Authentication model |

### Payments (PayHere)

| Route | Method | Body | Notes |
|---|---|---|---|
| `/api/payments/initiate` | POST | `{ bookingId }` | Works for an account booking (caller must own it) or a guest booking (no auth needed, the booking id is a uuid). Creates a `payments` row (`status: "pending"`), returns `{ checkoutUrl, fields }` — `fields` is the full PayHere checkout form payload including the signed `hash`. Caller must POST those fields as a real HTML form submission to `checkoutUrl` (PayHere requires POST, not GET/query params) — see `lib/payhere-client.ts`'s `redirectToPayHereCheckout`, shared by new bookings, "Retry Payment," and the guest manage-booking page. |
| `/api/payments/notify` | POST | PayHere's server-to-server webhook (form-encoded, not JSON) | Verifies `md5sig` via `lib/payhere.ts`'s `verifyNotifySignature`, cross-checks the notified amount against the expected `payments.amountLkr`, then on success (`status_code === "2"`) marks the payment `completed` and the booking `status: "confirmed"` / `paymentStatus: "paid"`. **Must be reachable from the public internet** — won't fire against `localhost`. |

`lib/payhere.ts` hash logic (both directions use the same MD5-of-MD5
pattern PayHere requires):
```
checkout hash   = MD5(merchantId + orderId + amount.toFixed(2) + currency + MD5(PAYHERE_SECRET).toUpper()).toUpper()
notify signature = MD5(merchantId + orderId + payhereAmount + payhereCurrency + statusCode + MD5(PAYHERE_SECRET).toUpper()).toUpper()
```
`orderId` is always the `payments.id` (uuid), not the `bookings.id`.

### Admin

All admin routes use `requireAdmin` (real JWT + `role` check).

| Route | Method | Body / Query | Notes |
|---|---|---|---|
| `/api/admin/bookings` | GET | `?status=&date=&startDate=&endDate=&courtId=&limit=` | All bookings, optionally filtered, enriched with customer/court name |
| `/api/admin/bookings` | POST | `{ userId, courtId, bookingDate, startTime, endTime, numPlayers, amountLkr }` | Walk-in booking, always `status: "confirmed"`, `paymentStatus: "paid"` |
| `/api/admin/customers` | GET | `?search=&limit=` | Users with `role: "customer"`, enriched with `totalBookings`/`lastBooking` via one batched query (not N+1). `search` matches name/email/phone via `ilike` |
| `/api/admin/settings` | GET | header `X-Court-ID` | Returns the court row, its `settings` rows, and real `pricing` |
| `/api/admin/settings` | PATCH | `{ courtId, settings?, courtHours?, pricing? }` | Three independent optional sections: generic key/value upsert, `courts` row update, and `pricing` row replace |
| `/api/admin/reports` | GET | `?startDate=&endDate=` | Revenue (excludes cancelled bookings), occupancy, and payment-method stats, computed from `bookings` in-memory (no separate reporting tables) |

---

## 7. The booking flow, end to end

1. `app/(customer)/book/page.tsx` (client component) on mount: calls `getCurrentUser()` (null means booking as a guest - shown an inline "Booking as a guest" banner, not redirected anywhere) and `GET /api/courts`, defaulting to the first court; a court-tab switcher appears when there's more than one.
2. Renders `components/BookingForm.tsx` with `userId`/`courtId` as props (`key={selectedCourtId}` so switching courts remounts the wizard - date/slot picks are court-specific).
3. `BookingForm` fetches real availability + per-slot pricing from `GET /api/bookings/availability?date=...&courtId=...` whenever the date changes, then on "Confirm Booking":
   - `POST /api/bookings` to create the row (server recomputes the price itself from `lib/pricing.ts` - never trusts a client-supplied amount).
   - If `paymentMode === "payhere"`: `POST /api/payments/initiate`, then `lib/payhere-client.ts` builds a hidden `<form>` and submits it to PayHere's `checkoutUrl` (full page navigation away from the app).
   - Otherwise (`pay_at_venue`): advances to the step-4 confirmation screen locally.
4. Pricing is read from the `pricing` table via `lib/pricing.ts`, the same module the availability endpoint, booking creation, and reschedule all share - a customer is never shown a price the server won't actually charge.

---

## 8. Known gaps (read before assuming something works)

This section used to describe a much earlier, mostly-stubbed state of the
app (hardcoded data everywhere, no real auth checks, no admin gate). A
rework pass (see `REWORK_PLAN.md`) fixed most of that — this list reflects
what's actually still missing as of that rework, not the original build.

Still genuinely missing/stubbed:

- **No self-service reschedule UI** — `PATCH /api/bookings/[id]` supports it at the API level, but nothing in the UI calls it. `MyBookingsList.tsx`'s Reschedule button is `disabled` with a "Coming soon" tooltip rather than silently doing nothing.
- **No receipt generation, no "book again" prefill** — same pattern, the buttons are disabled/honest rather than wired to real features.
- **Seeded demo users can't log in** — `lib/db/seed.ts` inserts directly into `users`, bypassing Supabase Auth entirely. Only accounts created via the real `/signup` flow (or Supabase Auth directly) can log in.
- **`blackoutDates` table is unused** by any route — the table exists in the schema, nothing reads or writes it.
- **No actual email/SMS sending anywhere** — no booking confirmation, no notification. Don't assume one exists when touching booking/payment code; the UI no longer claims one is sent (it used to, incorrectly).
- **Admin settings' pricing/hours writes aren't currently live-verified against the real court config** — the write path (`PATCH /api/admin/settings`) is implemented and code-reviewed, but doing an actual admin-session write test was skipped to avoid mutating production config without explicit sign-off (see `REWORK_PLAN.md` Slice 2).

No longer true (fixed during the rework, kept here so this list doesn't contradict itself if read alongside git history):

- ~~No role/session check on any API route~~ — every route now verifies a real Supabase JWT via `requireAuth`/`requireAdmin`/`getOptionalAuth` in `lib/server-auth.ts`.
- ~~`/admin/*` has no auth gate~~ — gated by `AdminAuthGate.tsx`.
- ~~`pricing` table is unused, pricing hardcoded client-side~~ — `lib/pricing.ts` is now the single source of truth, read by booking creation, reschedule, and availability.
- ~~`MyBookingsList`/`AdminBookingsTable`/`AdminCustomersTable` render static demo data~~ — all three fetch real API data.
- ~~Admin settings `handleSave` doesn't call the API~~ — it does now.

---

## 9. Gotchas specific to this project's dependency versions

These aren't obvious from general Next.js/Tailwind/Drizzle knowledge and
have each caused a real bug once already:

- **Next.js 16 route handler `params` is a `Promise`.** `{ params }: { params: Promise<{ id: string }> }`, then `const { id } = await params;` — the old synchronous shape from earlier Next versions will typecheck-fail the build.
- **Tailwind v4 renamed/removed utilities used throughout this repo originally:** `bg-gradient-to-*` → `bg-linear-to-*`; `bg-opacity-*`/`text-opacity-*` → color-opacity modifier syntax (`bg-black/50` instead of `bg-black bg-opacity-50`). Old v3 classes are silently no-ops in v4 (no build error), so the failure mode is a visually broken page, not a compile error — check rendered output, not just that it builds.
- **Drizzle's `.where()` takes exactly one condition.** `.where(eq(a, b), eq(c, d))` compiles in some setups but is wrong — wrap multiple conditions in `and(...)`. Conditionally building a query by reassigning `let query = db.select()...; query = query.where(...)` also fails to typecheck cleanly — build a `conditions[]` array and pass `and(...conditions)` (or `undefined`) in one `.where()` call instead.
- **`drizzle-orm/node-postgres` + Supabase's transaction-mode pooler (port 6543, `pgbouncer=true`) don't mix** — prepared statements break. Use the session-mode pooler (port 5432) for `DATABASE_URL`.
- **`pg` ships no TypeScript types** — `@types/pg` is a separate devDependency; same for `crypto-js`/`@types/crypto-js` (used by `lib/payhere.ts`).
- **`drizzle-kit` and standalone `tsx` scripts don't auto-load `.env.local`** — only `next dev`/`next build` do that. See section 3.

---

## 10. Extending this app

**New API route:** add `app/api/<path>/route.ts` exporting `GET`/`POST`/etc.
Import `db` from `@/lib/db/db` and tables from `@/lib/db/schema`. Follow the
existing routes' pattern: try/catch, `NextResponse.json(..., { status })` on
error, convert `numeric` columns (`amountLkr`, `ratePerHour`) from string to
`number` before returning (Postgres `numeric` comes back as a string through
the driver).

**New DB table/column:** edit `lib/db/schema.ts`, then `npm run db:push`
(dev) or `npm run db:generate` + review the SQL + apply (anything with real
data). Update `lib/db/seed.ts` if the new table needs demo rows.

**New page:** add under the right route group (`(public)` for marketing,
`(customer)` for logged-in customer pages, `admin/` for admin — note `admin/`
is *not* a route group, it's a real segment, so its pages are under
`/admin/...`). Add `export const metadata` for the page title unless the
file needs `"use client"`, in which case metadata must live in a
server-component wrapper or be omitted (client components can't export
`metadata`).

**New env var:** add to `.env.example` with a placeholder value and a
one-line comment, then read via `process.env.YOUR_VAR` (prefix
`NEXT_PUBLIC_` only if the browser genuinely needs it — everything else
should stay server-only).
