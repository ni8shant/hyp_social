"use client";

import { Search, Circle } from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

const mockConversations = [
  {
    id: "1",
    username: "ni8shant",
    name: "Nishant",
    lastMessage: "Me: hil...",
    time: "2m",
    unread: 2,
    online: true,
    color: "from-blue-400 to-blue-600",
  },
  {
    id: "2",
    username: "rahul_k",
    name: "Rahul",
    lastMessage: "how are you",
    time: "15m",
    unread: 0,
    online: true,
    color: "from-purple-400 to-indigo-600",
  },
  {
    id: "3",
    username: "elf_dev",
    name: "Elf",
    lastMessage: "Me: hm",
    time: "1h",
    unread: 0,
    online: false,
    color: "from-emerald-400 to-teal-600",
  },
  {
    id: "4",
    username: "sejal_r",
    name: "sejal",
    lastMessage: "😄😄",
    time: "3h",
    unread: 0,
    online: false,
    color: "from-pink-400 to-rose-600",
  },
];

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-2xl mx-auto">
      <TopBar showSearch={false} />

      <main className="pb-20 px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#111827]">Messages</h1>
          <Link
            href="/messages/new"
            className="text-sm font-semibold text-[#2563EB] hover:underline"
          >
            New
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            id="message-search"
            type="text"
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-2xl text-sm placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
          />
        </div>

        {/* Conversations */}
        <div className="flex flex-col gap-1">
          {mockConversations.map((convo) => (
            <Link
              key={convo.id}
              href={`/messages/${convo.id}`}
              className="flex items-center gap-3 bg-white rounded-2xl p-3.5 border border-[#E5E7EB] hover:shadow-md transition-all duration-200 group"
            >
              {/* Avatar with online indicator */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${convo.color} flex items-center justify-center text-white font-bold`}
                >
                  {convo.name[0]}
                </div>
                {convo.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-semibold ${convo.unread > 0 ? "text-[#111827]" : "text-[#374151]"}`}>
                    {convo.name}
                  </p>
                  <span className="text-xs text-[#9CA3AF] flex-shrink-0">{convo.time}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className={`text-xs truncate ${convo.unread > 0 ? "text-[#111827] font-medium" : "text-[#6B7280]"}`}>
                    {convo.lastMessage}
                  </p>
                  {convo.unread > 0 && (
                    <span className="flex-shrink-0 ml-2 w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center">
                      {convo.unread}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Talkie group chat invite */}
        <div className="mt-6 p-4 bg-gradient-to-r from-[#2563EB] to-[#60A5FA] rounded-2xl text-white">
          <p className="font-bold text-base">Talkie Groups 🎙️</p>
          <p className="text-sm opacity-90 mt-0.5">Invite your friends for group chat</p>
          <Link
            href="/messages/groups"
            className="mt-3 inline-block bg-white text-[#2563EB] text-xs font-semibold px-4 py-1.5 rounded-full hover:shadow-md transition-all"
          >
            Create a Group →
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
