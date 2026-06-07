"use client";

import { useState, useEffect, Suspense } from "react";
import { SquarePen, Settings, X, Check, Heart, MessageCircle, Plus, Share2, Camera, Sparkles, LogOut, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import {
  getPostsByUser,
  getStoriesByUser,
  toggleLikePost,
  addComment,
  timeAgo,
  type HypPost,
  type HypStory,
} from "@/lib/data";

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const { profile, updateProfile, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const uParam = searchParams?.get("u");

  // State to track if it is own profile or someone else's
  const [targetUser, setTargetUser] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({ fullName: "", dob: "", about: "" });
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Stories state
  const [stories, setStories] = useState<HypStory[]>([]);
  const [activeStory, setActiveStory] = useState<HypStory | null>(null);
  
  // Posts state
  const [posts, setPosts] = useState<HypPost[]>([]);
  const [activePost, setActivePost] = useState<HypPost | null>(null);
  const [newComment, setNewComment] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !profile) {
      const currentUrl = typeof window !== "undefined" ? window.location.search : "";
      router.push(`/login?next=/profile${currentUrl}`);
    }
  }, [authLoading, profile, router]);

  // Load target user or current user
  useEffect(() => {
    if (authLoading) return;
    if (!profile) return;

    const loadProfileData = async () => {
      const supabase = createClient();
      if (uParam && uParam !== profile.username) {
        setIsOwnProfile(false);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", uParam)
          .single();

        if (data && !error) {
          const fullName = data.full_name || data.username;
          const target = {
            id: data.id,
            username: data.username,
            fullName: fullName,
            dob: data.dob || "",
            about: data.bio || "Hey, I'm on hyp! ✨",
            avatarInitial: fullName[0]?.toUpperCase() || "U",
          };
          setTargetUser(target);

          // Check if already following
          const { data: followData } = await supabase
            .from("follows")
            .select("status")
            .eq("follower_id", profile.id)
            .eq("following_id", data.id)
            .maybeSingle();

          setIsFollowing(!!followData);
        } else {
          setIsOwnProfile(true);
          setTargetUser(profile);
        }
      } else {
        setIsOwnProfile(true);
        setTargetUser(profile);
      }
    };

    loadProfileData();
  }, [uParam, profile, authLoading]);

  // Load user data (posts/stories)
  const refreshData = async () => {
    const userToLoad = targetUser || profile;
    if (userToLoad) {
      const uPosts = await getPostsByUser(userToLoad.id);
      const uStories = await getStoriesByUser(userToLoad.id);
      setPosts(uPosts);
      setStories(uStories);
    }
  };

  useEffect(() => {
    refreshData();
    const handler = () => refreshData();
    window.addEventListener("hyp_data_change", handler);
    return () => window.removeEventListener("hyp_data_change", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUser?.id, profile?.id]);

  if (authLoading || !profile || !targetUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleFollowToggle = async () => {
    if (!profile || !targetUser || followLoading) return;
    setFollowLoading(true);
    const supabase = createClient();
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", profile.id)
          .eq("following_id", targetUser.id);
        if (!error) {
          setIsFollowing(false);
        }
      } else {
        // Follow
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: profile.id,
            following_id: targetUser.id,
            status: "accepted"
          });
        if (!error) {
          setIsFollowing(true);

          // Trigger follow notification
          await supabase.from("notifications").insert({
            user_id: targetUser.id,
            actor_id: profile.id,
            type: "follow",
          });
        }
      }
    } catch (err) {
      console.error("Error toggling follow status:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: tempProfile.fullName,
      dob: tempProfile.dob,
      about: tempProfile.about,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 1500);
  };

  const handleAddComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const updated = await addComment(postId, {
      authorId: profile.id,
      authorUsername: profile.username,
      text: newComment.trim(),
    });

    if (updated) {
      setActivePost(updated);
      await refreshData();
    }
    setNewComment("");
  };

  const handleLikePost = async (postId: string) => {
    const updated = await toggleLikePost(postId, profile.id);
    if (updated) {
      setActivePost(updated);
      await refreshData();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const activeUser = targetUser || profile;

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-4xl mx-auto relative md:px-12">
      <TopBar showSearch={true} />

      <main className="pb-24 pt-4 max-w-2xl mx-auto px-4">
        {/* Profile Info Area */}
        <div className="bg-white border border-[#CBD5E1]/70 rounded-[2.2rem] p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            
            {/* Left Section: Avatar & username */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7C3AED] to-pink-500 flex items-center justify-center text-white font-extrabold text-3xl shadow-md border-2 border-white ring-4 ring-[#7C3AED]/10">
                {activeUser.avatarInitial}
              </div>
              <span className="text-xs font-bold text-[#4B5563] tracking-wide bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60 shadow-inner">
                @{activeUser.username}
              </span>
            </div>

            {/* Middle Section: Name, DOB, About */}
            <div className="flex-1 space-y-3 pt-1 pl-4 min-w-0">
              <div className="border-b border-slate-50 pb-1">
                <p className="text-[10px] text-[#94A3B8] font-extrabold uppercase tracking-widest mb-0.5">Name</p>
                <p className="text-base font-extrabold text-[#111827] truncate">{activeUser.fullName}</p>
              </div>
              <div className="border-b border-slate-50 pb-1">
                <p className="text-[10px] text-[#94A3B8] font-extrabold uppercase tracking-widest mb-0.5">DOB</p>
                <p className="text-xs font-semibold text-[#4B5563]">{activeUser.dob || "Not set"}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#94A3B8] font-extrabold uppercase tracking-widest mb-0.5">About</p>
                <p className="text-xs font-medium text-[#4B5563] leading-relaxed break-words">{activeUser.about}</p>
              </div>
            </div>

            {/* Right Section: Action Buttons */}
            {isOwnProfile ? (
              <div className="flex flex-col items-center gap-3.5 flex-shrink-0">
                <button
                  id="edit-profile-btn"
                  onClick={() => {
                    setTempProfile({
                      fullName: profile.fullName,
                      dob: profile.dob,
                      about: profile.about,
                    });
                    setIsEditing(true);
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-[#4B5563] hover:text-[#7C3AED] rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 cursor-pointer"
                  aria-label="Edit Profile"
                >
                  <SquarePen size={18} className="stroke-[2.2]" />
                </button>
                
                <Link
                  href="/settings"
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-[#4B5563] hover:text-[#7C3AED] rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 cursor-pointer"
                  aria-label="Settings"
                >
                  <Settings size={18} className="stroke-[2.2]" />
                </Link>

                <button
                  onClick={handleSignOut}
                  className="p-2.5 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-2xl border border-red-100 shadow-sm transition-all duration-200 cursor-pointer"
                  aria-label="Sign Out"
                >
                  <LogOut size={18} className="stroke-[2.2]" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-shrink-0">
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isFollowing
                      ? "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                      : "bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-md shadow-violet-200"
                  }`}
                >
                  {isFollowing ? "Following" : <><UserPlus size={12} /> Follow</>}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Stories Section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#4B5563] mb-3 pl-1">
            {isOwnProfile ? "Your stories" : `${activeUser.fullName}'s stories`}
          </h2>
          {stories.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs text-[#9CA3AF]">
                {isOwnProfile ? "No active stories. Share one from the home page!" : "No active stories."}
              </p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto no-scrollbar items-center py-1">
              {stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => setActiveStory(story)}
                  className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer focus:outline-none"
                >
                  <div className="story-ring transition-transform group-hover:scale-105 duration-200 shadow-md">
                    <div className="story-ring-inner">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${story.bg} flex items-center justify-center text-white font-black text-sm`}>
                        {story.authorInitial}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#4B5563] font-bold tracking-tight">
                    {timeAgo(story.createdAt)}
                  </span>
                </button>
              ))}

              {isOwnProfile && (
                <Link
                  href="/home"
                  className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer"
                >
                  <div className="w-[66px] h-[66px] rounded-full border-2 border-dashed border-[#9CA3AF] flex items-center justify-center text-[#4B5563] hover:bg-slate-100 hover:border-[#7C3AED] hover:text-[#7C3AED] transition-all duration-200">
                    <Plus size={20} />
                  </div>
                  <span className="text-[10px] text-[#9CA3AF] font-bold">New</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Posts Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#4B5563] mb-3 pl-1">
            {isOwnProfile ? "Your posts" : `${activeUser.fullName}'s posts`}
          </h2>
          {posts.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
              <Camera size={28} className="text-[#9CA3AF] mx-auto mb-2" />
              <p className="text-xs text-[#9CA3AF]">No posts yet.</p>
              {isOwnProfile && (
                <Link
                  href="/create"
                  className="inline-block mt-3 px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  Create Post
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3.5">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setActivePost(post)}
                  className={`relative aspect-[2/3] hover:shadow-lg rounded-[1.8rem] border border-slate-200/60 p-4 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between group ${
                    post.postType === "life_update" && post.updateGradient
                      ? `bg-gradient-to-br ${post.updateGradient} text-white`
                      : "bg-gradient-to-br from-blue-500/20 via-indigo-500/30 to-violet-500/40"
                  }`}
                >
                  {/* Floating tag */}
                  <div className="flex justify-between items-center z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-ping" />
                    <span className="bg-white/85 backdrop-blur-md text-[8px] font-bold text-[#4B5563] px-1.5 py-0.5 rounded-full shadow-sm">
                      {timeAgo(post.createdAt)}
                    </span>
                  </div>

                  <div className="my-auto flex flex-col items-center justify-center gap-2 text-slate-500/50">
                    {post.postType === "life_update" && post.updateEmoji ? (
                      <span className="text-2xl">{post.updateEmoji}</span>
                    ) : (
                      <Camera size={26} className="group-hover:scale-110 group-hover:text-[#7C3AED]/40 transition-all duration-300" />
                    )}
                    <p className={`text-[9px] text-center px-1 font-semibold line-clamp-3 leading-relaxed ${
                      post.postType === "life_update" ? "text-white/90" : "text-[#475569]"
                    }`}>
                      &ldquo;{post.content}&rdquo;
                    </p>
                  </div>

                  {/* Stats overlay */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 flex items-center justify-around border border-white/40 shadow-sm z-10">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#4B5563]">
                      <Heart size={11} className="text-[#EF4444] fill-[#EF4444]" />
                      <span>{post.likes.length}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#4B5563]">
                      <MessageCircle size={11} className="text-[#7C3AED]" />
                      <span>{post.comments.length}</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/45 z-50 flex items-end justify-center p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSaveProfile}
            className="bg-white w-full max-w-md rounded-3xl p-6 slide-up shadow-2xl border border-slate-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-[#111827] tracking-tight">Edit Profile</h2>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-[#9CA3AF] hover:text-[#4B5563] p-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {saveSuccess ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-3 slide-up">
                <div className="w-12 h-12 bg-emerald-100 text-[#22C55E] rounded-full flex items-center justify-center shadow-sm">
                  <Check size={24} className="stroke-[3]" />
                </div>
                <h3 className="text-sm font-bold text-[#111827]">Profile Saved!</h3>
                <p className="text-xs text-[#6B7280]">Your details were updated successfully.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="text-xs font-bold text-[#4B5563] block mb-1">Full Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    value={tempProfile.fullName}
                    onChange={(e) => setTempProfile({ ...tempProfile, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-dob" className="text-xs font-bold text-[#4B5563] block mb-1">Date of Birth</label>
                  <input
                    id="edit-dob"
                    type="text"
                    value={tempProfile.dob}
                    onChange={(e) => setTempProfile({ ...tempProfile, dob: e.target.value })}
                    placeholder="e.g. August 15, 2002"
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-about" className="text-xs font-bold text-[#4B5563] block mb-1">About Bio</label>
                  <textarea
                    id="edit-about"
                    value={tempProfile.about}
                    onChange={(e) => setTempProfile({ ...tempProfile, about: e.target.value })}
                    rows={4}
                    maxLength={200}
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all resize-none animate-none"
                    required
                  />
                  <span className="text-[10px] text-[#9CA3AF] block text-right mt-1">{tempProfile.about.length}/200</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-violet-200 mt-2 cursor-pointer"
                >
                  Save Updates
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4">
          
          {/* Header */}
          <div className="flex items-center justify-between mt-3 text-white z-10 px-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-sm">
                {activeStory.authorInitial}
              </div>
              <div>
                <p className="text-sm font-bold">@{activeStory.authorUsername}</p>
                <p className="text-[10px] opacity-75">{timeAgo(activeStory.createdAt)}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveStory(null)}
              className="w-8 h-8 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close story"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="my-auto max-w-sm w-full mx-auto aspect-[9/16] rounded-3xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between p-6">
            <div className={`absolute inset-0 bg-gradient-to-br ${activeStory.bg} opacity-90`} />
            
            {activeStory.imageUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={activeStory.imageUrl} alt="Story content" className="w-full h-full object-cover rounded-2xl absolute inset-0 z-0" />
            )}

            <div className="my-auto text-center px-4 z-10 text-white">
              <p className="text-xl font-extrabold leading-snug drop-shadow-md">
                &ldquo;{activeStory.text}&rdquo;
              </p>
            </div>
          </div>

          {/* Footer Spacer */}
          <div className="h-6" />

        </div>
      )}

      {/* Post Viewer Detail Modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl slide-up p-5 flex flex-col gap-4 max-h-[85vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-[#111827] text-sm">@{activeUser.username}</h3>
                <p className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider mt-0.5">{timeAgo(activePost.createdAt)}</p>
              </div>
              <button
                onClick={() => setActivePost(null)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close Detail"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content Display */}
            <div className={`aspect-[4/3] rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-4 ${
              activePost.postType === "life_update" && activePost.updateGradient
                ? `bg-gradient-to-br ${activePost.updateGradient} text-white`
                : "bg-slate-50 text-[#374151] border border-slate-100"
            }`}>
              {activePost.postType === "life_update" && activePost.updateEmoji && (
                <span className="text-4xl animate-bounce">{activePost.updateEmoji}</span>
              )}
              {activePost.imageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={activePost.imageUrl} alt="Post detail" className="max-h-24 rounded-lg object-cover mb-1" />
              )}
              <p className="text-sm font-extrabold leading-relaxed">
                &ldquo;{activePost.content}&rdquo;
              </p>
            </div>

            {/* Like interaction */}
            <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-[#4B5563]">
                {activePost.likes.length} Likes
              </span>
              <button
                onClick={() => handleLikePost(activePost.id)}
                className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-all ${
                  activePost.likes.includes(profile.id)
                    ? "bg-red-50 text-red-500"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                {activePost.likes.includes(profile.id) ? "Liked" : "Like Post"}
              </button>
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto no-scrollbar max-h-48 space-y-2.5 pb-2">
              <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider mb-1.5 border-b border-slate-50 pb-1">
                Comments ({activePost.comments.length})
              </p>
              {activePost.comments.length === 0 && (
                <p className="text-xs text-[#9CA3AF] text-center py-4">No comments yet</p>
              )}
              {activePost.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5 text-xs text-[#374151] bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-slate-200 font-extrabold text-[10px] flex items-center justify-center flex-shrink-0">
                    {c.authorUsername[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-extrabold mr-1 text-[#111827]">@{c.authorUsername}</span>
                    <span className="text-[#4B5563] break-words">{c.text}</span>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => handleAddComment(e, activePost.id)}
              className="flex gap-2 items-center border-t border-slate-100 pt-3"
            >
              <label htmlFor="new-comment-input" className="sr-only">Add comment</label>
              <input
                id="new-comment-input"
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-[#F3F4F6] border border-transparent rounded-xl px-4 py-2.5 text-xs placeholder-[#9CA3AF] text-[#111827] outline-none focus:bg-white focus:border-[#7C3AED]/20 transition-all"
                required
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-violet-200"
              >
                Post
              </button>
            </form>

          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
