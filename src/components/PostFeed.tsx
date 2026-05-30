"use client";

import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface Post {
  id: string;
  username: string;
  displayName: string;
  timeAgo: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  postType: "normal" | "life_update";
  updateType?: string;
  isLiked?: boolean;
}

const mockPosts: Post[] = [
  {
    id: "1",
    username: "rahul_k",
    displayName: "Rahul Kumar",
    timeAgo: "2h ago",
    content: "Beautiful morning at Marine Drive! 🌅",
    likes: 47,
    comments: 8,
    postType: "normal",
  },
  {
    id: "2",
    username: "priya.m",
    displayName: "Priya Mehta",
    timeAgo: "5h ago",
    content: "So excited to share this news with everyone!",
    likes: 184,
    comments: 23,
    postType: "life_update",
    updateType: "New Job",
    isLiked: true,
  },
  {
    id: "3",
    username: "aman_t",
    displayName: "Aman Tiwari",
    timeAgo: "1d ago",
    content: "Finally moved to Bangalore! The city is amazing 🌆",
    likes: 92,
    comments: 15,
    postType: "life_update",
    updateType: "Changed City",
  },
];

const updateTypeConfig: Record<string, { gradient: string; emoji: string }> = {
  "New Job": { gradient: "update-job", emoji: "💼" },
  "Birthday": { gradient: "update-birthday", emoji: "🎂" },
  "Graduation": { gradient: "update-graduation", emoji: "🎓" },
  "Wedding": { gradient: "update-wedding", emoji: "💍" },
  "Changed City": { gradient: "update-newcity", emoji: "🏙️" },
  "Internship": { gradient: "update-internship", emoji: "📋" },
  "Achievement": { gradient: "update-achievement", emoji: "🏆" },
};

const avatarColors = [
  "from-blue-400 to-blue-600",
  "from-pink-400 to-rose-600",
  "from-purple-400 to-indigo-600",
];

function PostCard({ post, colorIndex }: { post: Post; colorIndex: number }) {
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [saved, setSaved] = useState(false);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const updateCfg = post.updateType ? updateTypeConfig[post.updateType] : null;

  return (
    <article className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden fade-in">
      {/* Post Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[colorIndex % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
          >
            {post.displayName[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">{post.displayName}</p>
            <p className="text-xs text-[#6B7280]">
              @{post.username} · {post.timeAgo}
            </p>
          </div>
        </div>
        <button className="text-[#6B7280] hover:text-[#111827] transition-colors p-1 rounded-full hover:bg-[#F3F4F6]">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Life Update Card */}
      {post.postType === "life_update" && updateCfg && (
        <div className={`mx-4 mb-3 rounded-xl p-4 text-white ${updateCfg.gradient}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{updateCfg.emoji}</span>
            <span className="text-xs font-medium uppercase tracking-wider opacity-80">
              Life Update
            </span>
          </div>
          <p className="text-lg font-bold">{post.updateType}</p>
          <p className="text-sm opacity-90 mt-1">{post.content}</p>
        </div>
      )}

      {/* Normal Post Content */}
      {post.postType === "normal" && (
        <>
          {/* Image placeholder */}
          <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-[#9CA3AF] text-sm">📷 Photo</span>
          </div>
          {/* Caption */}
          <p className="px-4 pt-3 text-sm text-[#111827]">{post.content}</p>
        </>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 group"
            aria-label="Like post"
          >
            <Heart
              size={22}
              className={`transition-all duration-200 group-hover:scale-110 ${
                liked
                  ? "fill-[#EF4444] stroke-[#EF4444]"
                  : "stroke-[#6B7280] group-hover:stroke-[#EF4444]"
              }`}
            />
            <span className={`text-sm font-medium ${liked ? "text-[#EF4444]" : "text-[#6B7280]"}`}>
              {likeCount}
            </span>
          </button>

          <button className="flex items-center gap-1.5 group" aria-label="Comment">
            <MessageCircle
              size={22}
              className="stroke-[#6B7280] group-hover:stroke-[#2563EB] transition-colors group-hover:scale-110 duration-200"
            />
            <span className="text-sm font-medium text-[#6B7280]">{post.comments}</span>
          </button>

          <button className="group" aria-label="Share">
            <Share2
              size={22}
              className="stroke-[#6B7280] group-hover:stroke-[#22C55E] transition-colors group-hover:scale-110 duration-200"
            />
          </button>
        </div>

        <button
          onClick={() => setSaved((s) => !s)}
          className="group"
          aria-label="Save post"
        >
          <Bookmark
            size={22}
            className={`transition-all duration-200 group-hover:scale-110 ${
              saved
                ? "fill-[#2563EB] stroke-[#2563EB]"
                : "stroke-[#6B7280] group-hover:stroke-[#2563EB]"
            }`}
          />
        </button>
      </div>
    </article>
  );
}

export default function PostFeed() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {mockPosts.map((post, index) => (
        <PostCard key={post.id} post={post} colorIndex={index} />
      ))}
    </div>
  );
}
