"use client";

import { Plus } from "lucide-react";

interface Story {
  id: string;
  username: string;
  avatar: string;
  hasUnread: boolean;
  isOwn?: boolean;
}

const mockStories: Story[] = [
  { id: "own", username: "Your Story", avatar: "", hasUnread: false, isOwn: true },
  { id: "1", username: "rahul_k", avatar: "", hasUnread: true },
  { id: "2", username: "priya.m", avatar: "", hasUnread: true },
  { id: "3", username: "aman_t", avatar: "", hasUnread: true },
  { id: "4", username: "sejal_r", avatar: "", hasUnread: false },
  { id: "5", username: "nikhil_v", avatar: "", hasUnread: true },
];

// Gradient colors for avatar placeholders
const avatarColors = [
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-pink-400 to-rose-600",
  "bg-gradient-to-br from-purple-400 to-indigo-600",
  "bg-gradient-to-br from-amber-400 to-orange-500",
  "bg-gradient-to-br from-emerald-400 to-teal-600",
];

interface StoriesRowProps {
  selectedStoryId: string | null;
  onSelectStory: (id: string) => void;
}

export default function StoriesRow({ selectedStoryId, onSelectStory }: StoriesRowProps) {
  return (
    <div className="bg-white border-b border-[#E5E7EB]">
      <div className="flex items-stretch gap-4 px-4 py-3 overflow-x-auto no-scrollbar">
        {mockStories.map((story, index) => {
          const isSelected = selectedStoryId === story.id;
          return (
            <button
              key={story.id}
              onClick={() => onSelectStory(story.id)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer"
              aria-label={story.isOwn ? "Create story" : `View ${story.username}'s story`}
            >
              {/* Avatar with ring */}
              <div className={`relative ${story.hasUnread && !story.isOwn ? "story-ring" : ""} ${isSelected ? "ring-2 ring-offset-2 ring-[#2563EB] rounded-full" : ""}`}>
                <div
                  className={`${story.hasUnread && !story.isOwn ? "story-ring-inner" : "p-[2px]"}`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden
                      ${story.isOwn ? "bg-[#F3F4F6] border-2 border-dashed border-[#D1D5DB]" : avatarColors[index % avatarColors.length]}
                      group-hover:scale-105 transition-transform duration-200`}
                  >
                    {story.isOwn ? (
                      <Plus size={20} className="text-[#6B7280]" />
                    ) : (
                      <span className="text-sm">{story.username[0].toUpperCase()}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Username */}
              <span className="text-[10px] text-[#6B7280] font-medium max-w-[56px] truncate text-center">
                @{story.isOwn ? "your_story" : story.username}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
