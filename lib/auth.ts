import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Auth utilities
export async function signUpWithPhone(
  email: string,
  phone: string,
  fullName: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: Math.random().toString(36).slice(-12), // Generate random password
    options: {
      data: {
        phone_number: phone,
        full_name: fullName,
      },
    },
  });

  return { data, error };
}

export async function signInWithOTP(phone: string) {
  // Supabase OTP via phone
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
  });

  return { data, error };
}

export async function verifyOTP(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  return { data, error };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}
