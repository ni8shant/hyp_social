"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, Check, Loader2 } from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

const avatarColors = [
  "from-blue-400 to-blue-600",
  "from-pink-400 to-rose-600",
  "from-purple-400 to-indigo-600",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-600",
];

export default function SearchPage() {
  const { profile } = useAuth();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        
        // Fetch profiles excluding current user
        let queryBuilder = supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .neq("id", profile.id);

        if (query.trim()) {
          queryBuilder = queryBuilder.or(`username.ilike.%${query}%,full_name.ilike.%${query}%`);
        }

        const { data: profilesData, error: profilesError } = await queryBuilder.limit(20);
        if (profilesError) throw profilesError;

        // Fetch user's following list
        const { data: followsData, error: followsError } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", profile.id);
        if (followsError) throw followsError;

        const followedSet = new Set(followsData?.map((f) => f.following_id) || []);
        
        setUsers(profilesData || []);
        setFollowedIds(followedSet);
      } catch (err) {
        console.error("Failed to search users:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, profile]);

  const toggleFollow = async (targetUserId: string) => {
    if (!profile) return;
    const supabase = createClient();

    try {
      if (followedIds.has(targetUserId)) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", profile.id)
          .eq("following_id", targetUserId);

        if (error) throw error;
        
        setFollowedIds((prev) => {
          const next = new Set(prev);
          next.delete(targetUserId);
          return next;
        });
      } else {
        // Follow
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: profile.id,
            following_id: targetUserId,
            status: "accepted",
          });

        if (error) throw error;

        setFollowedIds((prev) => {
          const next = new Set(prev);
          next.add(targetUserId);
          return next;
        });

        // Trigger follow notification
        await supabase.from("notifications").insert({
          user_id: targetUserId,
          actor_id: profile.id,
          type: "follow",
        });
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-2xl mx-auto">
      <TopBar showSearch={false} />

      <main className="pb-20 px-4 pt-4">
        <h1 className="text-2xl font-bold text-[#111827] mb-4">Search</h1>

        {/* Search input */}
        <div className="relative mb-6">
          <label htmlFor="search-input" className="sr-only">Search friends or name</label>
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search @your_friends or name..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-2xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all shadow-sm"
          />
        </div>

        {/* Results */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-[#6B7280]">
              <Search size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No users found</p>
              <p className="text-sm mt-1">Try a different name or username</p>
            </div>
          ) : (
            users.map((user, idx) => (
              <div
                key={user.id}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm fade-in hover:shadow-md transition-shadow"
              >
                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                    avatarColors[idx % avatarColors.length]
                  } flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}
                >
                  {user.full_name ? user.full_name[0].toUpperCase() : user.username[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#111827] text-sm truncate">{user.full_name || user.username}</p>
                  <p className="text-xs text-[#6B7280] truncate">@{user.username}</p>
                </div>

                {/* Follow button */}
                <button
                  id={`follow-${user.id}`}
                  onClick={() => toggleFollow(user.id)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex-shrink-0 cursor-pointer ${
                    followedIds.has(user.id)
                      ? "bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]"
                      : "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm shadow-blue-200"
                  }`}
                >
                  {followedIds.has(user.id) ? (
                    <><Check size={12} /> Following</>
                  ) : (
                    <><UserPlus size={12} /> Follow</>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
