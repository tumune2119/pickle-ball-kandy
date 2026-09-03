# 🎾 Kandy 1st Court - Complete Platform

Complete full-stack pickleball court booking platform built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, and PostgreSQL.

## ✅ Platform Components

### 1. **Public Marketing Site** (Complete)
- **Home Page** (`/`) - Hero section, court showcase, pricing preview, testimonials
- **About Page** (`/about`) - Court story, mission, values, team, amenities
- **Pricing Page** (`/pricing`) - Hourly rates, membership tiers, equipment rental
- **Contact Page** (`/contact`) - Contact form, location map, WhatsApp integration
- **Navigation & Footer** - Responsive design, mobile-first

### 2. **Customer Booking System** (Complete with Interactive Form)
- **Book a Court** (`/customer/book`) - 3-step booking wizard
  - Step 1: Date selection with calendar
  - Step 2: Time slot selection (peak/off-peak pricing)
  - Step 3: Player count & payment method
  - Step 4: Confirmation with reference number
- **My Bookings** (`/customer/my-bookings`) - View upcoming/past bookings, reschedule, cancel
- **Dashboard** (`/customer/dashboard`) - Quick stats, recent bookings, membership info
- **Profile** (`/customer/profile`) - Account settings, booking history, preferences

### 3. **Authentication System** (Forms Ready)
- **Login Page** (`/auth/login`) - Email/password login with validation
- **Signup Page** (`/auth/signup`) - Phone + email registration
- API endpoints wired to Supabase auth

### 4. **Admin Portal** (Complete with Data Tables)
- **Dashboard** (`/admin/dashboard`) - Stats cards (today's bookings, revenue, occupancy, members)
- **Manage Bookings** (`/admin/bookings`) - Table with filtering, create manual bookings
- **Manage Customers** (`/admin/customers`) - Search, view history, contact options
- **Settings** (`/admin/settings`) - Configure hours, pricing, slot duration, cancellation policy
- **Reports & Analytics** (`/admin/reports`) - Revenue, occupancy, customer insights, payment status

## 📊 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.2.8 |
| Framework | Next.js (App Router) | 16.3.4 |
| Language | TypeScript | 5.0 |
| Styling | Tailwind CSS | 4.0 |
| Database | PostgreSQL (Supabase) | Latest |
| ORM | Drizzle ORM | 0.45.2 |
| Auth | Supabase Auth | Latest |
| Backend | Next.js API Routes | 16.3.4 |

## 📁 Project Structure

```
pickle-ball-kandy/
├── app/
│   ├── (public)/              # Marketing site
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Home
│   │   ├── about/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── contact/page.tsx
│   │   └── _components/       # Navigation, Footer, Hero, Gallery, etc.
│   │
│   ├── (auth)/                # Authentication
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   │
│   ├── (customer)/            # Customer dashboard
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── book/page.tsx
│   │   ├── my-bookings/page.tsx
│   │   └── profile/page.tsx
│   │
│   ├── admin/                 # Admin portal
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── bookings/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── settings/page.tsx
│   │   └── reports/page.tsx
│   │
│   ├── api/                   # Backend API routes
│   │   ├── auth/
│   │   │   ├── signup/route.ts
│   │   │   └── login/route.ts
│   │   ├── bookings/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   ├── availability/route.ts
│   │   │
│   │   └── admin/
│   │       ├── bookings/route.ts
│   │       ├── customers/route.ts
│   │       ├── settings/route.ts
│   │       └── reports/route.ts
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/                # Reusable React components
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── ImageGallery.tsx
│   ├── PricingCard.tsx
│   ├── AmenityCard.tsx
│   ├── BookingForm.tsx        # Interactive 4-step booking
│   ├── MyBookingsList.tsx     # Bookings with filters
│   ├── LoginForm.tsx          # Login form with API
│   ├── SignupForm.tsx         # Signup form with API
│   ├── AdminBookingsTable.tsx
│   ├── AdminCustomersTable.tsx
│
├── lib/
│   ├── db/
│   │   ├── schema.ts          # Drizzle ORM schema (7 tables)
│   │   ├── db.ts              # Database client
│   │   └── seed.ts            # Sample data seeder
│   ├── auth.ts                # Supabase auth functions
│   ├── utils.ts               # 12+ utility functions
│   ├── hooks.ts               # 5 custom React hooks
│   └── constants.ts           # App-wide constants
│
├── drizzle.config.ts          # ORM migration config
├── package.json               # 30+ dependencies
├── tsconfig.json              # TypeScript config
├── next.config.ts             # Next.js config
├── tailwind.config.ts         # Tailwind CSS config
├── postcss.config.mjs         # CSS processing config
├── eslint.config.mjs          # Linting rules
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
└── README.md                  # This documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20.14.0+ (or 22.0.0+ recommended)
- npm or yarn
- Supabase account (free tier available at supabase.com)

### Installation

1. **Clone and install dependencies**
```bash
git clone https://github.com/tumune2119/pickle-ball-kandy.git
cd pickle-ball-kandy
npm install
```

2. **Set up Supabase**
   - Go to [supabase.com](https://supabase.com) and create a free account
   - Create a new project and get your credentials
   - Copy `.env.example` to `.env.local` and fill in:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   DATABASE_URL=postgresql://user:password@host/dbname
   ```

3. **Initialize Database**
```bash
# Generate Drizzle ORM types
npm run db:generate

# Create tables in your database
npm run db:push

# (Optional) Seed with sample data
npm run db:seed
```

4. **Run Development Server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view.

## 📱 Features

### For Customers
- ✅ Browse court info & pricing
- ✅ Interactive booking calendar
- ✅ Real-time slot availability
- ✅ Peak/off-peak rate display
- ✅ Multiple payment options
- ✅ Booking confirmation
- ✅ View upcoming & past bookings
- ✅ Reschedule with 4-hour policy
- ✅ Cancel with automatic refunds
- ✅ Account dashboard
- ✅ Profile management
- ✅ Booking history

### For Admins
- ✅ Dashboard with key metrics
- ✅ Manage all bookings
- ✅ Create walk-in bookings
- ✅ View customer list
- ✅ Track customer history
- ✅ Configure court hours
- ✅ Set pricing (peak/off-peak)
- ✅ Manage slot duration
- ✅ Configure cancellation policy
- ✅ Revenue analytics
- ✅ Occupancy analysis
- ✅ Payment tracking
- ✅ Export reports as CSV

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new customer
- `POST /api/auth/login` - Login with email/password

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/[id]` - Get specific booking
- `PATCH /api/bookings/[id]` - Update/reschedule booking
- `DELETE /api/bookings/[id]` - Cancel booking
- `GET /api/bookings/availability?date=YYYY-MM-DD` - Get available slots

### Admin
- `GET /api/admin/bookings` - Get all bookings with filters
- `POST /api/admin/bookings` - Create manual booking
- `GET /api/admin/customers` - Get customer list with stats
- `GET /api/admin/settings` - Get court settings
- `PATCH /api/admin/settings` - Update court settings
- `GET /api/admin/reports` - Get analytics data

## 💾 Database Schema

### Tables
1. **users** - Customer & admin accounts
2. **courts** - Court details (hours, rates, slot duration)
3. **bookings** - Booking records with double-booking prevention
4. **payments** - Payment tracking
5. **pricing** - Dynamic pricing by day/time
6. **blackout_dates** - Maintenance/blocked slots
7. **settings** - Court configuration

### Key Features
- ✅ UNIQUE constraint on (courtId, bookingDate, startTime) prevents double-booking
- ✅ Foreign key relationships with cascading deletes
- ✅ Timestamps on all records
- ✅ User roles (customer/admin/staff)
- ✅ Payment status tracking

## 🎨 Styling

- **Tailwind CSS v4** - Utility-first CSS framework
- **Mobile-first design** - Optimized for all screen sizes
- **Responsive breakpoints** - sm (640px), md (768px), lg (1024px)
- **Color Scheme** - Blue primary (#2563eb), semantic colors for status
- **Consistent spacing** - Predictable padding/margins throughout

## 🔐 Security

- TypeScript strict mode throughout
- Database transactions for bookings
- Supabase Auth for user sessions
- Environment variables for secrets
- API route protection (ready for auth middleware)
- No hardcoded credentials

## 📊 Demo Data

The seed script creates:
- 1 court (Kandy 1st Court)
- 3 sample users (1 admin, 2 customers)
- 2 pricing rules (off-peak/peak)
- 3 sample bookings
- 3 settings (cancellation policy, advance booking days, payment mode)

Run `npm run db:seed` to populate sample data.

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full Vercel and Docker deployment guides (the `Dockerfile` and `docker-compose.yml` at the repo root are the real, working versions - this section previously had an outdated inline snippet).

## 📝 Environment Variables

See `.env.example` for complete list:
- Database credentials
- Supabase API keys
- PayHere (optional payment gateway)
- SMTP settings (optional email)
- Currency & timezone config

## 🐛 Troubleshooting

### Database Connection
- Ensure DATABASE_URL is correct
- Check Supabase project is active
- Run `npm run db:push` to migrate

### Booking Conflicts
- Double-booking prevented by UNIQUE constraint
- Check slot availability endpoint first

### Styling Issues
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run build`

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues or questions:
1. Check `/contact` page for support options
2. Email: support@kandycourt.com
3. WhatsApp: +94 71 234 5678

## 🗺️ Roadmap

### Phase 2 (Planned)
- [x] Payment gateway integration (PayHere)
- [ ] Email notifications
- [ ] SMS reminders
- [ ] Membership tier system
- [ ] Team/group bookings
- [ ] Court calendar view for admin

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Video tutorials
- [ ] Equipment rental system
- [ ] Coach booking integration
- [ ] Tournament management
- [ ] Analytics dashboard

---

**Built with ❤️ for Kandy 1st Court**
