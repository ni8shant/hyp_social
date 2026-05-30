"use client";

import { Grid3X3, BookOpen, Info, Settings, Share2, Edit3 } from "lucide-react";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

const mockHighlights = [
  { id: "1", label: "College", color: "from-blue-400 to-blue-600" },
  { id: "2", label: "Mumbai", color: "from-pink-400 to-rose-500" },
  { id: "3", label: "Trips", color: "from-amber-400 to-orange-500" },
  { id: "4", label: "Family", color: "from-purple-400 to-indigo-600" },
];

const mockPosts = [
  { id: "1", color: "bg-gradient-to-br from-blue-100 to-blue-200" },
  { id: "2", color: "bg-gradient-to-br from-pink-100 to-pink-200" },
  { id: "3", color: "bg-gradient-to-br from-purple-100 to-purple-200" },
  { id: "4", color: "bg-gradient-to-br from-amber-100 to-amber-200" },
  { id: "5", color: "bg-gradient-to-br from-emerald-100 to-emerald-200" },
  { id: "6", color: "bg-gradient-to-br from-rose-100 to-rose-200" },
];

const tabs = ["Posts", "Highlights", "About"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-2xl mx-auto">
      <TopBar />

      <main className="pb-20">
        {/* Profile header */}
        <div className="bg-white border-b border-[#E5E7EB]">
          {/* Cover photo area */}
          <div className="h-28 bg-gradient-to-r from-[#2563EB] to-[#818CF8]" />

          <div className="px-4 pb-4">
            {/* Avatar + action buttons */}
            <div className="flex items-end justify-between -mt-8 mb-3">
              <div className="story-ring">
                <div className="story-ring-inner">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2563EB] to-[#818CF8] flex items-center justify-center text-white font-bold text-3xl">
                    N
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-10">
                <button className="flex items-center gap-1.5 px-4 py-1.5 border border-[#E5E7EB] rounded-full text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] transition-colors">
                  <Edit3 size={14} />
                  Edit
                </button>
                <button className="p-2 border border-[#E5E7EB] rounded-full hover:bg-[#F3F4F6] transition-colors">
                  <Share2 size={16} className="text-[#374151]" />
                </button>
                <button className="p-2 border border-[#E5E7EB] rounded-full hover:bg-[#F3F4F6] transition-colors">
                  <Settings size={16} className="text-[#374151]" />
                </button>
              </div>
            </div>

            {/* Name & info */}
            <div className="mb-3">
              <h1 className="text-lg font-bold text-[#111827]">Nishant</h1>
              <p className="text-sm text-[#6B7280]">@user_name</p>
              <p className="text-sm text-[#374151] mt-1.5 leading-relaxed">
                Living life one story at a time ✨ | Mumbai → Bangalore
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              {[
                { label: "Posts", value: "42" },
                { label: "Followers", value: "1.2K" },
                { label: "Following", value: "318" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-bold text-[#111827]">{stat.value}</p>
                  <p className="text-xs text-[#6B7280]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-[#E5E7EB]">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                id={`profile-tab-${tab.toLowerCase()}`}
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === i
                    ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {tab === "Posts" && <Grid3X3 size={16} className="inline mr-1" />}
                {tab === "Highlights" && <BookOpen size={16} className="inline mr-1" />}
                {tab === "About" && <Info size={16} className="inline mr-1" />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-4">
          {/* Posts tab */}
          {activeTab === 0 && (
            <div className="grid grid-cols-3 gap-1.5">
              {mockPosts.map((post) => (
                <div
                  key={post.id}
                  className={`aspect-square rounded-xl ${post.color} hover:opacity-90 transition-opacity cursor-pointer`}
                />
              ))}
            </div>
          )}

          {/* Highlights tab */}
          {activeTab === 1 && (
            <div>
              <p className="text-xs text-[#6B7280] font-medium mb-3 uppercase tracking-wider">
                Your highlighted stories
              </p>
              <div className="flex gap-4 flex-wrap">
                {mockHighlights.map((h) => (
                  <div key={h.id} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${h.color} shadow-sm`}
                    />
                    <span className="text-xs text-[#374151] font-medium">{h.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About tab */}
          {activeTab === 2 && (
            <div className="flex flex-col gap-3">
              {[
                { label: "Full Name", value: "Nishant" },
                { label: "Username", value: "@user_name" },
                { label: "Location", value: "Bangalore, India" },
                { label: "Member since", value: "May 2025" },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl px-4 py-3 border border-[#E5E7EB]">
                  <p className="text-xs text-[#9CA3AF] font-medium">{item.label}</p>
                  <p className="text-sm font-medium text-[#111827] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
