import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as api from "../lib/api";
import { supabase } from "../lib/supabase";

const PROFILE_STORAGE_KEY = "kandy1stcourt.profile.v1";

// What we know about the signed-in user on this device. The backend has no
// "get my profile" endpoint - /api/auth/login only returns { id, email }.
// fullName/phone are only known right after a /api/auth/signup on this same
// device, so we cache them locally and re-merge them on subsequent logins
// for the same user id. See mobile/README.md for the full explanation.
export interface Profile {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
}

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  userId: string | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fields: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadCachedProfile(): Promise<Profile | null> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

async function saveCachedProfile(profile: Profile | null): Promise<void> {
  try {
    if (profile) {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } else {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  } catch {
    // Best-effort cache only - losing it just means we fall back to
    // showing email-only profile info next time.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const [{ data }, cachedProfile] = await Promise.all([
        supabase.auth.getSession(),
        loadCachedProfile(),
      ]);
      if (!mounted) return;
      setSession(data.session ?? null);
      setProfile(cachedProfile);
      setInitializing(false);
    })();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);

    const { error } = await supabase.auth.setSession({
      access_token: result.session.access_token,
      refresh_token: result.session.refresh_token,
    });
    if (error) throw new Error(error.message);

    setProfile((prev) => {
      const next: Profile =
        prev && prev.id === result.user.id
          ? { ...prev, email: result.user.email }
          : { id: result.user.id, email: result.user.email };
      saveCachedProfile(next);
      return next;
    });
  }, []);

  const signup = useCallback(
    async (fields: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
    }) => {
      const result = await api.signup({
        email: fields.email,
        phone: fields.phone,
        fullName: fields.fullName,
        password: fields.password,
      });

      // Signup does not return a session (the backend creates the user via
      // the admin API but doesn't sign them in) - cache the profile now so
      // the immediately-following login can pick fullName/phone back up.
      await saveCachedProfile({
        id: result.userId,
        email: result.user.email,
        fullName: result.user.fullName,
        phone: result.user.phoneNumber,
      });
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const userId = profile?.id ?? session?.user?.id ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({ session, profile, userId, initializing, login, signup, logout }),
    [session, profile, userId, initializing, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
