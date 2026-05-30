"use client";

import { useState } from "react";
import { Search, UserPlus, Check } from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

const mockUsers = [
  { id: "1", username: "rahul_k", name: "Rahul Kumar", followers: "1.2K", color: "from-blue-400 to-blue-600" },
  { id: "2", username: "priya.m", name: "Priya Mehta", followers: "876", color: "from-pink-400 to-rose-600" },
  { id: "3", username: "aman_t", name: "Aman Tiwari", followers: "543", color: "from-purple-400 to-indigo-600" },
  { id: "4", username: "sejal_r", name: "Sejal Rastogi", followers: "2.1K", color: "from-amber-400 to-orange-500" },
  { id: "5", username: "nikhil_v", name: "Nikhil Verma", followers: "312", color: "from-emerald-400 to-teal-600" },
  { id: "6", username: "ananya_s", name: "Ananya Singh", followers: "987", color: "from-rose-400 to-pink-600" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  const filtered = mockUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.name.toLowerCase().includes(query.toLowerCase())
  );

  const toggleFollow = (id: string) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-2xl mx-auto">
      <TopBar showSearch={false} />

      <main className="pb-20 px-4 pt-4">
        <h1 className="text-2xl font-bold text-[#111827] mb-4">Search</h1>

        {/* Search input */}
        <div className="relative mb-6">
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
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#6B7280]">
              <Search size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No users found</p>
              <p className="text-sm mt-1">Try a different name or username</p>
            </div>
          ) : (
            filtered.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm fade-in hover:shadow-md transition-shadow"
              >
                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}
                >
                  {user.name[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#111827] text-sm truncate">{user.name}</p>
                  <p className="text-xs text-[#6B7280] truncate">@{user.username} · {user.followers} followers</p>
                </div>

                {/* Follow button */}
                <button
                  id={`follow-${user.id}`}
                  onClick={() => toggleFollow(user.id)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex-shrink-0 ${
                    followed.has(user.id)
                      ? "bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]"
                      : "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm shadow-blue-200"
                  }`}
                >
                  {followed.has(user.id) ? (
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
