# Pickle Rush — Rework Plan (Phase 2)

**Branch:** `rework/pickle-rush` · **Status:** awaiting your approval — no building has started on anything in this plan except C1 (already fixed and committed, per your explicit go-ahead).

> `agent-skills:spec-driven-development` and `agent-skills:planning-and-task-breakdown` aren't installed in this environment (same gap noted in Phase 1). This plan substitutes direct planning. `taste-skill:design-taste-frontend` is also not installed — the visual directions below are my own written judgment, not that skill's output.

---

## 1. Visual direction

### Direction A — "Editorial Warm" (already ~70% built — recommended)
Warm neutral/cream base, marigold as the one dominant accent, sage green as a quiet supporting color, Fraunces serif for display headings over Karla sans for body text, glassmorphism panels over real court/equipment photography. Reads as a boutique athletic club, not a generic SaaS template.

This is what the site already looks like today, unedited — run `npm.cmd run dev` (or fix the PowerShell policy as above) and open `/` to see it live, or I can re-screenshot it on request.

**Why recommended:** it's already built across the shared primitives (`Button`/`Card`/`Badge`/`Input`/`Navigation`/`HeroSection`), it already passed the Phase-1 UI/UX audit's "what's good" section (clean heading hierarchy, labeled controls, comfortable mobile reflow), and it already satisfies your own `UI-CONFIG.md`'s "avoid the generic AI look" checklist (no bento grids, no stock-template feel, no gradient-soup CTAs). The two real gaps (`BookingForm.tsx` and the auth pages still using raw Tailwind colors instead of the design tokens — H7/M6 in the audit) are finishing touches, not a redesign. Switching direction now would throw that work away for no concrete problem it solves.

### Direction B — "Courtside Bold"
A punchier, more athletic alternative: higher-contrast palette (deep court-green + a louder citrus accent), a condensed/geometric sans display face instead of a serif, less glass-panel refinement and more direct use of court textures (line markings, net mesh) as background motifs. Reads more "active rec center," less "lifestyle brand." Would require rebuilding the token set, the hero treatment, and re-touching every component that currently references the Direction A palette — essentially redoing the design-system work from scratch.

### Direction C — "Community Utility"
A stripped-back, function-first direction: minimal photography, a plain sans typeface throughout (no display serif), denser information layout (the weekly schedule grid becomes a more prominent homepage element instead of a stat row), less decorative glassmorphism. Reads as "the tool locals actually use to book a court" rather than a marketing site. Would also mean discarding most of the current visual work, though it would keep the component *structure* (just restyle it).

**My recommendation: Direction A.** It's not a sunk-cost argument — it's that the Phase 1 audit found no actual visual-quality problem worth a direction change (the audit's complaint was content honesty and a few un-migrated files, not "this doesn't look right"). B or C would be reasonable choices if you specifically want a different *feel*, not because A is broken. Tell me if you want to see B or C mocked up properly before deciding — I haven't built either, this is a description only, per the "don't start building" instruction.

---

## 2. Page structure

**Keep the current structure — no new routes needed except two.**

| Route | Status | Notes |
|---|---|---|
| `/` (single scroll: home/about/pricing/contact as anchors) | Keep | Already audited as responsive and well-structured; `/about` `/pricing` `/contact` stay as redirect stubs to anchors |
| `/book`, `/login`, `/signup`, `/dashboard`, `/my-bookings`, `/profile` | Keep | Structure is sound; see slice list below for what changes *inside* them |
| `/admin/*` (dashboard/bookings/customers/schedule/settings/reports/login) | Keep | Structure is sound; admin stays visually separate (blue, utilitarian) per your earlier decision |
| **`/terms`, `/privacy`** | **New** | Currently dead links (C5). See Question 2 below. |

No route is being deleted or restructured. The audit didn't find a page-structure problem — it found content and wiring problems *inside* existing pages.

## 3. Mobile booking flow

Already minimized to one scrolling form (Court → Date → Time → Details → Payment, no step-by-step wizard) earlier this session, specifically to cut taps. The audit didn't find a flow problem here — it found that the flow doesn't yet support two real scenarios:

- **A guest managing their own booking after the fact** (H1) — proposed addition: a lightweight "Manage my booking" lookup (enter booking reference + phone or email, no account needed) added to `/my-bookings` for guests, reusing the existing `checkOwnerOrAdmin` pattern's *intent* but keyed by booking reference instead of a session. This is the standard airline/restaurant-reservation pattern and adds zero taps to the booking flow itself — it's a separate, optional lookup. See Question 1.
- **Retrying a failed/cancelled payment** (M1) — proposed addition: a "Retry Payment" action on a `pending_payment` booking card in `MyBookingsList.tsx`, re-using the existing `/api/payments/initiate` endpoint (no new backend needed).

No other flow changes proposed — the existing single-page form stays as-is structurally.

---

## 4. Keep / rewrite / delete

**No database schema changes anywhere in this plan.** Every fix below either changes application logic or wires up DB tables (`pricing`, `settings`) that already exist. If that changes, I'll flag it before touching anything, per your rule.

### Keep as-is (structurally correct, confirmed in Phase 1)
`lib/server-auth.ts`, the booking-creation double-booking guard, `lib/payhere.ts`'s signature verification, the single-page `BookingForm` structure, the single-scroll public homepage, the admin route structure, the design-token system itself.

### Rewrite (bug fixes / wiring, no new features)
| File | Fix | Finding |
|---|---|---|
| `app/api/admin/reports/route.ts` | Filter revenue to non-cancelled/paid bookings; derive payment-method split from `payments.gateway` instead of string-matching `notes`; remove the hardcoded `peakPaymentDay` | H5 |
| `app/admin/(dashboard)/settings/page.tsx` | Wire `handleSave` to the real `PATCH /api/admin/settings` | C2 |
| `lib/utils.ts` (`calculateBookingAmount`) + `app/api/bookings/route.ts` | Read price from the real `pricing` table instead of hardcoded `SAMPLE_PRICING` | H3 (fixes the "settings don't do anything" trap at the root) |
| `app/api/bookings/[id]/route.ts` (`DELETE`) | Wire in `canCancelBooking` against the real `settings.cancellation_policy_hours` (falls back to `CANCELLATION_POLICY_HOURS` if unset) | C3 |
| `app/api/bookings/route.ts`, `app/api/bookings/[id]/route.ts` | Catch the unique-constraint violation specifically and return the existing 409 message instead of a generic 500 | M2 |
| `components/ui/DatePicker.tsx` (`toYMD`) | Asia/Colombo-aware via `Intl.DateTimeFormat`, matching `lib/utils.ts`'s existing pattern | M4 |
| `app/api/payments/notify/route.ts` | Cross-check `payhere_amount` against `payments.amountLkr` before marking paid | M1 |
| `components/MyBookingsList.tsx` | Add "Retry Payment" action; rewrite the Booking Policy box to only state what's actually enforced | M1, C4 |
| `app/(auth)/signup/page.tsx`, `app/api/auth/signup/route.ts` | Real `/terms`/`/privacy` links once they exist; wrap Auth-user + DB-row creation so a failure doesn't orphan one without the other; basic phone/email format validation | C5, M3, L6 |
| `app/api/auth/login/route.ts` | Switch to the anon-key client; add a simple per-IP+email sliding-window rate limit (in-memory — see note below) | H2, L6 |
| `app/(auth)/layout.tsx` | Fix the "Back to Home" link overlap at narrow viewport heights | H6 |
| `app/(public)/page.tsx` | Remove/replace "30+ Active Members" and "Our Team," remove the decorative emoji | H4, C6, M7 |
| `components/BookingForm.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx` | Finish the design-token migration (replace raw `green-*`/`gray-*`/etc. with the semantic tokens) | H7, M6 |
| `app/api/admin/customers/route.ts` | Replace the N+1 per-customer query with the `inArray` pattern already used correctly in the sibling bookings route; add `.orderBy()` for "last booking" | quality-fork findings |
| `lib/db/seed.ts` | Rewrite to match the real 3-court schema, or mark clearly deprecated in favor of the one-off script that actually created the real courts | quality-fork findings |
| `DEVELOPER_GUIDE.md`, `README.md` | Fix stale paths/claims found in the audit (4-step wizard, pre-route-group admin paths, OTP-vs-email/password contradiction, dangling mobile reference) | L4 |

**Rate-limiting note:** an in-memory limiter only works correctly on a single long-running server (the Docker deployment path your `DEPLOYMENT.md` already documents). If you deploy serverless (Vercel, multiple instances), it needs a shared store (e.g. Upstash/Vercel KV) instead. I'm proposing the in-memory version now since it's a strict improvement over nothing and deployment-agnostic to build — flag if you know you're going serverless and I'll scope the shared-store version instead.

### Delete (confirmed dead, not part of any planned feature)
`lib/hooks.ts` (5 unused hooks), `lib/utils.ts`'s `isToday`/`getDayName`/`isSlotAvailable`/`calculateBookingHours` (dead, distinct from `canCancelBooking` which is being wired in, not deleted), `public/file.svg`/`globe.svg`/`next.svg`/`vercel.svg`/`window.svg` (unused Next.js starter assets), `app/api/courts/route.ts`'s stale "single-court MVP" comment.

### Compressed, not rewritten
`public/images/hero-court-bg.png` — compress from 3.1MB to roughly 200-400KB (Performance finding). No code change, just a smaller file.

---

## 5. Ordered slices

Each slice is independently testable and can ship/be reviewed on its own, per your instruction. Security/data fixes first, then design-system finishing, then the public pages, then the booking flow, then the customer area, then admin — matching your stated order.

| # | Slice | Covers | Why this order |
|---|---|---|---|
| 1 | ✅ **Security & data-integrity fixes** | H2 (rate limit), M2 (friendly 409 on race), M3 (signup transaction), M1's amount cross-check half | Nothing else depends on these; they're pure hardening with no visual/content dependency |
| 2 | ✅ **Settings/pricing wiring** | C2, H3 | Unblocks admin trust in their own tools; needed before slice 6 (admin) is meaningfully "done" |
| 3 | ✅ **Cancellation policy enforcement** | C3 | Needed before slice 5 can honestly rewrite the Booking Policy box |
| 4 | **Design-system finishing pass** | H7, M6 | Pure visual migration, no logic change, easy to review in isolation |
| 5 | **Public page content & structure** | H4, C6, M7, H6, new `/terms`/`/privacy` | Depends on your answers to Questions 2-3 below |
| 6 | **Booking flow additions** | M1 (retry payment), H1 (guest lookup), M4 (timezone fix) | Depends on your answer to Question 1 |
| 7 | **Customer area polish** | C4's rewrite (once slice 3 lands, the policy box can finally tell the truth) | Depends on slice 3 |
| 8 | **Admin fixes** | H5 (reports bugs), the N+1/ordering fixes | Independent of everything else, can move earlier if you'd rather |
| 9 | **Cleanup** | Dead-code deletion, hero image compression, stale-doc fixes | Lowest risk, can run anytime, last so it doesn't get in the way of review diffs on the slices above |

Each slice gets its own commit(s) on `rework/pickle-rush`, its own `tsc`/`lint`/`build` + Taste-inspector-equivalent pass, and (where it touches booking/payment/auth logic) TDD-style tests written first — once a confirmed test database exists, per your safety rule.

### Slice 1 — done, 2026-11-03
- `lib/rate-limit.ts` (new): simple in-memory sliding-window limiter, documented single-instance caveat.
- `app/api/auth/login/route.ts`: rate-limited 5 attempts / 15 min per IP+email (429 + `Retry-After`); switched to the anon-key client instead of service-role (no reason it needed admin privileges).
- `lib/db/db.ts`: added `isUniqueViolation()` helper (Postgres code `23505`).
- `app/api/bookings/route.ts`, `app/api/bookings/[id]/route.ts`: catch a unique-constraint race and return the existing friendly 409 instead of a generic 500.
- `app/api/auth/signup/route.ts`: compensating-delete of the Supabase Auth user if the DB insert fails, so a DB hiccup can't orphan an email permanently; added phone-format validation via the previously-dead `isValidPhoneNumber`.
- `app/api/payments/notify/route.ts`: cross-checks `payhere_amount` against the expected `payments.amountLkr` before marking a booking paid.
- **Verified:** `npx tsc --noEmit` clean, `npm run lint` unchanged (same 6 pre-existing warnings), `npm run build` succeeds, all 33 routes present.
- **Not done:** no Playwright tests were added or run. Every "main journey" this slice touches (login, signup, booking creation, payment) requires creating real data to exercise meaningfully, and no test database is confirmed yet — per your safety rule, I stopped rather than test against production. Let me know when a test DB exists and I'll write and run real tests for this slice's logic (especially the rate limiter and the signup rollback, which are the two riskiest to leave unverified).

### Slice 2 — done, 2026-11-03
This turned out larger than "wire the Save button": the settings form had 8 fields, but only `cancellationHours` had anywhere to actually persist (the generic `settings` key-value table). `openingTime`/`closingTime`/`slotDuration` are real columns on `courts`; `offPeakRate`/`peakRate` are real columns on `pricing`; `maxPlayers` and `refundPercentage` had **no backing storage anywhere** in the schema (confirmed by reading it) - nothing in the app enforces a max-player-count or processes a refund, so I removed those two fields from the form rather than silently write them somewhere nothing reads back, which would've just been a quieter version of the same C2 bug. Also: the real DB only has pricing/settings rows for Court 1 - Court 2 and 3 have none, so every lookup needed a safe fallback to the existing hardcoded defaults.

- `lib/pricing.ts` (new, server-only): the one place that now decides what an hour costs on a given court - real `pricing` table rows if an admin has set any, the old hardcoded 1,500/2,500 split otherwise. Both booking creation/reschedule and the availability endpoint (for the per-slot price shown while picking a time) read from here, so a customer is never shown a different price than they're actually charged.
- `app/api/bookings/route.ts`, `app/api/bookings/[id]/route.ts`: now compute price via `calculateBookingAmountForCourt` (DB-aware) instead of the old hardcoded `calculateBookingAmount`, which is now dead and was removed from `lib/utils.ts`.
- `app/api/bookings/availability/route.ts`: now returns a `rates` map (price + peak flag per slot).
- `components/BookingForm.tsx`: deleted its own separate hardcoded `isOffPeak`/1500/2500 logic (it was never reading from `lib/utils.ts` in the first place) in favor of the server's real `rates` - slot grid, legend, and the running total all now reflect real pricing, with the same hardcoded numbers only as a loading-state fallback.
- `app/api/admin/settings/route.ts`: `GET` now also returns real pricing (via the same `lib/pricing.ts` lookup) and `courtInfo`; `PATCH` now writes `courtHours` to `courts`, `pricing` to `pricing`, and free-form keys to `settings` - three real destinations instead of one that nothing read.
- `app/admin/(dashboard)/settings/page.tsx`: rewritten - added a court selector (the venue has 3 courts now; the old form had no way to pick one), loads real current values on open instead of hardcoded `useState` defaults, removed the two unbacked fields, `handleSave` now actually calls the API and shows a real error on failure instead of just a fake success toast either way.
- **Verified:** `tsc --noEmit` clean, lint unchanged, `npm run build` succeeds. Viewed live at 390/768/1440px on `/book` with a real date selected - slot grid, legend, and running total all correctly show LKR 1,500/2,500 sourced from the real `pricing` table for Court 1 (matches today, as expected - that's what's actually in the DB). Did **not** log into `/admin/settings` and click Save to verify the write path live - that would write real configuration for the real Court 1, which crosses into "changing data" under the current safety rules even though it's legitimate config rather than test junk. The write path is verified by code review and the clean build only. Let me know if you want me to verify it live (I'd need you to either confirm that's acceptable, or give me a way to log in as admin without creating a new account).

### Slice 3 — done, 2026-11-03
Wired the already-existing (previously dead) `canCancelBooking` into `DELETE /api/bookings/[id]`: reads the court's `settings.cancellation_policy_hours` (falls back to the `CANCELLATION_POLICY_HOURS` constant if unset), blocks a customer's own cancellation with a 400 if it's inside the window, returns `Free cancellation requires at least N hours' notice`. Staff/admin cancelling on a customer's behalf still bypass the window (goodwill/phoned-in requests) - only self-service cancellation is time-gated. No new file, no new abstraction - one existing pure function, one query, inline in the route that needed it (nothing else reads this setting yet).

Guest bookings aren't affected by this change since guests can't call this endpoint at all yet (H1, still slice 6) - when the guest "manage my booking" lookup is built, it'll need the same check re-applied there.

**Verified:** `tsc --noEmit` clean, lint unchanged, `npm run build` succeeds. Self-checked `canCancelBooking`'s date-math boundary directly (5h-ahead allowed, 3h-ahead blocked, just-over-4h allowed) since it's a pure function and didn't need the DB. No UI changed in this slice (pure backend behavior), so nothing new to view at the three widths.

### Slice 4 — done, 2026-11-03
Finished migrating raw Tailwind colors (H7, M6) to the semantic design tokens already established elsewhere in the app (`text-text-primary`/`text-text-muted`/`text-text-faint`, `border-border-subtle`, `success-*`/`warning-*`/`danger-*`). Covered `components/BookingForm.tsx` (slot grid, legend, guest-details box, payment cards, error banner, summary card), `app/(auth)/layout.tsx` (glass-card background now matches `Card.tsx`'s neutral `GLASS_TINTS` pattern instead of a one-off `gray-900/60`), `components/LoginForm.tsx`, and `components/SignupForm.tsx` (including the post-signup success state's green checkmark/button, now `success-*`). Confirmed against the real scale in `app/globals.css` before substituting — no `warning-500`/`success-500`/`danger-500`/`-200`/`-950` steps exist, so spots that would've used those fall back to the nearest real step (e.g. `warning-700` for a peak-slot accent dot instead of a nonexistent `warning-500`).

**Verified:** grepped all four files for `gray-[0-9]|white/[0-9]|green-[0-9]|red-[0-9]|orange-[0-9]|blue-[0-9]` — zero matches. `tsc --noEmit` clean, `npm run build` succeeds (32 routes), lint still exactly the 6 pre-existing warnings (none new). Viewed `/login` and `/signup` live at 390/768/1440px — glass card, inputs, and the OR-divider all render correctly with real tokens. Did **not** get a working dark-mode screenshot: the dark toggle here is class-based (persisted via the UI toggle), not pure `prefers-color-scheme`, so Playwright's `emulateMedia` didn't flip it — not a regression from this slice, just a verification gap; a real click-the-toggle check would be needed to see dark mode live.

### Slice 5 — done, 2026-11-03
Per your answers to the Phase 2 questions — removed the fabricated "30+ Active Members" stat and the entire "Our Team" section (three invented names/roles, C6/H4) from `app/(public)/page.tsx`, and removed the unverifiable "Founded in 2024" claim from both the hero stats note and the "Our Story" paragraph (C6). `HeroSection.tsx`'s stat grid now sizes itself to 3 columns instead of a hardcoded 4, so the layout doesn't leave a gap where the removed stat used to be — the only other caller is this same page, so no other page is affected. Left "Sri Lanka's First Dedicated Pickleball Court" as-is (not in the audit's Business-Fact table, unlike the removed items), but dropped the decorative 🏓 emoji from that hero subtitle per M7 (the project's own anti-slop style rules ban decorative emoji).

Drafted real (if clearly-marked-draft) `/terms` and `/privacy` pages (C5) instead of leaving them as dead `href="#"` links — each is flagged up top as a placeholder needing legal review before launch. Wired the signup form's "Terms of Service" checkbox link and the footer's "Terms of Service"/new "Privacy Policy" links to the real pages instead of `#`.

Fixed H6: `/signup`'s "Back to Home" link overlapping the glass card at 390px. The auth layout was vertically centering the card with `overflow-hidden`, so on signup's taller form the card's clipped top edge landed right under the link. Switched to `items-start` with top padding and let the page scroll (`overflow-x-hidden` instead of `overflow-hidden`) — the link now always has dedicated space above the card regardless of form height or viewport height; login (shorter form) still reads as comfortably centered-ish, just anchored near the top instead of mathematically centered.

**Not done this slice:** didn't touch the footer's still-dead "FAQ"/"Booking Policy"/"Cancellation Policy" links or the nonexistent `/faq` route — out of scope for what was asked (ToS/Privacy specifically), flagging so it's not mistaken for finished.

**Verified:** `tsc --noEmit` clean, lint unchanged (6 pre-existing warnings), `npm run build` succeeds (34 routes, `/terms` and `/privacy` both present and static). Viewed homepage hero at 390px (3 even stats, no emoji, no founding-date claim), confirmed via `playwright-cli find "Our Team"` that the section is gone, viewed `/terms` at 390px and `/privacy` at 1440px (both render with the placeholder-draft banner and correct footer links), and viewed `/signup` at 390px confirming the "Back to Home" link no longer overlaps the card.

### Slice 6 — done, 2026-11-03
Built real guest self-service cancellation (H1) rather than just fixing copy, per your instruction. A guest has no account, so a new `/manage-booking` page (`components/ManageBookingForm.tsx`) looks a booking up by the short confirmation code shown right after booking (`BK#XXXXXXXX`) plus the phone number given at booking time - the same "something only they have" idea as an airline's confirmation-code lookup, not a weaker form of auth, just a different one. Two new routes: `POST /api/bookings/manage` (lookup, rate-limited 10/15min by IP) and `DELETE /api/bookings/manage/[id]` (cancel, re-verifies the code+phone pair itself rather than trusting the lookup response, same rate limit). Both return the same generic "not found" whether the booking doesn't exist, isn't a guest booking, or the phone doesn't match, so a wrong guess can't be used to probe for a valid booking id.

Extracted the cancellation-window check (court's `cancellation_policy_hours` setting, falling back to the constant) out of `app/api/bookings/[id]/route.ts` into `lib/cancellation.ts` so the new guest path and the existing account-holder path share one implementation instead of two that could drift - directly addresses the "re-apply the Slice 3 check" note from Slice 3's write-up. Also extracted `clientIp` out of the login route into `lib/rate-limit.ts` since a third copy would otherwise appear here.

Added the "Retry Payment" UI the plan called out: both `MyBookingsList.tsx` (account holders) and the new guest page now show a Retry Payment button for `pending_payment` bookings, reusing `POST /api/payments/initiate` (already worked for guests, just had no UI). Extracted the PayHere-checkout-redirect form-POST helper (previously only inside `BookingForm.tsx`) into `lib/payhere-client.ts` since it's now used in three places.

Fixed M4 (DatePicker computed "today" in the visitor's browser timezone, not Asia/Colombo) - added `ymdInVenueTimezone()` to `lib/utils.ts` and used it for both `DatePicker.tsx`'s today-highlight and `BookingForm.tsx`'s min/max bookable date, instead of raw `new Date()`.

Also fixed two things found while in this code, not originally listed: `BookingForm.tsx`'s success screen claimed "a confirmation email has been sent" - nothing in this codebase sends email (checked), so that was a fabricated claim under the same rule as C6; replaced it with guest-specific guidance pointing to `/manage-booking`. And `MyBookingsList.tsx` had three buttons wired to nothing (Reschedule, Receipt, Book Again) with no visual indication they were non-functional - "Book Again" now links to `/book` (a real, working destination), Reschedule and Receipt are now `disabled` with a "Coming soon" tooltip instead of silently doing nothing on click; also surfaced cancel/retry failures in that component, which were previously swallowed silently.

**Not done this slice:** no actual reschedule flow, receipt generation, or rebooking prefill - those are real features, not bug fixes, and weren't in the plan; disabling the dead buttons is honest, building the features is out of scope here.

**Verified:** `tsc --noEmit` clean, lint unchanged (6 warnings), `npm run build` succeeds (36 routes). Self-checked (via `node -e` + `assert`, pure functions, no DB) that phone normalization treats equivalent formats as equal and different numbers as different, and that confirmation-code matching accepts `BK#`-prefixed/bare/mixed-case input and rejects a wrong code. Hit `/api/bookings/manage` and `/api/bookings/manage/[id]` live with a deliberately-wrong code/phone and a nonexistent booking id - both correctly returned "not found", no data touched. Viewed `/manage-booking` live at 390px and confirmed the new Footer "Manage Booking" link points there. Viewed `/book` live, opened the date picker, and confirmed Nov 3 2026 (today) is correctly ringed with the 1st/2nd disabled, verifying the timezone fix against the real system clock. Did **not** verify a successful lookup end-to-end (would need a real guest booking's actual phone number, which isn't something to guess/brute-force even for testing) - logic was verified via a read-only script against the real DB instead (found the one existing guest booking, confirmed the match/no-match branches both behave correctly).

**Incidental:** restarted the local dev server mid-slice after the new API routes returned 500s that turned out to be a stale Turbopack build cache (confirmed via a standalone script hitting the same code path successfully) rather than a real bug - noting this since it's a local dev-environment action, not a data change.

---

## Questions — only what I can't work out myself

1. **Guest self-service cancellation (H1):** build the "Manage my booking" lookup (recommended — see §3), or keep it staff-assisted-only and just fix the marketing copy to stop promising something customers can't do themselves?
2. **Terms of Service / Privacy Policy (C5):** want me to draft simple, honest placeholder pages (clearly marked "needs legal review before launch") so the signup link isn't dead, or will you supply real text?
3. **"Our Team," "30+ Active Members," "Founded in [year]" (C6, H4):** real values, or should I just remove these sections/claims until you have real content for them?

Everything else in this plan I'm treating as already decided by the Phase 1 findings themselves (e.g. "fix the broken reports math" doesn't need a design decision). Let me know on the three questions above, confirm or redirect the visual direction, and I'll start on slice 1.
