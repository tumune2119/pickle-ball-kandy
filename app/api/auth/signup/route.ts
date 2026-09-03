import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// POST /api/auth/signup - Sign up with phone OTP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, fullName, password } = body;

    if (!email || !phone || !fullName || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Create user in Supabase (service role key required for admin-created users)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create user in database
    const newUser = await db
      .insert(users)
      .values({
        id: data.user?.id || "",
        email,
        phoneNumber: phone,
        fullName,
        role: "customer",
      })
      .returning();

    return NextResponse.json(
      {
        message: "Signup successful",
        user: newUser[0],
        userId: data.user?.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to sign up" },
      { status: 500 }
    );
  }
}
