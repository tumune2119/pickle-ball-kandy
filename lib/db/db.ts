import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// True when `error` is a Postgres unique-constraint violation (code 23505) -
// e.g. two concurrent requests both passing the pre-check SELECT and racing
// to insert/update the same courtId+bookingDate+startTime. The unique index
// itself (see schema.ts) already prevents the actual double-booking; this
// just lets a catch block tell that specific failure apart from any other
// DB error, so callers can return the same friendly "slot already booked"
// response the pre-check path returns instead of a generic 500.
export function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
}
