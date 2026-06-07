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
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        buildProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Periodically update last_seen activity timestamp
  useEffect(() => {
    if (!user || !profile) return;
    const supabase = createClient();

    const updateActivity = async () => {
      try {
        const { data: prof } = await supabase
          .from("profiles")
          .select("show_last_seen")
          .eq("id", user.id)
          .single();

        if (prof?.show_last_seen !== false) {
          await supabase
            .from("profiles")
            .update({ last_seen: new Date().toISOString() })
            .eq("id", user.id);
        }
      } catch (err) {
        console.warn("Could not update activity timestamp", err);
      }
    };

    updateActivity();
    const interval = setInterval(updateActivity, 30000);
    return () => clearInterval(interval);
  }, [user, profile]);

  const buildProfile = async (u: User) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();

      const meta = u.user_metadata || {};
      const username = data?.username || meta.username || u.email?.split("@")[0] || "user";
      const fullName = data?.full_name || meta.full_name || username;
      const dob = data?.dob || meta.dob || "";
      const bio = data?.bio || meta.bio || "Hey, I'm on hyp! ✨";

      const prof: UserProfile = {
        id: u.id,
        email: u.email || "",
        username,
        fullName,
        dob,
        about: bio,
        avatarInitial: fullName[0]?.toUpperCase() || "U",
      };
      setProfile(prof);
    } catch (err) {
      console.error("Failed to build profile", err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Pick<UserProfile, "fullName" | "dob" | "about">>) => {
    if (!profile || !user) return;

    try {
      const supabase = createClient();
      const dbUpdates: any = {};
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.dob !== undefined) dbUpdates.dob = updates.dob || null;
      if (updates.about !== undefined) dbUpdates.bio = updates.about;

      const { error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq("id", user.id);

      if (!error) {
        const updated: UserProfile = {
          ...profile,
          ...updates,
          avatarInitial: (updates.fullName || profile.fullName)[0]?.toUpperCase() || profile.avatarInitial,
        };
        setProfile(updated);
      } else {
        console.error("Error updating profile in DB:", error);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
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

