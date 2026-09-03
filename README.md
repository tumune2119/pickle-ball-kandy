# Kandy 1st Court - Pickleball Booking Platform

A full-stack booking system for Sri Lanka's first dedicated pickleball court in Kandy. Built with Next.js 16, TypeScript, Tailwind CSS, Supabase, and Drizzle ORM.

## 🎯 Features

### Public Marketing Site
- Home page with hero section, gallery, and call-to-action
- About page with court amenities and features
- Pricing page with hourly rates and peak/off-peak options
- Contact page with WhatsApp, phone, and inquiry form
- Mobile-first responsive design (local users primarily on phones)
- Google Maps integration for court location

### Customer Booking System
- Phone number + email authentication (OTP-based for MVP)
- Court availability calendar with hourly slots
- Booking flow: date → time → players → confirmation
- Real-time availability (prevents double-booking at DB level)
- My Bookings page with cancel/reschedule options
- Payment integration ready (PayHere sandbox for LKR)
- Booking confirmation via email/SMS

### Admin Portal
- Dashboard with today's bookings, revenue, occupancy stats
- Booking management (view, create, edit, cancel)
- Customer management and booking history
- Settings: hours, slot duration, pricing, blackout dates
- CSV export for reporting
- Role-based access control

---

## 🛠️ Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **Frontend** | Next.js 16 (App Router) + React 19 | Modern, full-stack framework |
| **Styling** | Tailwind CSS v4 | Fast, mobile-first styling |
| **Language** | TypeScript | Type safety and dev experience |
| **Database** | PostgreSQL (Supabase) | Reliable, affordable, production-ready |
| **ORM** | Drizzle ORM | Type-safe, zero-overhead, migrations |
| **Auth** | Supabase Auth | OTP support, email-based, free tier |
| **Payments** | PayHere | Sri Lankan cards/LKR, minimal setup |
| **Hosting** | Vercel | Seamless Next.js deployment, cheap |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20.14+ (or 22+)
- **npm** 10.7+
- **PostgreSQL** database (use Supabase free tier)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd pickle-ball-kandy
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Get credentials from **Settings → Database & API**:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### 4. Create Database Tables

```bash
npm run db:generate
npm run db:push
```

### 5. Seed Sample Data

```bash
npm run db:seed
```

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📋 Database Schema

**Key Tables:**
- **users** - Customers and admins
- **courts** - Pickleball court(s)
- **bookings** - Reservations (with UNIQUE constraint to prevent double-booking)
- **payments** - Payment records
- **pricing** - Hourly rates (peak/off-peak)
- **blackout_dates** - Maintenance, events
- **settings** - Court config, cancellation policy

---

## 📦 Project Structure

```
app/
├── (public)/           # Marketing site (home, about, pricing, contact)
├── (auth)/             # Sign up, login, OTP verification
├── (customer)/         # Booking system, my bookings
├── admin/              # Admin dashboard, bookings, customers, settings
└── api/                # API routes

lib/
├── db/                 # Database schema, client, seed
├── auth.ts             # Supabase auth utilities
├── hooks.ts            # React custom hooks
├── utils.ts            # Helpers (formatting, validation)
└── constants.ts        # App constants

components/            # Shared React components
public/               # Images, logos
```

---

## 🔐 Authentication

**Customer:** OTP-based via phone (SMS)
**Admin:** Email + password

---

## 💳 Payments

Two modes: **"Pay at Venue"** (booking confirmed immediately, marked unpaid) and **PayHere** online checkout (LKR cards). PayHere flow: `POST /api/payments/initiate` creates a pending payment row and returns a signed checkout payload; the browser is redirected to PayHere's hosted checkout; PayHere calls `POST /api/payments/notify` server-to-server to confirm, which marks the payment `completed` and the booking `paid`. See `lib/payhere.ts` for the hash/signature logic and [DEPLOYMENT.md](./DEPLOYMENT.md) for sandbox testing steps.

---

## 📱 Key API Routes

```
POST   /api/auth/signup              # Sign up with phone
POST   /api/auth/verify-otp          # Verify OTP
GET    /api/bookings                 # My bookings
POST   /api/bookings                 # Create booking
GET    /api/bookings/availability    # Available slots
PATCH  /api/bookings/[id]            # Reschedule
DELETE /api/bookings/[id]            # Cancel
GET    /api/admin/bookings           # All bookings (admin)
GET    /api/admin/customers          # Customers list (admin)
```

---

## 📦 Build & Deploy

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm run start
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full Vercel and Docker deployment guides, required environment variables, and a post-deploy checklist. CI runs lint + build on every push/PR (`.github/workflows/ci.yml`), and pushes to `main` publish a Docker image to `ghcr.io/<repo>` (`.github/workflows/docker-publish.yml`).

---

## 🧪 Quick Test

After seeding:
- Admin: `admin@kandypickleball.lk`
- Customers: `john@example.lk`, `jane@example.lk`
- Sample bookings created for today + tomorrow

---

## 📄 License

MIT

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
