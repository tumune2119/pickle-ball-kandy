import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  time,
  numeric,
  integer,
  boolean,
  uniqueIndex,
  index,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Every table in this app is only ever read/written by the Next.js API
// routes over the direct Postgres connection (DATABASE_URL, the "postgres"
// role), which bypasses RLS entirely - nothing here is queried through
// Supabase's PostgREST/JS-client `.from()` API. RLS is enabled on all of
// them (closes off the public anon key, which PostgREST would otherwise
// honor), and this one explicit "deny everyone" policy is attached to each
// table so that's a documented decision rather than an accidental empty
// policy list (which is what Supabase's linter was flagging).
function noDirectAccessPolicy() {
  return pgPolicy("no_direct_access", {
    as: "restrictive",
    for: "all",
    to: "public",
    using: sql`false`,
  });
}

// Users table
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // .unique() already creates a backing unique index - an additional
    // explicit uniqueIndex() on the same column was a duplicate (Supabase's
    // linter flagged it), so there's no separate index config here.
    email: varchar("email", { length: 255 }).unique().notNull(),
    phoneNumber: varchar("phone_number", { length: 20 }).unique().notNull(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 })
      .default("customer")
      .notNull(), // 'customer', 'admin', 'staff'
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  () => ({
    noDirectAccess: noDirectAccessPolicy(),
  })
).enableRLS();

// Courts table (supports multiple courts in future)
export const courts = pgTable(
  "courts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    location: varchar("location", { length: 500 }),
    googleMapsUrl: text("google_maps_url"),
    openingTime: time("opening_time").default("06:00").notNull(),
    closingTime: time("closing_time").default("22:00").notNull(),
    slotDuration: integer("slot_duration").default(60).notNull(), // minutes
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  () => ({
    noDirectAccess: noDirectAccessPolicy(),
  })
).enableRLS();

// Bookings table
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Nullable so a booking can be made without an account - see
    // guestName/guestPhone/guestEmail below, which are set instead when
    // userId is null.
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    courtId: uuid("court_id").notNull().references(() => courts.id, {
      onDelete: "cascade",
    }),
    bookingDate: date("booking_date", { mode: "string" }).notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    numPlayers: integer("num_players").default(2).notNull(),
    guestName: varchar("guest_name", { length: 255 }),
    guestPhone: varchar("guest_phone", { length: 20 }),
    guestEmail: varchar("guest_email", { length: 255 }),
    status: varchar("status", { length: 50 })
      .default("confirmed")
      .notNull(), // 'confirmed', 'pending_payment', 'paid', 'cancelled'
    paymentStatus: varchar("payment_status", { length: 50 })
      .default("unpaid")
      .notNull(), // 'unpaid', 'paid', 'refunded'
    amountLkr: numeric("amount_lkr", { precision: 10, scale: 2 }),
    notes: text("notes"),
    // Separate from `status` (payment/cancellation lifecycle) - orthogonal:
    // a confirmed booking can be checked in or not, regardless of payment
    // state. Set by staff at the counter via the POS check-in flow.
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    // Prevent double booking - unique constraint at DB level
    bookingUniqueIdx: uniqueIndex().on(
      table.courtId,
      table.bookingDate,
      table.startTime
    ),
    // userId has no other index covering it (unlike courtId, which is the
    // leading column of the unique index above) - admin lookups and the
    // FK's own cascade-delete both scan by it.
    userIdIdx: index().on(table.userId),
    noDirectAccess: noDirectAccessPolicy(),
  })
).enableRLS();

// Payments table
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id").notNull().references(() => bookings.id, {
      onDelete: "cascade",
    }),
    // Nullable like bookings.userId - a guest payment has no account to
    // reference.
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    amountLkr: numeric("amount_lkr", { precision: 10, scale: 2 }).notNull(),
    gateway: varchar("gateway", { length: 50 }), // 'payhere', 'manual'
    gatewayTransactionId: varchar("gateway_transaction_id", { length: 255 }),
    status: varchar("status", { length: 50 })
      .default("pending")
      .notNull(), // 'pending', 'completed', 'failed', 'refunded'
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    bookingIdIdx: index().on(table.bookingId),
    userIdIdx: index().on(table.userId),
    noDirectAccess: noDirectAccessPolicy(),
  })
).enableRLS();

// Pricing table (hourly rates by day/time)
export const pricing = pgTable(
  "pricing",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courtId: uuid("court_id").notNull().references(() => courts.id, {
      onDelete: "cascade",
    }),
    dayOfWeek: integer("day_of_week"), // 0=Sunday, 1=Monday, etc.; NULL = all days
    startTime: time("start_time"),
    endTime: time("end_time"),
    ratePerHour: numeric("rate_per_hour", { precision: 10, scale: 2 }).notNull(),
    peak: boolean("peak").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    courtIdIdx: index().on(table.courtId),
    noDirectAccess: noDirectAccessPolicy(),
  })
).enableRLS();

// Blackout dates (for maintenance, private events)
export const blackoutDates = pgTable(
  "blackout_dates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courtId: uuid("court_id").notNull().references(() => courts.id, {
      onDelete: "cascade",
    }),
    blackoutDate: date("blackout_date", { mode: "string" }).notNull(),
    startTime: time("start_time"),
    endTime: time("end_time"),
    reason: varchar("reason", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    courtIdIdx: index().on(table.courtId),
    noDirectAccess: noDirectAccessPolicy(),
  })
).enableRLS();

// POS product catalog (retail items, rentals) - sold at the counter via
// posSales/posSaleItems below. A walk-in court booking is never a product -
// it's always an ordinary `bookings` row, kept as a separate receipt.
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(), // 'rental', 'retail', 'membership', 'other'
    priceLkr: numeric("price_lkr", { precision: 10, scale: 2 }).notNull(),
    stockCount: integer("stock_count"), // null = not tracked
    // A small, pre-resized data: URL (set client-side before upload) rather
    // than a storage bucket - the catalog is a handful of admin-uploaded
    // product icons, not user-generated media, so no object storage needed.
    imageUrl: text("image_url"),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  () => ({
    noDirectAccess: noDirectAccessPolicy(),
  })
).enableRLS();

// POS sales (retail/rental checkout at the counter). `id` is client-generated
// by the till (not defaultRandom) so an offline-queued sale retried after
// reconnect is idempotent - onConflictDoNothing on this primary key, not a
// duplicate sale.
export const posSales = pgTable(
  "pos_sales",
  {
    id: uuid("id").primaryKey(),
    soldByUserId: uuid("sold_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    paymentMethod: varchar("payment_method", { length: 20 }).notNull(), // 'cash', 'card'
    totalLkr: numeric("total_lkr", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    soldByIdx: index().on(table.soldByUserId),
    noDirectAccess: noDirectAccessPolicy(),
  })
).enableRLS();

// Line items for a POS sale. productName/unitPriceLkr are snapshots at sale
// time so a receipt stays accurate even if the product is later renamed,
// repriced, or deactivated.
export const posSaleItems = pgTable(
  "pos_sale_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    saleId: uuid("sale_id")
      .notNull()
      .references(() => posSales.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    productName: varchar("product_name", { length: 255 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceLkr: numeric("unit_price_lkr", { precision: 10, scale: 2 }).notNull(),
    lineTotalLkr: numeric("line_total_lkr", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => ({
    saleIdIdx: index().on(table.saleId),
    noDirectAccess: noDirectAccessPolicy(),
  })
).enableRLS();

// Cancellation policy settings
export const settings = pgTable(
  "settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courtId: uuid("court_id").notNull().references(() => courts.id, {
      onDelete: "cascade",
    }),
    key: varchar("key", { length: 255 }).notNull(),
    value: text("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    courtIdIdx: index().on(table.courtId),
    noDirectAccess: noDirectAccessPolicy(),
  })
).enableRLS();
