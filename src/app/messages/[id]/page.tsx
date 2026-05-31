"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Paperclip, Smile, Mic, Phone, Video } from "lucide-react";
import Link from "next/link";

const mockMessages = [
  { id: "1", from: "them", text: "hey! how are you?", time: "10:30 AM" },
  { id: "2", from: "me", text: "hil...doing good! you?", time: "10:31 AM" },
  { id: "3", from: "them", text: "great! did you see the game last night?", time: "10:32 AM" },
  { id: "4", from: "me", text: "yesss! it was insane 🔥", time: "10:33 AM" },
  { id: "5", from: "them", text: "😄😄 right?!", time: "10:33 AM" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        from: "me",
        text: input.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-2xl mx-auto flex flex-col">
      {/* Chat header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-4 h-14 flex items-center gap-3">
        <Link href="/messages" className="text-[#374151] hover:text-[#111827] transition-colors">
          <ArrowLeft size={22} />
        </Link>
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
            N
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#111827] text-sm">ni8shant</p>
          <p className="text-xs text-[#22C55E]">Online</p>
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
