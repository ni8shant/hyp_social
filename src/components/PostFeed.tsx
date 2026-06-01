"use client";

import { Heart, MessageCircle, Share2, MoreHorizontal, Sparkles, Send, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getAllPosts,
  toggleLikePost,
  addComment,
  timeAgo,
  LIFE_UPDATE_CONFIGS,
  type HypPost,
} from "@/lib/data";

function PostCard({ post, currentUserId, currentUsername }: { post: HypPost; currentUserId: string; currentUsername: string }) {
  const isLiked = post.likes.includes(currentUserId);
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [comments, setComments] = useState(post.comments);
  const [newCommentText, setNewCommentText] = useState("");
  const [shareSuccess, setShareSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLike = () => {
    const updated = toggleLikePost(post.id, currentUserId);
    if (updated) {
      setLiked(updated.likes.includes(currentUserId));
      setLikeCount(updated.likes.length);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`https://hyp.social/post/${post.id}`);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  const handleCommentClick = () => {
    inputRef.current?.focus();
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const updated = addComment(post.id, {
      authorId: currentUserId,
      authorUsername: currentUsername,
      text: newCommentText.trim(),
    });
    if (updated) {
      setComments([...updated.comments]);
    }
    setNewCommentText("");
  };

  const updateCfg = post.updateType ? LIFE_UPDATE_CONFIGS[post.updateType] : null;

  return (
    <article className="mb-8 last:mb-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5 pl-1.5">
        <div>
          <p className="text-sm font-extrabold text-[#111827] tracking-tight">
            @{post.authorUsername} {post.postType === "life_update" ? "life update" : "post"}
          </p>
          <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mt-0.5">
            {timeAgo(post.createdAt)}
          </p>
        </div>
        <button className="text-[#6B7280] hover:text-[#7C3AED] transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Card and Side Actions */}
      <div className="flex items-stretch gap-3">
        <div className={`flex-1 aspect-[3/4] sm:aspect-[4/5] rounded-[2.2rem] p-6 border shadow-sm flex flex-col justify-between overflow-hidden relative group transition-all duration-300 ${
          post.postType === "life_update" && updateCfg
            ? `bg-gradient-to-br ${updateCfg.gradient} text-white border-transparent`
            : "bg-[#E5E7EB] border-[#CBD5E1] text-[#374151]"
        }`}>
          {/* Card header */}
          <div className="flex justify-between items-center pointer-events-none z-10">
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm uppercase tracking-wider flex items-center gap-1 ${
              post.postType === "life_update"
                ? "bg-white/20 backdrop-blur-md text-white border border-white/10"
                : "bg-white/80 backdrop-blur-md text-[#4B5563]"
            }`}>
              {post.postType === "life_update" ? (
                <>
                  <Sparkles size={9} className="text-amber-300 animate-spin" />
                  Life Update
                </>
              ) : "Feed"}
            </span>
          </div>

          {/* Post media / content */}
          <div className="my-auto text-center px-4 flex flex-col items-center justify-center gap-4 z-10">
            {post.postType === "life_update" && updateCfg && (
              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl animate-bounce [animation-duration:3s]">{updateCfg.emoji}</span>
                <h3 className="text-xl font-black tracking-wide text-white drop-shadow-sm">{post.updateType}</h3>
              </div>
            )}
            {post.imageUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={post.imageUrl} alt="Post media" className="w-full max-h-48 object-cover rounded-xl" />
            )}
            <p className={`text-base font-extrabold leading-relaxed ${
              post.postType === "life_update" ? "text-white drop-shadow-md" : "text-[#374151] px-2"
            }`}>
              &ldquo;{post.content}&rdquo;
            </p>
          </div>

          {/* Share toast */}
          {shareSuccess && (
            <div className="absolute inset-x-4 bottom-4 z-20 bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl p-2.5 text-center text-[10px] font-bold text-[#7C3AED] shadow-lg flex items-center justify-center gap-1.5 slide-up">
              <Check size={12} className="stroke-[3] text-emerald-500" />
              Link copied to clipboard!
            </div>
          )}

          <div className="absolute inset-0 bg-white/5 opacity-40 pointer-events-none" />
        </div>

        {/* Side Actions */}
        <div className="flex flex-col justify-center items-center gap-4.5 pl-1.5 flex-shrink-0">
          <button
            onClick={handleLike}
            className={`p-3 bg-white hover:bg-slate-50 border rounded-2xl shadow-sm transition-all duration-200 cursor-pointer flex flex-col items-center gap-1 group ${
              liked ? "border-red-100 text-[#EF4444]" : "border-slate-200 text-[#4B5563]"
            }`}
            aria-label="Like post"
          >
            <Heart
              size={18}
              className={`transition-all duration-200 group-hover:scale-110 ${
                liked ? "fill-[#EF4444] stroke-[#EF4444]" : "stroke-current"
              }`}
            />
            <span className="text-[10px] font-extrabold">{likeCount}</span>
          </button>

          <button
            onClick={handleCommentClick}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer flex flex-col items-center gap-1 group text-[#4B5563] hover:text-[#7C3AED]"
            aria-label="Comment"
          >
            <MessageCircle size={18} className="stroke-current group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-extrabold">{comments.length}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer text-[#4B5563] hover:text-emerald-500 group"
            aria-label="Share"
          >
            <Share2 size={18} className="stroke-current group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-4 pl-1.5 max-w-lg space-y-2">
        <div className="space-y-1">
          {comments.map((comment) => (
            <p key={comment.id} className="text-xs text-[#4B5563] leading-relaxed break-words">
              <span className="font-extrabold text-[#111827] mr-1.5">
                @{comment.authorUsername}
              </span>
              <span className="font-medium">{comment.text}</span>
            </p>
          ))}
        </div>

        <form
          onSubmit={handlePostComment}
          className="flex gap-2 items-center pt-2 border-t border-slate-100"
        >
          <label htmlFor={`comment-input-${post.id}`} className="sr-only">Add comment</label>
          <input
            id={`comment-input-${post.id}`}
            ref={inputRef}
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-1.5 text-xs placeholder-[#9CA3AF] text-[#111827] outline-none focus:bg-white focus:border-[#7C3AED]/20 focus:ring-1 focus:ring-[#7C3AED]/10 transition-all"
            required
          />
          <button
            type="submit"
            disabled={!newCommentText.trim()}
            className="p-1.5 bg-[#7C3AED]/10 hover:bg-[#7C3AED] text-[#7C3AED] hover:text-white disabled:opacity-40 disabled:hover:bg-[#7C3AED]/10 disabled:hover:text-[#7C3AED] disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer shadow-sm"
            aria-label="Send Comment"
          >
            <Send size={12} />
          </button>
        </form>
      </div>
    </article>
  );
}

export default function PostFeed() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<HypPost[]>([]);

  const refreshPosts = () => {
    setPosts(getAllPosts());
  };

  useEffect(() => {
    refreshPosts();
    const handler = () => refreshPosts();
    window.addEventListener("hyp_data_change", handler);
    return () => window.removeEventListener("hyp_data_change", handler);
  }, []);

  if (!profile) return null;

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-violet-50 text-[#7C3AED] flex items-center justify-center mx-auto mb-4">
          <Sparkles size={28} />
        </div>
        <h3 className="text-lg font-bold text-[#111827] mb-2">No posts yet</h3>
        <p className="text-sm text-[#6B7280]">
          Be the first to share something! Tap the camera icon below.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-2 py-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={profile.id}
          currentUsername={profile.username}
        />
      ))}
    </div>
  );
}
