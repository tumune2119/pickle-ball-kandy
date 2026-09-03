// Thin typed wrapper around the Next.js backend's REST contract. This file
// intentionally does not change any server behavior - see the API routes
// under app/api/ in the web app for the source of truth.
import { API_BASE_URL } from "./env";

export interface Court {
  id: string;
  name: string;
  location: string | null;
  googleMapsUrl: string | null;
  openingTime: string;
  closingTime: string;
  slotDuration: number;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface SupabaseSessionLike {
  access_token: string;
  refresh_token: string;
  [key: string]: unknown;
}

export interface LoginResult {
  message: string;
  user: AuthUser;
  session: SupabaseSessionLike;
}

export interface SignupPayload {
  email: string;
  phone: string;
  fullName: string;
  password: string;
}

export interface SignupResult {
  message: string;
  user: {
    id: string;
    email: string;
    phoneNumber: string;
    fullName: string;
    role: string;
  };
  userId: string;
}

export interface AvailabilityResult {
  date: string;
  court: {
    id: string;
    name: string;
    openingTime: string;
    closingTime: string;
    slotDuration: number;
  };
  availableSlots: string[];
  bookedSlots: string[];
  totalSlots: string[];
}

export type PaymentMode = "pay_at_venue" | "payhere";

export interface Booking {
  id: string;
  userId: string;
  courtId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  numPlayers: number;
  status: string;
  paymentStatus: string;
  amountLkr: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  userId: string;
  courtId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  numPlayers: number;
  amountLkr: number;
  paymentMode: PaymentMode;
}

export interface PaymentInitiateResult {
  checkoutUrl: string;
  fields: Record<string, string>;
}

export class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      `Could not reach the server at ${API_BASE_URL}. On a physical device or ` +
        "Android emulator, EXPO_PUBLIC_API_BASE_URL must point to your dev " +
        "machine's LAN IP, not localhost."
    );
  }

  const text = await res.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // Non-JSON response (e.g. an HTML error page) - fall through to the
    // status-based error below.
  }

  if (!res.ok) {
    const message =
      (data as { error?: string } | null)?.error ??
      `Request failed with status ${res.status}`;
    throw new ApiError(message);
  }

  return data as T;
}

export function login(email: string, password: string): Promise<LoginResult> {
  return request<LoginResult>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signup(payload: SignupPayload): Promise<SignupResult> {
  return request<SignupResult>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCourts(): Promise<{ courts: Court[] }> {
  return request<{ courts: Court[] }>("/api/courts");
}

export function getAvailability(
  date: string,
  courtId: string
): Promise<AvailabilityResult> {
  const params = new URLSearchParams({ date, courtId });
  return request<AvailabilityResult>(`/api/bookings/availability?${params}`);
}

export function createBooking(
  payload: CreateBookingPayload
): Promise<{ message: string; booking: Booking }> {
  return request<{ message: string; booking: Booking }>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getBookings(userId: string): Promise<{ bookings: Booking[] }> {
  return request<{ bookings: Booking[] }>("/api/bookings", {
    headers: { "X-User-ID": userId },
  });
}

export function cancelBooking(
  id: string
): Promise<{ message: string; booking: Booking }> {
  return request<{ message: string; booking: Booking }>(
    `/api/bookings/${id}`,
    { method: "DELETE" }
  );
}

export function initiatePayment(
  bookingId: string
): Promise<PaymentInitiateResult> {
  return request<PaymentInitiateResult>("/api/payments/initiate", {
    method: "POST",
    body: JSON.stringify({ bookingId }),
  });
}
