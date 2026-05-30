"use client";

import { useState } from "react";
import { ArrowLeft, Users, Plus, Crown, Mic } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

const mockGroups = [
  {
    id: "1",
    name: "College Squad 🎓",
    members: 8,
    lastActivity: "2m ago",
    online: 3,
    color: "from-purple-400 to-indigo-600",
    isAdmin: true,
  },
  {
    id: "2",
    name: "Mumbai Friends",
    members: 5,
    lastActivity: "1h ago",
    online: 1,
    color: "from-blue-400 to-cyan-500",
    isAdmin: false,
  },
  {
    id: "3",
    name: "Family ❤️",
    members: 12,
    lastActivity: "30m ago",
    online: 4,
    color: "from-pink-400 to-rose-500",
    isAdmin: false,
  },
];

const onlineMembers = [
  { name: "Rahul", color: "from-blue-400 to-blue-600" },
  { name: "Priya", color: "from-pink-400 to-rose-600" },
  { name: "Aman", color: "from-purple-400 to-indigo-600" },
  { name: "Sejal", color: "from-amber-400 to-orange-500" },
];

export default function GroupsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState("");

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-2xl mx-auto">
      <TopBar showSearch={false} />

      <main className="pb-20 px-4 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link href="/messages" className="text-[#374151]">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-[#111827]">Talkie</h1>
            <span className="text-lg">🎙️</span>
          </div>
          <button
            id="create-group-btn"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-full hover:bg-[#1D4ED8] transition-colors"
          >
            <Plus size={14} /> New Group
          </button>
        </div>

        {/* Online members strip */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 mb-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
            Online Now
          </p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {onlineMembers.map((m) => (
              <div key={m.name} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {m.name[0]}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-white" />
                </div>
                <span className="text-[10px] text-[#6B7280] font-medium">{m.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Groups list */}
        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
          Your Groups
        </p>
        <div className="flex flex-col gap-2 mb-6">
          {mockGroups.map((group) => (
            <Link
              key={group.id}
              href={`/messages/groups/${group.id}`}
              className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-[#E5E7EB] hover:shadow-md transition-all duration-200"
            >
              {/* Group avatar */}
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${group.color} flex items-center justify-center text-white flex-shrink-0`}
              >
                <Users size={20} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-[#111827] text-sm truncate">{group.name}</p>
                  {group.isAdmin && <Crown size={12} className="text-[#F59E0B] flex-shrink-0" />}
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {group.members} members · {group.online} online · {group.lastActivity}
                </p>
              </div>

              <Mic size={18} className="text-[#9CA3AF] flex-shrink-0" />
            </Link>
          ))}
        </div>

        {/* Invite CTA */}
        <div className="text-center py-4 px-6 bg-gradient-to-br from-[#EFF6FF] to-[#EDE9FE] rounded-2xl border border-[#BFDBFE]">
          <p className="text-sm font-semibold text-[#374151]">Invite your friends for group chat</p>
          <p className="text-xs text-[#6B7280] mt-1">
            Create a Talkie group and stay connected
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 px-5 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-full hover:bg-[#1D4ED8] transition-colors shadow-sm shadow-blue-200"
          >
            Create Group
          </button>
        </div>
      </main>

      {/* Create Group modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-2xl rounded-t-3xl p-6 slide-up">
            <h2 className="text-lg font-bold text-[#111827] mb-4">Create Talkie Group</h2>
            <input
              id="new-group-name"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name (e.g. College Squad 🎓)"
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all mb-3"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-3 border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#6B7280]"
              >
                Cancel
              </button>
              <button
                id="create-group-confirm"
                className="flex-1 py-3 bg-[#2563EB] rounded-xl text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
