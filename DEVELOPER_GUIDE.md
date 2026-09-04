# Developer Guide — Kandy 1st Court

This is the code-level reference for this repo: every table, every route, every
gotcha found while building it. It assumes no familiarity with the running app —
everything here is derived from the source, not the UI.

Companion docs: [README.md](./README.md) (quick start), [DEPLOYMENT.md](./DEPLOYMENT.md)
(Vercel/Docker), [mobile/README.md](./mobile/README.md) (React Native app).

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
| Mobile | Expo / React Native (`mobile/`) | Separate app, same backend API |

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
    layout.tsx                  Sidebar nav layout - NOT auth-gated (see Known Gaps)
  api/                        API routes (see section 6 for full reference)

components/                  Shared client components used by app/ pages
  BookingForm.tsx              4-step booking wizard, the only component doing a real end-to-end write
  LoginForm.tsx, SignupForm.tsx
  MyBookingsList.tsx, AdminBookingsTable.tsx, AdminCustomersTable.tsx  Static demo data - see Known Gaps

lib/
  db/
    schema.ts                  Drizzle schema - source of truth for the DB shape
    db.ts                      Drizzle client (drizzle-orm/node-postgres + pg.Pool)
    seed.ts                    Standalone script (`npm run db:seed`) - inserts demo rows directly, bypasses Supabase Auth
  auth.ts                      Browser-side Supabase client + auth helper functions
  payhere.ts                   PayHere checkout-hash and webhook-signature logic
  constants.ts                 App-wide constants (court info, pricing, enums)
  utils.ts                     Formatting/date/slot helpers
  hooks.ts                     Generic React hooks (useForm, useAsync, useLocalStorage, ...)

mobile/                      Separate Expo/React Native app - see mobile/README.md
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
- **`courts`** — `name`, `location`, `googleMapsUrl`, `openingTime`/`closingTime` (defaults 06:00/22:00), `slotDuration` (minutes, default 60). Schema supports multiple courts; the app is currently single-court (always uses `courts[0]`).
- **`bookings`** — `userId`/`courtId` (FK, cascade delete), `bookingDate`, `startTime`, `endTime`, `numPlayers`, `status` (`confirmed`/`pending_payment`/`paid`/`cancelled`), `paymentStatus` (`unpaid`/`paid`/`refunded`), `amountLkr`, `notes`. **Unique index on `(courtId, bookingDate, startTime)`** — this is the actual double-booking guard, enforced at the DB level, not just app logic.
- **`payments`** — `bookingId`/`userId` (FK), `amountLkr`, `gateway` (`payhere`/`manual`), `gatewayTransactionId`, `status` (`pending`/`completed`/`failed`/`refunded`). Created by `/api/payments/initiate`, updated by `/api/payments/notify`.
- **`pricing`** — `courtId` (FK), `dayOfWeek` (0-6, null = all days), `startTime`/`endTime`, `ratePerHour`, `peak` (bool). **Not actually read anywhere at request time** — see Known Gaps, pricing is hardcoded client-side instead.
- **`blackoutDates`** — `courtId` (FK), `blackoutDate`, `startTime`/`endTime`, `reason`. Defined in schema; **no code reads or writes this table yet.**
- **`settings`** — `courtId` (FK), `key`, `value` (both text) — a generic key/value store, not one row per setting. Read/written by `/api/admin/settings`; the admin Settings *page* doesn't call that API yet (see Known Gaps).

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

There is **no session cookie or middleware** — auth state lives entirely in
the Supabase JS client (browser-side) plus whatever each page/API route
independently decides to check. Three moving parts:

1. **Signup** (`POST /api/auth/signup`, called by `components/SignupForm.tsx`): validates the email isn't already in the `users` table, then calls `supabase.auth.admin.createUser({ email, password, email_confirm: true })` **using the service-role key**, then inserts a matching row into `users` with `id: data.user.id`. This is why `users.id` and the Supabase Auth user id are always the same value for real accounts.

2. **Login** (`POST /api/auth/login`, called by `components/LoginForm.tsx`): calls `supabase.auth.signInWithPassword` server-side (again with the service-role client) and returns the resulting `session` (access/refresh tokens) in the JSON response. **The API route validating credentials does not, by itself, log the browser in** — `LoginForm.tsx` must take that `session` and call `supabase.auth.setSession({ access_token, refresh_token })` on the *browser's* Supabase client (the `supabase` export from `lib/auth.ts`, which uses the public anon key). This was missing originally and silently broke every page that checks `getCurrentUser()` — fixed, but if you ever add another login entry point, don't skip this step.

3. **Client-side checks**: `lib/auth.ts` exports `getCurrentUser()` (wraps `supabase.auth.getUser()`) and `getSession()`. Pages that need to know who's logged in call these directly in a `useEffect` (see `app/(customer)/book/page.tsx`) — there's no shared `AuthContext`/provider on the web app (the mobile app has one, in `mobile/context/AuthContext.tsx`; the web app doesn't).

**Known gap:** `/api/auth/login` only returns `{ id, email }` for the user —
no `fullName`/`phoneNumber`. There's no "get my profile" endpoint. The
`Profile` page (`app/(customer)/profile/page.tsx`) doesn't attempt to fetch
real data at all (it's 100% hardcoded — see Known Gaps).

**Server-side API routes** (`GET /api/bookings`, etc.) don't validate a
Supabase session/JWT at all — they trust an `X-User-ID` header sent by the
client, falling back to the literal string `"demo-user"` if absent. This is
fine for a single-developer prototype but is **not real authorization** — any
client can pass any user id in that header and read/act as that user. Treat
this as the top item if "add real security" is ever on the roadmap.

---

## 6. API reference

All routes are under `app/api/`, all return JSON, all `NextRequest`/`NextResponse`.

### Bookings

| Route | Method | Body / Query | Notes |
|---|---|---|---|
| `/api/bookings` | GET | header `X-User-ID` | Returns that user's bookings. No header → `"demo-user"` (returns nothing, since no real user has that id) |
| `/api/bookings` | POST | `{ userId, courtId, bookingDate, startTime, endTime, numPlayers, amountLkr, paymentMode }` | Checks the unique-index slot first (`409` if taken), then inserts. `status`/`paymentStatus` both currently end up `"unpaid"`/`"confirmed"` regardless of `paymentMode` for the initial insert — payment status only flips to `paid` via the PayHere notify webhook. |
| `/api/bookings/[id]` | GET | — | Single booking by id |
| `/api/bookings/[id]` | PATCH | `{ bookingDate?, startTime?, endTime? }` | Reschedule; re-checks the slot is free before applying |
| `/api/bookings/[id]` | DELETE | — | Sets `status: "cancelled"` (soft — row isn't removed) |
| `/api/bookings/availability` | GET | `?date=YYYY-MM-DD&courtId=<uuid>` | Returns `{ availableSlots, bookedSlots, totalSlots }` for that court/date, derived from `courts.openingTime/closingTime/slotDuration` minus existing confirmed bookings |
| `/api/courts` | GET | — | Lists all courts (single-court app → always use `courts[0]`) |

### Auth

| Route | Method | Body | Notes |
|---|---|---|---|
| `/api/auth/signup` | POST | `{ email, phone, fullName, password }` | See Authentication model |
| `/api/auth/login` | POST | `{ email, password }` | See Authentication model |

### Payments (PayHere)

| Route | Method | Body | Notes |
|---|---|---|---|
| `/api/payments/initiate` | POST | `{ bookingId }` | Looks up the booking + user, creates a `payments` row (`status: "pending"`), returns `{ checkoutUrl, fields }` — `fields` is the full PayHere checkout form payload including the signed `hash`. Caller must POST those fields as a real HTML form submission to `checkoutUrl` (PayHere requires POST, not GET/query params — see `components/BookingForm.tsx`'s `redirectToPayHere` for the pattern, or `mobile/app/payhere-checkout.tsx` for the WebView equivalent). |
| `/api/payments/notify` | POST | PayHere's server-to-server webhook (form-encoded, not JSON) | Verifies `md5sig` via `lib/payhere.ts`'s `verifyNotifySignature`, then on success (`status_code === "2"`) marks the payment `completed` and the booking `status: "confirmed"` / `paymentStatus: "paid"`. **Must be reachable from the public internet** — won't fire against `localhost`. |

`lib/payhere.ts` hash logic (both directions use the same MD5-of-MD5
pattern PayHere requires):
```
checkout hash   = MD5(merchantId + orderId + amount.toFixed(2) + currency + MD5(PAYHERE_SECRET).toUpper()).toUpper()
notify signature = MD5(merchantId + orderId + payhereAmount + payhereCurrency + statusCode + MD5(PAYHERE_SECRET).toUpper()).toUpper()
```
`orderId` is always the `payments.id` (uuid), not the `bookings.id`.

### Admin

| Route | Method | Body / Query | Notes |
|---|---|---|---|
| `/api/admin/bookings` | GET | `?status=&date=&limit=` | All bookings, optionally filtered |
| `/api/admin/bookings` | POST | `{ userId, courtId, bookingDate, startTime, endTime, numPlayers, amountLkr }` | Walk-in booking, always `status: "confirmed"`, `paymentStatus: "paid"` |
| `/api/admin/customers` | GET | `?search=&limit=` | Users with `role: "customer"`, enriched with `totalBookings`/`lastBooking`. `search` matches name/email/phone via `ilike` |
| `/api/admin/settings` | GET | header `X-Court-ID` | Returns the court row + its `settings` rows as a flat map |
| `/api/admin/settings` | PATCH | `{ courtId, settings: { key: value, ... } }` | Upserts each key into `settings` |
| `/api/admin/reports` | GET | `?startDate=&endDate=` | Aggregates revenue/occupancy/payment-method stats from `bookings` in-memory (no separate reporting tables) |

**None of the admin routes check `role === "admin"`** — same "trust the
client" model as everything else. There's also no `/admin` route-level auth
gate in `app/admin/layout.tsx`.

---

## 7. The booking flow, end to end

1. `app/(customer)/book/page.tsx` (client component) on mount: calls `getCurrentUser()` (redirects to login-prompt UI if null) and `GET /api/courts` (takes `courts[0]`).
2. Renders `components/BookingForm.tsx` with `userId`/`courtId` as props.
3. `BookingForm` is a 4-step wizard (date → slots → players/payment → confirmation), entirely local state until step 3's "Confirm Booking":
   - `POST /api/bookings` to create the row.
   - If `paymentMode === "payhere"`: `POST /api/payments/initiate`, then builds a hidden `<form>` and submits it to PayHere's `checkoutUrl` (full page navigation away from the app).
   - Otherwise: advances to the step-4 confirmation screen locally.
4. Pricing (`off-peak` before 17:00 / `peak` after) is **hardcoded client-side** in `BookingForm.tsx` (`1500`/`2500`), not read from the `pricing` table — see Known Gaps.
5. Slot availability shown in step 2 is **also hardcoded demo data** (`bookedSlots = ["09:00", "10:00", ...]`) — `BookingForm` never calls `GET /api/bookings/availability`. (The mobile app's booking screen does call it for real — see `mobile/app/(tabs)/book.tsx` if you want the reference implementation to port back to web.)

---

## 8. Known gaps (read before assuming something works)

Components/pages that render **entirely static/hardcoded data**, not real
API calls — safe to use for layout/style work, not for anything data-dependent:

- `app/(customer)/profile/page.tsx` — no fetch at all
- `app/admin/settings/page.tsx` — `handleSave` doesn't call the (working) `/api/admin/settings` PATCH endpoint
- `app/admin/dashboard/page.tsx` — stats are literal numbers in JSX
- `components/MyBookingsList.tsx` / `components/AdminBookingsTable.tsx` / `components/AdminCustomersTable.tsx` — each has a `buildDemo*()` function feeding `useState`'s initial value; marked with `// TODO: replace with a fetch from ...` comments at the call sites
- `BookingForm.tsx`'s slot picker and pricing (section 7 above)

Other gaps:

- **No role/session check on any API route** — `X-User-ID` header is trusted as-is (section 5)
- **`/admin/*` has no auth gate** — anyone with the URL sees it
- **Seeded demo users can't log in** — `lib/db/seed.ts` inserts directly into `users`, bypassing Supabase Auth entirely. Only accounts created via the real `/signup` flow can log in.
- **`pricing` and `blackoutDates` tables are unused** by any route — pricing is hardcoded, blackout dates aren't checked anywhere
- **`NEXT_PUBLIC_COURT_ID`** (a slug like `"kandy-1st-court"`) is used as a fallback in `/api/bookings/availability` but doesn't match any real `courts.id` (a uuid) — effectively dead unless a real `courtId` query param is always passed (which the frontend does via `/api/courts` now)

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

**Mobile app:** lives entirely in `mobile/`, talks to this same API over
HTTP — it does not share code with the web app. See `mobile/README.md` for
its own architecture notes (Expo Router, Supabase session handling, the
WebView-based PayHere checkout).
