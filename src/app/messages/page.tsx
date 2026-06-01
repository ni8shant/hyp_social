"use client";

import { Search, Share2, Check, Loader2 } from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

const avatarColors = [
  "from-[#7C3AED] to-[#2563EB]",
  "from-blue-400 to-blue-600",
  "from-pink-400 to-rose-600",
  "from-purple-400 to-indigo-600",
  "from-amber-400 to-orange-500",
];

export default function MessagesPage() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        
        // Fetch all messages involving the current user
        const { data, error } = await supabase
          .from("messages")
          .select(`
            id,
            sender_id,
            receiver_id,
            content,
            is_read,
            created_at,
            sender:profiles!messages_sender_id_fkey (id, username, full_name),
            receiver:profiles!messages_receiver_id_fkey (id, username, full_name)
          `)
          .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Group by user
        const userMap = new Map<string, any>();
        
        for (const msg of (data || [])) {
          const otherUser = msg.sender_id === profile.id ? msg.receiver : msg.sender;
          if (!otherUser) continue;

          if (!userMap.has(otherUser.id)) {
            userMap.set(otherUser.id, {
              id: otherUser.id,
              username: otherUser.username,
              name: otherUser.full_name || otherUser.username,
              lastMessage: msg.content || "Media attached",
              time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              unread: !msg.is_read && msg.receiver_id === profile.id ? 1 : 0,
              online: true,
            });
          } else {
            // Accumulate unread
            if (!msg.is_read && msg.receiver_id === profile.id) {
              const existing = userMap.get(otherUser.id);
              existing.unread += 1;
            }
          }
        }

        // Convert Map to Array
        let list = Array.from(userMap.values());

        setConversations(list);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [profile]);

  const handleCopyInvite = () => {
    const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/signup` : "https://hyp.social/signup";
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-2xl mx-auto">
      <TopBar showSearch={false} />

      <main className="pb-20 px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#111827]">Messages</h1>
          <Link
            href="/search"
            className="text-sm font-semibold text-[#2563EB] hover:underline"
          >
            New
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <label htmlFor="message-search" className="sr-only">Search messages</label>
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            id="message-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-2xl text-sm placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
          />
        </div>

        {/* Invite Friends callout since there are no users yet */}
        <div className="mb-5 p-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#1F2937]">Invite real friends! 🔗</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Share your signup link to get real people registered on your platform.</p>
          </div>
          <button
            onClick={handleCopyInvite}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-100 transition-all cursor-pointer"
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            <span>{copied ? "Copied!" : "Copy Invite Link"}</span>
          </button>
        </div>

        {/* Conversations */}
        <div className="flex flex-col gap-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
            </div>
          ) : (
            filtered.map((convo, idx) => (
              <Link
                key={convo.id}
                href={`/messages/${convo.id}`}
                className="flex items-center gap-3 bg-white rounded-2xl p-3.5 border border-[#E5E7EB] hover:shadow-md transition-all duration-200 group"
              >
                {/* Avatar with online indicator */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                      avatarColors[idx % avatarColors.length]
                    } flex items-center justify-center text-white font-bold`}
                  >
                    {convo.name[0].toUpperCase()}
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
            ))
          )}
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
