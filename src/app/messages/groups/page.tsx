"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Users, Plus, Crown, Mic, MicOff, Volume2, VolumeX, PhoneOff, UserPlus, X, Share2, Sparkles, Check, Search } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

// User silhouette component that matches the wireframe shape exactly
const UserSilhouette = ({ className = "w-24 h-24" }: { className?: string }) => (
  <svg className={`${className}`} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

// CSS Waveform component for active talking animation
const SoundWave = ({ active = true }: { active?: boolean }) => {
  if (!active) return <div className="h-6 w-8 flex items-center justify-center text-slate-400 text-xs">Muted</div>;
  return (
    <div className="flex items-end gap-0.5 h-6 w-8 justify-center">
      <div className="w-1 bg-[#7C3AED] rounded-full animate-bounce [animation-duration:0.6s]" style={{ height: "60%" }} />
      <div className="w-1 bg-[#7C3AED] rounded-full animate-bounce [animation-duration:0.4s]" style={{ height: "100%" }} />
      <div className="w-1 bg-[#7C3AED] rounded-full animate-bounce [animation-duration:0.8s]" style={{ height: "40%" }} />
      <div className="w-1 bg-[#7C3AED] rounded-full animate-bounce [animation-duration:0.5s]" style={{ height: "80%" }} />
      <div className="w-1 bg-[#7C3AED] rounded-full animate-bounce [animation-duration:0.7s]" style={{ height: "50%" }} />
    </div>
  );
};

interface TalkieRoom {
  id: string;
  name: string;
  members: number;
  onlineCount: number;
  color: string;
  isAdmin: boolean;
  activeSpeaker: string;
}

const mockRooms: TalkieRoom[] = [
  {
    id: "public-lounge",
    name: "Public Lounge 🎙️",
    members: 1,
    onlineCount: 1,
    color: "from-[#7C3AED] to-[#2563EB]",
    isAdmin: false,
    activeSpeaker: "You",
  }
];

const onlineFriends: any[] = [];

export default function GroupsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [rooms, setRooms] = useState<TalkieRoom[]>(mockRooms);
  
  // Voice call states
  const [activeCallRoom, setActiveCallRoom] = useState<TalkieRoom | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [speakerTimer, setSpeakerTimer] = useState("You");
  
  // Invite states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Simulate active speaker cycling in call
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCallRoom) {
      interval = setInterval(() => {
        const speakers = activeCallRoom.id.startsWith("direct-") 
          ? ["Hyp Assistant ✨", "You"]
          : ["You"];
        const randomSpeaker = speakers[Math.floor(Math.random() * speakers.length)];
        setSpeakerTimer(randomSpeaker);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeCallRoom]);

  const handleJoinRoom = (room: TalkieRoom) => {
    if (activeCallRoom?.id === room.id) {
      // Leave call if clicked again
      setActiveCallRoom(null);
      return;
    }
    setIsConnecting(true);
    setActiveCallRoom(room);
    setTimeout(() => {
      setIsConnecting(false);
    }, 1200);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    const newRoom: TalkieRoom = {
      id: String(rooms.length + 1),
      name: groupName,
      members: 1,
      onlineCount: 1,
      color: "from-emerald-400 to-teal-500",
      isAdmin: true,
      activeSpeaker: "You",
    };
    setRooms([...rooms, newRoom]);
    setGroupName("");
    setShowCreate(false);
  };

  const handleInviteFriends = () => {
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setShowInvite(false);
      setSelectedFriends([]);
    }, 2000);
  };

  const toggleSelectFriend = (name: string) => {
    if (selectedFriends.includes(name)) {
      setSelectedFriends(selectedFriends.filter((f) => f !== name));
    } else {
      setSelectedFriends([...selectedFriends, name]);
    }
  };

  const inviteList = [
    { name: "Hyp Assistant", username: "@hyp_assistant" },
  ].filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.username.toLowerCase().includes(searchQuery.toLowerCase()));

  // Call avatars builder
  const isDirect = activeCallRoom?.id.startsWith("direct-");
  const callAvatars = isDirect
    ? [
        { name: "You", dp: "U", color: "from-indigo-500 to-purple-600", active: speakerTimer === "You" },
        { name: "Hyp Assistant ✨", dp: "H", color: "from-[#7C3AED] to-[#2563EB]", active: speakerTimer === "Hyp Assistant ✨" }
      ]
    : [
        { name: "You", dp: "U", color: "from-indigo-500 to-purple-600", active: speakerTimer === "You" }
      ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-4xl mx-auto relative md:px-12">
      {/* Search Header exactly as in mockup */}
      <TopBar showSearch={true} />

      <main className="pb-24 pt-4 max-w-2xl mx-auto px-4">
        {/* Top title area (neat, with create room trigger) */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link href="/messages" className="text-[#374151] hover:text-[#7C3AED] transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-extrabold text-[#111827] tracking-tight">Talkie Rooms</h1>
            <span className="animate-pulse">🎙️</span>
          </div>
          <button
            id="create-room-btn"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7C3AED] text-white text-xs font-semibold rounded-full hover:bg-[#6D28D9] transition-all shadow-sm cursor-pointer"
          >
            <Plus size={14} /> New Room
          </button>
        </div>

        {/* Online capsule section - exact styling match with premium UI */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#4B5563] mb-2 pl-1">Online Assistant</h2>
          <div className="bg-[#E5E7EB] border border-[#CBD5E1]/70 rounded-[1.8rem] p-4 flex gap-4 items-center overflow-x-auto no-scrollbar shadow-inner">
            {onlineFriends.map((m) => (
              <button 
                key={m.name} 
                onClick={() => {
                  // Direct call simulation
                  const directRoom: TalkieRoom = {
                    id: `direct-${m.name}`,
                    name: `Mic Test with ${m.name} 📞`,
                    members: 2,
                    onlineCount: 2,
                    color: m.color,
                    isAdmin: false,
                    activeSpeaker: m.name
                  };
                  handleJoinRoom(directRoom);
                }}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer focus:outline-none"
              >
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-extrabold text-sm shadow-md group-hover:scale-105 transition-all duration-200`}
                  >
                    {m.dp}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#22C55E] border-2 border-[#E5E7EB] shadow-sm" />
                </div>
              </button>
            ))}
            
            {/* Minimal Add Friend shortcut in the online bar */}
            <button
              onClick={() => setShowInvite(true)}
              className="w-12 h-12 rounded-full border-2 border-dashed border-[#9CA3AF] flex items-center justify-center text-[#4B5563] hover:bg-slate-300/40 hover:text-[#7C3AED] hover:border-[#7C3AED] transition-all flex-shrink-0 cursor-pointer"
              aria-label="Invite Friends"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Talkie Cards grid - Matches exact layout of wireframe */}
        <div className="flex flex-col gap-5 mb-8">
          {rooms.map((room) => {
            const isCurrent = activeCallRoom?.id === room.id;
            return (
              <div
                key={room.id}
                onClick={() => handleJoinRoom(room)}
                className={`relative group flex flex-col items-center justify-center bg-[#E5E7EB] hover:bg-[#DCDFE4] border border-[#CBD5E1] rounded-[2.2rem] p-6 min-h-[220px] transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-md ${
                  isCurrent ? "ring-4 ring-[#7C3AED]/40 bg-[#D5D9E0]" : ""
                }`}
              >
                {/* Active speaker wave effect and metadata inside card (premium touch) */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
                  <div className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#4B5563] shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                    {room.name}
                  </div>
                  <div className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#6B7280] shadow-sm">
                    {room.onlineCount} / {room.members} Online
                  </div>
                </div>

                {/* Central Silhouette Avatar - matches the wireframe silhouette profile shape */}
                <div className="relative mt-2">
                  {/* Glowing ring animation if active call is on */}
                  {isCurrent && !isConnecting && (
                    <div className="absolute -inset-4 bg-gradient-to-tr from-[#7C3AED] to-pink-500 rounded-full blur opacity-25 animate-pulse" />
                  )}
                  
                  <div className="relative bg-slate-300/40 rounded-full p-4 group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
                    <UserSilhouette className={`w-20 h-20 transition-all ${
                      isCurrent && !isConnecting ? "text-[#7C3AED]" : "text-[#94A3B8]"
                    }`} />
                  </div>

                  {/* Microphone overlay in the bottom-right corner of the avatar - matches wireframe perfectly */}
                  <div className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all duration-300 ${
                    isCurrent && !isConnecting
                      ? isMuted
                        ? "bg-[#EF4444] text-white"
                        : "bg-[#22C55E] text-white animate-pulse"
                      : "bg-[#4B5563] text-white group-hover:scale-110"
                  }`}>
                    {isCurrent && isMuted ? <MicOff size={14} /> : <Mic size={14} className="stroke-[2.5]" />}
                  </div>
                </div>

                {/* CTA text overlay when hovering */}
                <div className="mt-4 text-xs font-bold text-[#4B5563] tracking-wide uppercase opacity-75 group-hover:opacity-100 transition-opacity">
                  {isCurrent ? (isConnecting ? "Connecting..." : "Tap to Disconnect") : "Tap to Start Talkie"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Invite CTA centered at bottom - matches layout exactly */}
        <div className="text-center mt-6 mb-4">
          <button
            onClick={() => setShowInvite(true)}
            className="inline-flex flex-col items-center gap-1 group cursor-pointer focus:outline-none"
          >
            <span className="text-sm font-semibold text-[#4B5563] hover:text-[#7C3AED] transition-colors relative">
              Invite your friends for group chat
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7C3AED] origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </span>
            <span className="text-xs text-[#9CA3AF]">Create a custom Talkie link and start chatting</span>
          </button>
        </div>
      </main>

      {/* Floating Active Voice Call Panel (Bottom Sheet overlay) - Premium Interactive Touch */}
      {activeCallRoom && (
        <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-32 md:w-96 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-5 shadow-2xl z-50 fade-in transition-all">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-100 text-[#7C3AED] flex items-center justify-center animate-pulse">
                <Mic size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827] truncate max-w-[180px]">
                  {activeCallRoom.name}
                </h3>
                <p className="text-[10px] text-[#22C55E] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping" />
                  {isConnecting ? "Connecting..." : "Voice Connected"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveCallRoom(null)}
              className="text-[#9CA3AF] hover:text-[#4B5563] p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              aria-label="Minimize Call"
            >
              <X size={16} />
            </button>
          </div>

          {isConnecting ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
              <p className="text-xs font-semibold text-[#6B7280]">Connecting to channel...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Animated waveform showing speaking activity */}
              <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-ping" />
                  <span className="text-xs font-bold text-[#374151]">
                    {speakerTimer === "You" ? "You are speaking..." : `${speakerTimer} is speaking...`}
                  </span>
                </div>
                <SoundWave active={speakerTimer === "You" ? !isMuted : !isDeafened} />
              </div>

              {/* Grid of active avatars in room */}
              <div className="grid grid-cols-4 gap-2 py-1">
                {callAvatars.map((member) => (
                  <div key={member.name} className="flex flex-col items-center gap-1 relative">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-extrabold text-xs shadow-sm ring-2 ring-offset-1 ${
                      member.active && (!isMuted || member.name !== "You") ? "ring-[#22C55E]" : "ring-transparent"
                    }`}>
                      {member.dp}
                    </div>
                    <span className="text-[10px] text-[#4B5563] font-bold truncate max-w-[60px]">{member.name.split(" ")[0]}</span>
                    {member.name === "You" && isMuted && (
                      <div className="absolute top-0 right-1.5 bg-[#EF4444] text-white p-0.5 rounded-full border border-white">
                        <MicOff size={8} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Call Controls panel */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                {/* Mute Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    isMuted
                      ? "bg-red-50 border-red-200 text-[#EF4444] hover:bg-red-100"
                      : "bg-[#F3F4F6] border-slate-200 text-[#374151] hover:bg-slate-200"
                  }`}
                  aria-label={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                >
                  {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
                  <span>{isMuted ? "Muted" : "Mute"}</span>
                </button>

                {/* Deafen Button */}
                <button
                  onClick={() => setIsDeafened(!isDeafened)}
                  className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    isDeafened
                      ? "bg-red-50 border-red-200 text-[#EF4444] hover:bg-red-100"
                      : "bg-[#F3F4F6] border-slate-200 text-[#374151] hover:bg-slate-200"
                  }`}
                  aria-label={isDeafened ? "Undeafen Audio" : "Deafen Audio"}
                >
                  {isDeafened ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span>{isDeafened ? "Deafened" : "Deafen"}</span>
                </button>

                {/* Disconnect Red Button */}
                <button
                  onClick={() => setActiveCallRoom(null)}
                  className="bg-[#EF4444] text-white p-2.5 rounded-xl hover:bg-[#DC2626] transition-colors cursor-pointer flex-shrink-0"
                  aria-label="Disconnect Voice Room"
                >
                  <PhoneOff size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Room sliding modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/45 z-50 flex items-end justify-center p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateRoom}
            className="bg-white w-full max-w-md rounded-3xl p-6 slide-up shadow-2xl border border-slate-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-[#111827] tracking-tight">Create Talkie Room</h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-[#9CA3AF] hover:text-[#4B5563] p-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <input
              id="new-group-name"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Room name (e.g. Gaming Lounge 🎮)"
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all mb-4"
              required
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 py-3 border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#6B7280] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="create-group-confirm"
                className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl text-sm font-extrabold text-white transition-all cursor-pointer shadow-md shadow-violet-200"
              >
                Create Room
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invite Friends Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/45 z-50 flex items-end justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 slide-up shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#111827] tracking-tight">Invite to Talkie</h2>
                <p className="text-xs text-[#6B7280]">Select friends to join your group voice chat</p>
              </div>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="text-[#9CA3AF] hover:text-[#4B5563] p-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-3 slide-up">
                <div className="w-12 h-12 bg-emerald-100 text-[#22C55E] rounded-full flex items-center justify-center shadow-sm">
                  <Check size={24} className="stroke-[3]" />
                </div>
                <h3 className="text-sm font-bold text-[#111827]">Invites Sent Successfully!</h3>
                <p className="text-xs text-[#6B7280]">Your friends have been notified to join.</p>
              </div>
            ) : (
              <>
                {/* Search friends inside invite modal */}
                <div className="relative mb-4">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search username or name..."
                    className="w-full pl-9 pr-4 py-2 bg-[#F3F4F6] border border-transparent rounded-xl text-sm placeholder-[#9CA3AF] outline-none focus:bg-white focus:border-[#7C3AED]/20 transition-all"
                  />
                </div>

                {/* Friend list */}
                <div className="max-h-60 overflow-y-auto no-scrollbar space-y-2 mb-5">
                  {inviteList.length > 0 ? (
                    inviteList.map((friend) => {
                      const isSelected = selectedFriends.includes(friend.name);
                      return (
                        <button
                          key={friend.name}
                          onClick={() => toggleSelectFriend(friend.name)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-violet-50/50 border-[#7C3AED]/30"
                              : "bg-white border-slate-100 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center">
                              {friend.name[0]}
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold text-[#374151]">{friend.name}</p>
                              <p className="text-[10px] text-[#9CA3AF]">{friend.username}</p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected ? "bg-[#7C3AED] border-[#7C3AED] text-white" : "border-[#CBD5E1]"
                          }`}>
                            {isSelected && <Check size={12} className="stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-xs text-[#9CA3AF]">No friends found</div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/messages/groups` : "https://hyp.social/messages/groups";
                      navigator.clipboard.writeText(inviteUrl);
                      setInviteSuccess(true);
                      setTimeout(() => setInviteSuccess(false), 2000);
                    }}
                    className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-[#374151] hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 size={14} />
                    <span>Copy Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleInviteFriends}
                    disabled={selectedFriends.length === 0}
                    className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-extrabold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-violet-200"
                  >
                    <UserPlus size={14} />
                    <span>Send ({selectedFriends.length})</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Bottom Nav / Right Nav */}
      <BottomNav />
    </div>
  );
}
