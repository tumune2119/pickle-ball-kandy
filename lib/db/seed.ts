import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, courts, bookings, pricing, settings } from "./schema";
import * as schema from "./schema";

// This script runs standalone via `tsx`, not through `next dev`, so it
// doesn't get Next.js's automatic .env.local loading - load it explicitly.
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data (in development only)
    console.log("Clearing existing data...");
    await db.delete(schema.bookings);
    await db.delete(schema.payments);
    await db.delete(schema.pricing);
    await db.delete(schema.blackoutDates);
    await db.delete(schema.settings);
    await db.delete(schema.courts);
    await db.delete(schema.users);

    // 1. Create court
    console.log("Creating court...");
    const courtResult = await db
      .insert(courts)
      .values({
        name: "Kandy 1st Court",
        location: "Kandy, Sri Lanka",
        googleMapsUrl:
          "https://maps.google.com/?q=Kandy+1st+Court+Kandy+Sri+Lanka",
        openingTime: "06:00",
        closingTime: "22:00",
        slotDuration: 60,
      })
      .returning();
    const courtId = courtResult[0].id;
    console.log(`✓ Court created with ID: ${courtId}`);

    // 2. Create users
    console.log("Creating sample users...");
    const adminResult = await db
      .insert(users)
      .values({
        email: "admin@kandypickleball.lk",
        phoneNumber: "+94712345678",
        fullName: "Court Manager",
        role: "admin",
      })
      .returning();
    const adminId = adminResult[0].id;
    console.log(`✓ Admin user created with ID: ${adminId}`);

    const customerResult = await db
      .insert(users)
      .values([
        {
          email: "john@example.lk",
          phoneNumber: "+94701234567",
          fullName: "John Silva",
          role: "customer",
        },
        {
          email: "jane@example.lk",
          phoneNumber: "+94702345678",
          fullName: "Jane Perera",
          role: "customer",
        },
      ])
      .returning();
    const customer1Id = customerResult[0].id;
    const customer2Id = customerResult[1].id;
    console.log(
      `✓ Customer users created with IDs: ${customer1Id}, ${customer2Id}`
    );

    // 3. Create pricing rules
    console.log("Creating pricing rules...");
    await db.insert(pricing).values([
      {
        courtId,
        dayOfWeek: null, // All days
        startTime: "06:00",
        endTime: "17:00",
        ratePerHour: "1500.00", // LKR 1500 off-peak
        peak: false,
      },
      {
        courtId,
        dayOfWeek: null, // All days
        startTime: "17:00",
        endTime: "22:00",
        ratePerHour: "2500.00", // LKR 2500 peak
        peak: true,
      },
    ]);
    console.log("✓ Pricing rules created");

    // 3. Create sample settings
    console.log("Creating settings...");
    await db.insert(settings).values([
      {
        courtId,
        key: "cancellation_policy_hours",
        value: "4",
      },
      {
        courtId,
        key: "default_payment_mode",
        value: "pay_at_venue",
      },
      {
        courtId,
        key: "max_booking_advance_days",
        value: "30",
      },
    ]);
    console.log("✓ Settings created");

    // 4. Create sample bookings (today and tomorrow)
    console.log("Creating sample bookings...");
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    await db.insert(bookings).values([
      {
        userId: customer1Id,
        courtId,
        bookingDate: today,
        startTime: "09:00",
        endTime: "10:00",
        numPlayers: 2,
        status: "confirmed",
        paymentStatus: "unpaid",
        amountLkr: "1500.00",
        notes: "First booking - 9 AM",
      },
      {
        userId: customer2Id,
        courtId,
        bookingDate: today,
        startTime: "11:00",
        endTime: "13:00",
        numPlayers: 4,
        status: "confirmed",
        paymentStatus: "unpaid",
        amountLkr: "3000.00",
        notes: "2-hour booking for doubles",
      },
      {
        userId: customer1Id,
        courtId,
        bookingDate: tomorrow,
        startTime: "18:00",
        endTime: "19:00",
        numPlayers: 2,
        status: "confirmed",
        paymentStatus: "unpaid",
        amountLkr: "2500.00",
        notes: "Peak hours booking",
      },
    ]);
    console.log("✓ Sample bookings created");

    console.log("✅ Database seed completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`  - Court: Kandy 1st Court (${courtId})`);
    console.log(`  - Admin: admin@kandypickleball.lk (${adminId})`);
    console.log(`  - Customers: 2 test users created`);
    console.log(`  - Sample bookings: 3 bookings for testing`);
    console.log(
      "\n💡 Next: Set up Supabase auth, then run the app with 'npm run dev'"
    );
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
