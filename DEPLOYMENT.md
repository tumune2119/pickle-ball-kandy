# Deployment Guide

Two supported paths: **Vercel** (zero-config, recommended for this app) and
**Docker** (any VPS, Fly.io, Cloud Run, etc.). Both need the same environment
variables — set these up first.

## 1. Environment variables

Copy `.env.example` to `.env.local` and fill in real values. At minimum, production needs:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Supabase → Settings → Database → Connection string (use the pooled connection string) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (keep secret, server-only) |
| `NEXT_PUBLIC_PAYHERE_MERCHANT_ID` | PayHere merchant dashboard |
| `PAYHERE_SECRET` | PayHere merchant dashboard → Domains & Credentials (keep secret) |
| `PAYHERE_BASE_URL` | `https://sandbox.payhere.lk/pay/checkout` for testing, `https://www.payhere.lk/pay/checkout` for production |
| `NEXT_PUBLIC_APP_URL` | Your production URL, e.g. `https://kandypickleball.lk` — used to build PayHere's `return_url`/`cancel_url`/`notify_url` |

Before going live, run the schema migration and seed once against production:

```bash
npm run db:generate
npm run db:push
npm run db:seed   # optional - creates demo users/bookings, skip for a real launch
```

In PayHere's merchant dashboard, add `https://<your-domain>/api/payments/notify` as the notify URL for your domain (PayHere calls this server-to-server after a payment; it will not work on `localhost`).

## 2. Deploying to Vercel

Vercel is a verified Next.js deployment target — no adapter configuration needed.

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Add all the environment variables from step 1 in the Vercel project settings (Settings → Environment Variables). Set them for both **Production** and **Preview**.
4. Deploy. Vercel runs `npm run build` automatically.
5. Update `NEXT_PUBLIC_APP_URL` to the final Vercel URL (or your custom domain) and redeploy — PayHere's callback URLs are baked in at request time from this variable, so it must match your live domain.

Or from the CLI:

```bash
npm i -g vercel
vercel --prod
```

## 3. Deploying with Docker

The `Dockerfile` builds a minimal production image using Next's `output: "standalone"` (already set in `next.config.ts`). The `docker-compose.yml` runs the app and, optionally, a local Postgres if you don't want to use Supabase for the database.

### Build and run directly

```bash
docker build -t pickle-ball-kandy \
  --build-arg DATABASE_URL="$DATABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --build-arg SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  .

docker run -p 3000:3000 --env-file .env.local pickle-ball-kandy
```

The build-time `--build-arg`s are needed because `lib/db/db.ts` and `lib/auth.ts` read these variables at module load time, which happens during `next build`'s page-data collection step. The runtime `--env-file` supplies the real values the running server uses for every request (including `PAYHERE_SECRET`, which is never needed at build time and should not be passed as a build arg).

### Or with Compose

```bash
docker compose up --build
```

This starts the app on `:3000` and, if you point `DATABASE_URL` at `db:5432` in `.env.local`, a local Postgres instance too. If you're using Supabase, you can ignore/remove the `db` service and just point `DATABASE_URL` at Supabase.

### Hosting the container

Any provider that runs Docker images works: Fly.io, Railway, Render, DigitalOcean App Platform, Google Cloud Run. All of them just need the same environment variables from step 1 configured as secrets/env vars in their dashboard, and port `3000` exposed.

## 4. Post-deploy checklist

- [ ] Visit `/api/courts` and confirm it returns the seeded court (confirms `DATABASE_URL` is wired correctly)
- [ ] Sign up a test account and confirm a row appears in Supabase Auth **and** the `users` table
- [ ] Complete a test booking with "Pay at Venue" — confirms the booking flow end-to-end
- [ ] Complete a test booking with PayHere in **sandbox** mode (`PAYHERE_BASE_URL=https://sandbox.payhere.lk/pay/checkout`) using [PayHere's sandbox test cards](https://support.payhere.lk/api-&-mobile-sdk/sandbox-testing) — confirms the checkout hash and notify webhook are correct
- [ ] Only switch `PAYHERE_BASE_URL` to the production checkout URL once sandbox payments confirm and update `bookings.paymentStatus` to `paid`
