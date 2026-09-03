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
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Users table
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
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
  (table) => ({
    emailIdx: uniqueIndex().on(table.email),
    phoneIdx: uniqueIndex().on(table.phoneNumber),
  })
);

// Courts table (supports multiple courts in future)
export const courts = pgTable("courts", {
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
});

// Bookings table
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, {
      onDelete: "cascade",
    }),
    courtId: uuid("court_id").notNull().references(() => courts.id, {
      onDelete: "cascade",
    }),
    bookingDate: date("booking_date", { mode: "string" }).notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    numPlayers: integer("num_players").default(2).notNull(),
    status: varchar("status", { length: 50 })
      .default("confirmed")
      .notNull(), // 'confirmed', 'pending_payment', 'paid', 'cancelled'
    paymentStatus: varchar("payment_status", { length: 50 })
      .default("unpaid")
      .notNull(), // 'unpaid', 'paid', 'refunded'
    amountLkr: numeric("amount_lkr", { precision: 10, scale: 2 }),
    notes: text("notes"),
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
  })
);

// Payments table
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id, {
    onDelete: "cascade",
  }),
  userId: uuid("user_id").notNull().references(() => users.id, {
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
});

// Pricing table (hourly rates by day/time)
export const pricing = pgTable("pricing", {
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
});

// Blackout dates (for maintenance, private events)
export const blackoutDates = pgTable("blackout_dates", {
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
});

// Cancellation policy settings
export const settings = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  courtId: uuid("court_id").notNull().references(() => courts.id, {
    onDelete: "cascade",
  }),
  key: varchar("key", { length: 255 }).notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});
