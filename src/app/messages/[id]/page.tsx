"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Paperclip, Smile, Mic, Phone, Video } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { timeAgo } from "@/lib/data";

const assistantMessages = [
  { id: "1", from: "them", text: "Hey! Welcome to Hyp! 🚀 I'm your assistant.", time: "Just now" },
  { id: "2", from: "them", text: "Invite your friends by sharing your signup link! Let's build your active space together. ✨", time: "Just now" },
];

export default function ChatPage() {
  const { profile } = useAuth();
  const params = useParams();
  const id = params?.id as string;
  const isAssistant = id === "hyp-assistant" || !id;

  const [messages, setMessages] = useState<any[]>(isAssistant ? assistantMessages : []);
  const [input, setInput] = useState("");
  const [contactName, setContactName] = useState(isAssistant ? "Hyp Assistant" : "Loading...");
  const [contactInitial, setContactInitial] = useState(isAssistant ? "H" : "U");
  const [lastSeenText, setLastSeenText] = useState(isAssistant ? "Online" : "");
  const [isOnline, setIsOnline] = useState(isAssistant ? true : false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch contact user details
  useEffect(() => {
    if (isAssistant || !id) return;
    const fetchContact = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("username, full_name, last_seen, show_last_seen")
        .eq("id", id)
        .single();
      if (data) {
        const name = data.full_name || data.username;
        setContactName(name);
        setContactInitial(name[0].toUpperCase());

        if (data.show_last_seen === false) {
          setLastSeenText("");
          setIsOnline(false);
        } else if (data.last_seen) {
          const lastSeenDate = new Date(data.last_seen);
          const diffMs = Date.now() - lastSeenDate.getTime();
          if (diffMs < 2 * 60 * 1000) {
            setLastSeenText("Online");
            setIsOnline(true);
          } else {
            const formatted = timeAgo(data.last_seen);
            setLastSeenText(`Last seen ${formatted}`);
            setIsOnline(false);
          }
        } else {
          setLastSeenText("Offline");
          setIsOnline(false);
        }
      }
    };
    fetchContact();

    // Set up a refresh interval to keep last seen time accurate while chatting
    const interval = setInterval(fetchContact, 15000);
    return () => clearInterval(interval);
  }, [id, isAssistant]);

  // Load initial messages from DB
  const fetchMessages = async () => {
    if (!profile || isAssistant || !id) return;
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${profile.id})`)
        .order("created_at", { ascending: true });

      setMessages(
        data?.map((m) => ({
          id: m.id,
          from: m.sender_id === profile.id ? "me" : "them",
          text: m.content || "",
          time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })) || []
      );
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [id, profile, isAssistant]);

  // Realtime subscription
  useEffect(() => {
    if (!profile || isAssistant || !id) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`room_${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new;
          if (
            (newMsg.sender_id === profile.id && newMsg.receiver_id === id) ||
            (newMsg.sender_id === id && newMsg.receiver_id === profile.id)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [
                ...prev,
                {
                  id: newMsg.id,
                  from: newMsg.sender_id === profile.id ? "me" : "them",
                  text: newMsg.content || "",
                  time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, profile, isAssistant]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !profile) return;

    const userMsgText = input.trim();
    setInput("");

    if (isAssistant) {
      // Offline Assistant replies locally
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          from: "me",
          text: userMsgText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `reply_${Date.now()}`,
            from: "them",
            text: "I'm always here to help! 🚀 Invite your real friends so you can chat with them live.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 1000);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: profile.id,
          receiver_id: id,
          content: userMsgText,
        })
        .select()
        .single();

      if (error) throw error;

      // Update state locally for immediately smooth UI
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [
          ...prev,
          {
            id: data.id,
            from: "me",
            text: userMsgText,
            time: new Date(data.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ];
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const contactColor = isAssistant ? "from-[#7C3AED] to-[#2563EB]" : "from-blue-400 to-blue-600";

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-2xl mx-auto flex flex-col">
      {/* Chat header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-4 h-14 flex items-center gap-3">
        <Link href="/messages" className="text-[#374151] hover:text-[#111827] transition-colors">
          <ArrowLeft size={22} />
        </Link>
        <div className="relative">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${contactColor} flex items-center justify-center text-white font-bold text-sm`}>
            {contactInitial}
          </div>
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#111827] text-sm truncate">{contactName}</p>
          {lastSeenText && (
            <p className={`text-xs ${isOnline ? "text-[#22C55E]" : "text-[#6B7280]"}`}>{lastSeenText}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] text-[#374151] transition-colors" aria-label="Voice call">
            <Phone size={18} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] text-[#374151] transition-colors" aria-label="Video call">
            <Video size={18} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 pb-24">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.from === "me"
                  ? "bg-[#2563EB] text-white rounded-br-sm"
                  : "bg-white border border-[#E5E7EB] text-[#111827] rounded-bl-sm"
              }`}
            >
              <p>{msg.text}</p>
              <p
                className={`text-[10px] mt-1 ${
                  msg.from === "me" ? "text-blue-200 text-right" : "text-[#9CA3AF]"
                }`}
              >
                {msg.time}
                {msg.from === "me" && " ✓✓"}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-[#E5E7EB] px-4 py-3">
        <div className="flex items-center gap-2">
          <button className="text-[#6B7280] hover:text-[#2563EB] transition-colors" aria-label="Attach file">
            <Paperclip size={20} />
          </button>
          <div className="flex-1 flex items-center bg-[#F3F4F6] rounded-full px-4 py-2.5 gap-2">
            <label htmlFor="chat-input" className="sr-only">Type a message</label>
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm text-[#111827] placeholder-[#9CA3AF] outline-none"
            />
            <button className="text-[#6B7280] hover:text-[#F59E0B] transition-colors" aria-label="Emoji">
              <Smile size={18} />
            </button>
          </div>
          <button
            onClick={sendMessage}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              input.trim()
                ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-md shadow-blue-200"
                : "bg-[#F3F4F6] text-[#9CA3AF]"
            }`}
            aria-label={input.trim() ? "Send message" : "Voice message"}
          >
            {input.trim() ? <Send size={18} /> : <Mic size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
