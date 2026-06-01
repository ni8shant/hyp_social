"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  dob: string;
  about: string;
  avatarInitial: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<Pick<UserProfile, "fullName" | "dob" | "about">>) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  updateProfile: () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        buildProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        buildProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const buildProfile = (u: User) => {
    const meta = u.user_metadata || {};
    const username = meta.username || u.email?.split("@")[0] || "user";
    const fullName = meta.full_name || username;
    const dob = meta.dob || "";
    
    // Check localStorage for profile overrides (edit profile saves here)
    const localOverrides = getLocalProfileOverrides(u.id);

    const prof: UserProfile = {
      id: u.id,
      email: u.email || "",
      username: localOverrides.username || username,
      fullName: localOverrides.fullName || fullName,
      dob: localOverrides.dob || dob,
      about: localOverrides.about || meta.about || "Hey, I'm on hyp! ✨",
      avatarInitial: (localOverrides.fullName || fullName)[0]?.toUpperCase() || "U",
    };
    setProfile(prof);
  };

  const getLocalProfileOverrides = (userId: string): Partial<UserProfile> => {
    try {
      const stored = localStorage.getItem(`hyp_profile_${userId}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const updateProfile = (updates: Partial<Pick<UserProfile, "fullName" | "dob" | "about">>) => {
    if (!profile || !user) return;

    const updated: UserProfile = {
      ...profile,
      ...updates,
      avatarInitial: (updates.fullName || profile.fullName)[0]?.toUpperCase() || profile.avatarInitial,
    };
    setProfile(updated);

    // Persist to localStorage
    try {
      const existing = getLocalProfileOverrides(user.id);
      localStorage.setItem(`hyp_profile_${user.id}`, JSON.stringify({
        ...existing,
        ...updates,
      }));
    } catch {
      // localStorage might be unavailable
    }
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, updateProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
