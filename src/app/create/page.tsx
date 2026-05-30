"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  Type,
  Sparkles,
  X,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

// Predefined life update types
const lifeUpdateTypes = [
  { label: "New Job", emoji: "💼", gradient: "from-[#2563EB] to-[#60A5FA]" },
  { label: "Started MBA", emoji: "📚", gradient: "from-[#7C3AED] to-[#4F46E5]" },
  { label: "Got Internship", emoji: "📋", gradient: "from-[#D97706] to-[#F59E0B]" },
  { label: "Changed City", emoji: "🏙️", gradient: "from-[#059669] to-[#10B981]" },
  { label: "Birthday", emoji: "🎂", gradient: "from-[#EC4899] to-[#F97316]" },
  { label: "Wedding", emoji: "💍", gradient: "from-[#DB2777] to-[#9333EA]" },
  { label: "Graduation", emoji: "🎓", gradient: "from-[#7C3AED] to-[#4F46E5]" },
  { label: "Achievement", emoji: "🏆", gradient: "from-[#0891B2] to-[#06B6D4]" },
  { label: "New Home", emoji: "🏠", gradient: "from-[#065F46] to-[#10B981]" },
  { label: "Had a Baby", emoji: "👶", gradient: "from-[#DB2777] to-[#EC4899]" },
  { label: "Started Business", emoji: "🚀", gradient: "from-[#1D4ED8] to-[#7C3AED]" },
  { label: "Promotion", emoji: "⭐", gradient: "from-[#B45309] to-[#F59E0B]" },
];

// Simulated trending (top 3 by usage)
const trendingTypes = ["New Job", "Birthday", "Graduation"];

type PostMode = "normal" | "life_update";

export default function CreatePage() {
  const [mode, setMode] = useState<PostMode>("normal");
  const [caption, setCaption] = useState("");
  const [selectedUpdate, setSelectedUpdate] = useState<string | null>(null);
  const [customUpdateText, setCustomUpdateText] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const selectedUpdateData = lifeUpdateTypes.find(
    (u) => u.label === (showCustomInput ? customUpdateText : selectedUpdate)
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-2xl mx-auto">
      <TopBar showSearch={false} />

      <main className="pb-24 px-4 pt-4">
        <h1 className="text-2xl font-bold text-[#111827] mb-4">Create</h1>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-5 bg-[#F3F4F6] p-1 rounded-2xl">
          <button
            id="create-mode-post"
            onClick={() => setMode("normal")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              mode === "normal"
                ? "bg-white text-[#111827] shadow-sm"
                : "text-[#6B7280]"
            }`}
          >
            <ImageIcon size={16} />
            Post
          </button>
          <button
            id="create-mode-update"
            onClick={() => setMode("life_update")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              mode === "life_update"
                ? "bg-white text-[#111827] shadow-sm"
                : "text-[#6B7280]"
            }`}
          >
            <Sparkles size={16} />
            Life Update
          </button>
        </div>

        {/* NORMAL POST MODE */}
        {mode === "normal" && (
          <div className="flex flex-col gap-4 slide-up">
            {/* Image upload */}
            <label
              htmlFor="post-image-upload"
              className="w-full aspect-video rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-white flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-all"
            >
              {imagePreview ? (
                <div className="relative w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ) : (
                <>
                  <ImageIcon size={32} className="text-[#CBD5E1]" />
                  <p className="text-sm font-medium text-[#6B7280]">Tap to add photo or video</p>
                  <p className="text-xs text-[#9CA3AF]">Max 10MB · JPG, PNG, MP4</p>
                </>
              )}
              <input
                id="post-image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>

            {/* Caption */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
              <textarea
                id="post-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                rows={4}
                maxLength={2200}
                className="w-full p-4 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none resize-none"
              />
              <div className="flex items-center justify-between px-4 pb-3">
                <button className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827]">
                  <Type size={14} /> Add text formatting
                </button>
                <span className="text-xs text-[#9CA3AF]">{caption.length}/2200</span>
              </div>
            </div>

            {/* Share button */}
            <button
              id="post-share"
              className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-2xl transition-all active:scale-[0.98] shadow-md shadow-blue-200"
            >
              Share Post
            </button>
          </div>
        )}

        {/* LIFE UPDATE CARD MODE */}
        {mode === "life_update" && (
          <div className="flex flex-col gap-5 slide-up">
            {/* Preview card */}
            {(selectedUpdate || (showCustomInput && customUpdateText)) && (
              <div
                className={`rounded-2xl p-5 text-white bg-gradient-to-br ${
                  selectedUpdateData?.gradient || "from-[#374151] to-[#6B7280]"
                } shadow-lg`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{selectedUpdateData?.emoji || "✨"}</span>
                  <span className="text-xs font-semibold uppercase tracking-widest opacity-70">
                    Life Update
                  </span>
                </div>
                <p className="text-xl font-bold">
                  {showCustomInput ? customUpdateText : selectedUpdate}
                </p>
                {caption && <p className="text-sm opacity-80 mt-1">{caption}</p>}
              </div>
            )}

            {/* Trending picks */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp size={14} className="text-[#F59E0B]" />
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Trending on hyp
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {lifeUpdateTypes
                  .filter((u) => trendingTypes.includes(u.label))
                  .map((u) => (
                    <button
                      key={u.label}
                      onClick={() => {
                        setSelectedUpdate(u.label);
                        setShowCustomInput(false);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                        selectedUpdate === u.label && !showCustomInput
                          ? "bg-gradient-to-r " + u.gradient + " text-white border-transparent shadow-sm"
                          : "bg-white text-[#374151] border-[#E5E7EB] hover:border-[#2563EB]"
                      }`}
                    >
                      {u.emoji} {u.label}
                    </button>
                  ))}
              </div>
            </div>

            {/* All update types grid */}
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
                All Updates
              </p>
              <div className="grid grid-cols-2 gap-2">
                {lifeUpdateTypes.map((u) => (
                  <button
                    key={u.label}
                    onClick={() => {
                      setSelectedUpdate(u.label);
                      setShowCustomInput(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                      selectedUpdate === u.label && !showCustomInput
                        ? "bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]"
                        : "bg-white border-[#E5E7EB] text-[#374151] hover:border-[#93C5FD]"
                    }`}
                  >
                    <span className="text-lg">{u.emoji}</span>
                    <span className="truncate">{u.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom update */}
            <button
              onClick={() => {
                setShowCustomInput(true);
                setSelectedUpdate(null);
              }}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                showCustomInput
                  ? "bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]"
                  : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#93C5FD]"
              }`}
            >
              <span>✍️ Write something custom...</span>
              <ChevronRight size={16} />
            </button>

            {showCustomInput && (
              <input
                id="custom-update-text"
                type="text"
                value={customUpdateText}
                onChange={(e) => setCustomUpdateText(e.target.value)}
                placeholder="e.g. Started a podcast 🎙️"
                className="w-full px-4 py-3 bg-white border border-[#2563EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 -mt-2 slide-up"
              />
            )}

            {/* Caption */}
            <textarea
              id="update-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a message to share with friends..."
              rows={3}
              className="w-full p-4 bg-white border border-[#E5E7EB] rounded-2xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 resize-none"
            />

            {/* Share button */}
            <button
              id="update-share"
              className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-2xl transition-all active:scale-[0.98] shadow-md shadow-blue-200"
            >
              Share Life Update ✨
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
