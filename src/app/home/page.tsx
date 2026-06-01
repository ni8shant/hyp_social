"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import PostFeed from "@/components/PostFeed";
import BottomNav from "@/components/BottomNav";
import { Camera, X, MessageSquare, Plus, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getAllStories,
  createStory,
  getUniqueStoryAuthors,
  getStoriesByUser,
  timeAgo,
  type HypStory,
} from "@/lib/data";

const avatarColors = [
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-pink-400 to-rose-600",
  "bg-gradient-to-br from-purple-400 to-indigo-600",
  "bg-gradient-to-br from-amber-400 to-orange-500",
  "bg-gradient-to-br from-emerald-400 to-teal-600",
];

export default function HomePage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"story" | "post">("story");
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState("");
  const [showReplySuccess, setShowReplySuccess] = useState(false);
  const [stories, setStories] = useState<HypStory[]>([]);
  const [storyAuthors, setStoryAuthors] = useState<ReturnType<typeof getUniqueStoryAuthors>>([]);

  // Story creation states
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [storyImagePreview, setStoryImagePreview] = useState<string | null>(null);
  const [showStoryCamera, setShowStoryCamera] = useState(false);
  const [storyCameraStream, setStoryCameraStream] = useState<MediaStream | null>(null);
  const storyCameraRef = useRef<HTMLVideoElement>(null);
  const storyFileRef = useRef<HTMLInputElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !profile) {
      router.push("/login");
    }
  }, [authLoading, profile, router]);

  // Load stories data
  const refreshData = async () => {
    const activeStories = await getAllStories();
    const authors = await getUniqueStoryAuthors();
    setStories(activeStories);
    setStoryAuthors(authors);
  };

  useEffect(() => {
    refreshData();
    const handler = () => refreshData();
    window.addEventListener("hyp_data_change", handler);
    return () => window.removeEventListener("hyp_data_change", handler);
  }, []);

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const myStories = stories.filter((s) => s.authorId === profile.id);
  const hasMyStory = myStories.length > 0;

  // Other people's stories (exclude own)
  const otherAuthors = storyAuthors.filter((a) => a.authorId !== profile.id);

  const handleSelectStory = (id: string) => {
    setSelectedStoryId(id);
    setReplyInput("");
    setShowReplySuccess(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    setReplyInput("");
    setShowReplySuccess(true);
    setTimeout(() => setShowReplySuccess(false), 3000);
  };

  const currentStory = selectedStoryId ? stories.find((s) => s.id === selectedStoryId) : null;

  // Story Camera Functions
  const handleStartStoryCamera = async () => {
    setShowStoryCamera(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        setStoryCameraStream(stream);
        if (storyCameraRef.current) {
          storyCameraRef.current.srcObject = stream;
        }
      }
    } catch {
      // Camera not available, user can type text story instead
      setShowStoryCamera(false);
    }
  };

  const handleCaptureStoryPhoto = () => {
    if (storyCameraStream && storyCameraRef.current) {
      const video = storyCameraRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setStoryImagePreview(canvas.toDataURL("image/jpeg", 0.9));
      }
    }
    stopStoryCamera();
  };

  const stopStoryCamera = () => {
    if (storyCameraStream) {
      storyCameraStream.getTracks().forEach((t) => t.stop());
      setStoryCameraStream(null);
    }
    setShowStoryCamera(false);
  };

  const handleStoryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setStoryImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishStory = async () => {
    if (!storyText.trim() && !storyImagePreview) return;

    await createStory({
      authorId: profile.id,
      authorUsername: profile.username,
      authorInitial: profile.avatarInitial,
      text: storyText.trim() || undefined,
      imageUrl: storyImagePreview || undefined,
      mediaType: storyImagePreview ? "image" : undefined,
    });

    setStoryText("");
    setStoryImagePreview(null);
    setShowStoryCreator(false);
    await refreshData();
  };

  const handleMyStoryClick = () => {
    if (hasMyStory) {
      // Show latest own story
      handleSelectStory(myStories[0].id);
    } else {
      setShowStoryCreator(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-4xl mx-auto relative md:px-12">
      {/* Top navigation */}
      <TopBar />

      {/* Main Container */}
      <div className="pb-24 pt-4 max-w-3xl mx-auto">
        
        {/* Top Profile Cards block - Centered and rounded container matching sketch */}
        <div className="bg-[#E5E7EB] border border-[#CBD5E1] rounded-3xl p-5 mb-8 mx-4 flex justify-around items-center shadow-sm">
          {/* Your Story Circle */}
          <button
            onClick={handleMyStoryClick}
            className="flex flex-col items-center gap-2 group cursor-pointer"
            aria-label="View or add to your story"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform duration-200 ${
              hasMyStory
                ? "bg-gradient-to-br from-[#7C3AED] to-pink-500 border-2 border-white ring-2 ring-[#7C3AED]/40"
                : "bg-[#DDD6FE] border-2 border-solid border-[#A78BFA] text-[#6D28D9] flex items-center justify-center"
            }`}>
              {hasMyStory ? (
                <span className="text-lg font-extrabold">{profile.avatarInitial}</span>
              ) : (
                <Plus size={24} className="text-[#6D28D9]" />
              )}
            </div>
            <span className="text-xs font-bold text-[#374151]">@your_story</span>
          </button>

          {/* Your Posts Circle */}
          <button
            onClick={() => setActiveTab("post")}
            className="flex flex-col items-center gap-2 group cursor-pointer"
            aria-label="View your posts"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#818CF8] to-[#6366F1] flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform duration-200">
              {profile.avatarInitial}
            </div>
            <span className="text-xs font-bold text-[#374151]">@your_posts</span>
          </button>
        </div>

        {/* ──────────────────────────────────────────────────────── */}
        {/* 1. MOBILE INTERFACE (md:hidden) */}
        {/* ──────────────────────────────────────────────────────── */}
        <div className="md:hidden px-4">
          {/* Side-by-side Tab switcher */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("story")}
              className={`flex-1 py-3 px-6 rounded-2xl text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer text-center ${
                activeTab === "story"
                  ? "bg-[#7C3AED] text-white"
                  : "bg-[#E5E7EB] text-[#475569] hover:bg-[#D1D5DB]"
              }`}
            >
              Story
            </button>
            <button
              onClick={() => setActiveTab("post")}
              className={`flex-1 py-3 px-6 rounded-2xl text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer text-center ${
                activeTab === "post"
                  ? "bg-[#7C3AED] text-white"
                  : "bg-[#E5E7EB] text-[#475569] hover:bg-[#D1D5DB]"
              }`}
            >
              Post
            </button>
          </div>

          {/* Mobile Content Area */}
          <div className="min-w-0">
            {activeTab === "story" ? (
              <div className="slide-up">
                {otherAuthors.length === 0 && !hasMyStory ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-purple-50 text-[#7C3AED] flex items-center justify-center mx-auto mb-4">
                      <Camera size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-[#111827] mb-2">No stories yet</h3>
                    <p className="text-sm text-[#6B7280] mb-4">Be the first to share a story!</p>
                    <button
                      onClick={() => setShowStoryCreator(true)}
                      className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold rounded-2xl transition-all shadow-md shadow-purple-200 cursor-pointer"
                    >
                      Create Story
                    </button>
                  </div>
                ) : (
                  /* Grid of circles (3 in a row wrapping) matching sketch */
                  <div className="grid grid-cols-3 gap-y-8 gap-x-4 max-w-sm mx-auto">
                    {/* Add Story button */}
                    <button
                      onClick={() => setShowStoryCreator(true)}
                      className="flex flex-col items-center gap-2 group cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#A78BFA] bg-purple-50 flex items-center justify-center hover:bg-purple-100 transition-all">
                        <Plus size={20} className="text-[#7C3AED]" />
                      </div>
                      <span className="text-[11px] text-[#475569] font-semibold">Add Story</span>
                    </button>

                    {/* Other people's story avatars */}
                    {otherAuthors.map((author, index) => {
                      const authorStories = stories.filter((s) => s.authorId === author.authorId);
                      const latestStory = authorStories[0];
                      return (
                        <button
                          key={author.authorId}
                          onClick={() => latestStory && handleSelectStory(latestStory.id)}
                          className="flex flex-col items-center gap-2 group cursor-pointer"
                          aria-label={`View ${author.authorUsername}'s story`}
                        >
                          <div className="p-[2px] rounded-full story-ring">
                            <div className="story-ring-inner">
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden
                                ${avatarColors[index % avatarColors.length]}
                                group-hover:scale-105 transition-transform duration-200`}
                              >
                                <span className="text-sm font-bold">{author.authorInitial}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] text-[#475569] font-semibold truncate max-w-[70px]">
                            @{author.authorUsername}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-md mx-auto slide-up">
                <PostFeed />
              </div>
            )}
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────── */}
        {/* 2. LAPTOP/WEB INTERFACE (hidden md:block) */}
        {/* ──────────────────────────────────────────────────────── */}
        <div className="hidden md:block px-6">
          <div className="flex flex-col gap-6">
            
            {/* Story Row: Tab pill on the left, 4 circles next to it */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab("story")}
                className={`w-32 py-3 px-6 rounded-2xl text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer text-center ${
                  activeTab === "story"
                    ? "bg-[#7C3AED] text-white"
                    : "bg-[#E5E7EB] text-[#475569] hover:bg-[#D1D5DB]"
                }`}
              >
                Story
              </button>
              
              {/* Row of up to 4 circular avatars */}
              <div className="flex items-center gap-5 flex-1 overflow-x-auto no-scrollbar py-1">
                {/* Add Story pill */}
                <button
                  onClick={() => setShowStoryCreator(true)}
                  className="flex flex-col items-center gap-2 group cursor-pointer flex-shrink-0"
                >
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#A78BFA] bg-purple-50 flex items-center justify-center hover:bg-purple-100 transition-all">
                    <Plus size={20} className="text-[#7C3AED]" />
                  </div>
                  <span className="text-[10px] text-[#475569] font-semibold">Add Story</span>
                </button>

                {otherAuthors.slice(0, 4).map((author, index) => {
                  const authorStories = stories.filter((s) => s.authorId === author.authorId);
                  const latestStory = authorStories[0];
                  return (
                    <button
                      key={author.authorId}
                      onClick={() => latestStory && handleSelectStory(latestStory.id)}
                      className="flex flex-col items-center gap-2 group cursor-pointer flex-shrink-0"
                      aria-label={`View ${author.authorUsername}'s story`}
                    >
                      <div className="p-[2px] rounded-full story-ring">
                        <div className="story-ring-inner">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden
                            ${avatarColors[index % avatarColors.length]}
                            group-hover:scale-105 transition-transform duration-200`}
                          >
                            <span className="text-sm font-bold">{author.authorInitial}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#475569] font-semibold truncate max-w-[70px]">
                        @{author.authorUsername}
                      </span>
                    </button>
                  );
                })}
                {otherAuthors.length === 0 && (
                  <span className="text-xs text-slate-400 italic">No stories active. Click Add to share!</span>
                )}
              </div>
            </div>

            {/* Post Row: Tab pill on the left, 2 circles next to it */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab("post")}
                className={`w-32 py-3 px-6 rounded-2xl text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer text-center ${
                  activeTab === "post"
                    ? "bg-[#7C3AED] text-white"
                    : "bg-[#E5E7EB] text-[#475569] hover:bg-[#D1D5DB]"
                }`}
              >
                Post
              </button>

              {/* Row of up to 2 circular avatars */}
              <div className="flex items-center gap-5 flex-1 py-1">
                {otherAuthors.slice(4, 6).map((author, index) => {
                  const authorStories = stories.filter((s) => s.authorId === author.authorId);
                  const latestStory = authorStories[0];
                  return (
                    <button
                      key={author.authorId}
                      onClick={() => latestStory && handleSelectStory(latestStory.id)}
                      className="flex flex-col items-center gap-2 group cursor-pointer flex-shrink-0"
                      aria-label={`View ${author.authorUsername}'s story`}
                    >
                      <div className="p-[2px] rounded-full story-ring">
                        <div className="story-ring-inner">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden
                            ${avatarColors[(index + 4) % avatarColors.length]}
                            group-hover:scale-105 transition-transform duration-200`}
                          >
                            <span className="text-sm font-bold">{author.authorInitial}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#475569] font-semibold truncate max-w-[70px]">
                        @{author.authorUsername}
                      </span>
                    </button>
                  );
                })}
                {/* Fallback to show additional stories or user posts profiles */}
                {otherAuthors.length <= 4 && otherAuthors.slice(0, 2).map((author, index) => {
                  const authorStories = stories.filter((s) => s.authorId === author.authorId);
                  const latestStory = authorStories[0];
                  return (
                    <button
                      key={`fallback_${author.authorId}`}
                      onClick={() => latestStory && handleSelectStory(latestStory.id)}
                      className="flex flex-col items-center gap-2 group cursor-pointer flex-shrink-0 opacity-80"
                      aria-label={`View ${author.authorUsername}'s story`}
                    >
                      <div className="p-[2px] rounded-full story-ring">
                        <div className="story-ring-inner">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden
                            ${avatarColors[(index + 2) % avatarColors.length]}
                            group-hover:scale-105 transition-transform duration-200`}
                          >
                            <span className="text-sm font-bold">{author.authorInitial}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#475569] font-semibold truncate max-w-[70px]">
                        @{author.authorUsername}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Laptop Timeline Feed */}
            {activeTab === "post" ? (
              <div className="mt-8 max-w-xl mx-auto w-full slide-up">
                <PostFeed />
              </div>
            ) : (
              <div className="mt-8 text-center bg-white border border-[#CBD5E1] rounded-3xl p-8 max-w-lg mx-auto shadow-sm slide-up">
                <h4 className="font-bold text-slate-800 text-lg mb-2">Watch Active Stories ✨</h4>
                <p className="text-sm text-slate-500 mb-4">Click any circle above to watch their story playback popup instantly!</p>
                <button
                  onClick={() => setActiveTab("post")}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-xl transition-all cursor-pointer"
                >
                  View Timeline Feed
                </button>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Story Viewer Modal */}
      {selectedStoryId && currentStory && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl slide-up flex flex-col justify-between">
            <div className="flex flex-col gap-4 p-5">
              {/* Story playback card */}
              <div className={`aspect-[9/16] rounded-2xl bg-gradient-to-br ${currentStory.bg} p-6 text-white flex flex-col justify-between shadow-lg relative overflow-hidden`}>
                {/* Progress bar */}
                <div className="flex gap-1.5 w-full absolute top-3 left-0 px-6">
                  <div className="h-1 flex-1 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-white/40 w-full" />
                  </div>
                  <div className="h-1 flex-1 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-white animate-[pulse_1s_infinite]" />
                  </div>
                  <div className="h-1 flex-1 bg-white/30 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-sm">
                      {currentStory.authorInitial}
                    </div>
                    <div>
                      <p className="text-sm font-bold">@{currentStory.authorUsername}</p>
                      <p className="text-[10px] opacity-75">{timeAgo(currentStory.createdAt)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStoryId(null)}
                    className="w-7 h-7 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Close story"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Body */}
                <div className="my-auto text-center px-4">
                  {currentStory.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={currentStory.imageUrl} alt="Story" className="w-full rounded-xl mb-3 max-h-64 object-cover" />
                  )}
                  {currentStory.text && (
                    <p className="text-xl font-extrabold leading-snug drop-shadow-md">
                      &ldquo;{currentStory.text}&rdquo;
                    </p>
                  )}
                </div>

                {/* Reply feedback */}
                <div className="mb-2">
                  {showReplySuccess && (
                    <div className="bg-white/25 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-center text-xs font-semibold slide-up">
                      Reply sent! 🚀
                    </div>
                  )}
                </div>
              </div>

              {/* Reply Form */}
              {currentStory.authorId !== profile.id && (
                <form
                  onSubmit={handleSendReply}
                  className="flex items-center gap-2 bg-[#F3F4F6] rounded-full border border-[#E5E7EB] px-4 py-2.5 shadow-sm"
                >
                  <label htmlFor="modal-reply-input" className="sr-only">Reply to story</label>
                  <input
                    id="modal-reply-input"
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    placeholder={`Reply to @${currentStory.authorUsername}...`}
                    className="flex-1 bg-transparent text-sm text-[#111827] placeholder-[#9CA3AF] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!replyInput.trim()}
                    className="p-1.5 text-[#2563EB] hover:bg-blue-50 rounded-full transition-colors disabled:opacity-40 cursor-pointer"
                    aria-label="Send reply"
                  >
                    <MessageSquare size={18} />
                  </button>
                </form>
              )}

              {/* Close button for own stories */}
              {currentStory.authorId === profile.id && (
                <button
                  onClick={() => setSelectedStoryId(null)}
                  className="w-full py-3 bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] text-sm font-semibold rounded-2xl transition-all cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Story Creator Modal */}
      {showStoryCreator && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl slide-up p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#111827]">Create Story</h3>
              <button
                onClick={() => {
                  setShowStoryCreator(false);
                  stopStoryCamera();
                  setStoryImagePreview(null);
                  setStoryText("");
                }}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {showStoryCamera ? (
              <div className="aspect-[3/4] bg-black rounded-2xl overflow-hidden relative">
                <video
                  ref={storyCameraRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                />
                <button
                  onClick={handleCaptureStoryPhoto}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white hover:bg-slate-100 border-4 border-slate-300 flex items-center justify-center shadow-2xl cursor-pointer"
                  aria-label="Capture Photo"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-900 shadow-inner" />
                </button>
              </div>
            ) : storyImagePreview ? (
              <div className="aspect-[3/4] bg-slate-950 rounded-2xl overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={storyImagePreview} alt="Story preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setStoryImagePreview(null)}
                  className="absolute top-3 right-3 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleStartStoryCamera}
                  className="aspect-square rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-white flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#2563EB] hover:bg-blue-50 transition-all"
                >
                  <Camera size={28} className="text-[#9CA3AF]" />
                  <span className="text-xs font-bold text-[#6B7280]">Camera</span>
                </button>
                <button
                  onClick={() => storyFileRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-white flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#2563EB] hover:bg-blue-50 transition-all"
                >
                  <ImageIcon size={28} className="text-[#9CA3AF]" />
                  <span className="text-xs font-bold text-[#6B7280]">Upload</span>
                </button>
                <input
                  ref={storyFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleStoryFileSelect}
                />
              </div>
            )}

            {/* Text caption for story */}
            <textarea
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              placeholder="What's on your mind? ✨"
              rows={3}
              maxLength={300}
              className="w-full p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 resize-none"
            />
            <div className="flex justify-between items-center text-[10px] text-[#9CA3AF] px-1 -mt-2">
              <span>Photo or text required</span>
              <span>{storyText.length}/300</span>
            </div>

            <button
              onClick={handlePublishStory}
              disabled={!storyText.trim() && !storyImagePreview}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-2xl transition-all shadow-md shadow-blue-200 cursor-pointer"
            >
              Share Story
            </button>
          </div>
        </div>
      )}

      {/* Bottom/Right navigation */}
      <BottomNav />
    </div>
  );
}
