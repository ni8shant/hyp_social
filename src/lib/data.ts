import { createClient } from "@/lib/supabase/client";

export interface HypPost {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorInitial: string;
  content: string;
  imageUrl?: string;
  mediaType?: "image" | "video";
  postType: "normal" | "life_update";
  updateType?: string;
  updateEmoji?: string;
  updateGradient?: string;
  likes: string[]; // array of user IDs who liked
  comments: HypComment[];
  createdAt: string; // ISO date
}

export interface HypComment {
  id: string;
  authorId: string;
  authorUsername: string;
  text: string;
  createdAt: string;
}

export interface HypStory {
  id: string;
  authorId: string;
  authorUsername: string;
  authorInitial: string;
  text?: string;
  imageUrl?: string;
  mediaType?: "image" | "video";
  bg: string;
  createdAt: string; // ISO date
  expiresAt: string; // 24h expiry
}

// ────────────────────────────────────────────
// POSTS
// ────────────────────────────────────────────

export async function getAllPosts(): Promise<HypPost[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        user_id,
        content,
        media_url,
        post_type,
        update_type,
        visibility,
        created_at,
        profiles (
          username,
          full_name
        ),
        post_likes (
          user_id
        ),
        comments (
          id,
          user_id,
          content,
          created_at,
          profiles (
            username
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || [])
      .filter((p: any) => {
        const idStr = p.id?.toString() || "";
        const uIdStr = p.user_id?.toString() || "";
        return !idStr.startsWith("seed_") && !uIdStr.startsWith("user_");
      })
      .map((p: any) => ({
        id: p.id,
        authorId: p.user_id,
        authorUsername: p.profiles?.username || "user",
        authorDisplayName: p.profiles?.full_name || p.profiles?.username || "User",
        authorInitial: (p.profiles?.full_name || p.profiles?.username || "U")[0].toUpperCase(),
        content: p.content || "",
        imageUrl: p.media_url || undefined,
        postType: p.post_type as "normal" | "life_update",
        updateType: p.update_type || undefined,
        likes: p.post_likes?.map((l: any) => l.user_id) || [],
        comments: (p.comments || [])
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((c: any) => ({
            id: c.id,
            authorId: c.user_id,
            authorUsername: c.profiles?.username || "user",
            text: c.content,
            createdAt: c.created_at,
          })),
        createdAt: p.created_at,
      }));
  } catch (err) {
    console.error("Error in getAllPosts:", err);
    return [];
  }
}

export async function createPost(post: Omit<HypPost, "id" | "likes" | "comments" | "createdAt">): Promise<HypPost | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: post.authorId,
        content: post.content,
        media_url: post.imageUrl || null,
        post_type: post.postType,
        update_type: post.updateType || null,
        visibility: "public"
      })
      .select(`
        id,
        user_id,
        content,
        media_url,
        post_type,
        update_type,
        created_at,
        profiles (
          username,
          full_name
        )
      `)
      .single();

    if (error) throw error;

    const newPost: HypPost = {
      id: data.id,
      authorId: data.user_id,
      authorUsername: data.profiles?.username || "user",
      authorDisplayName: data.profiles?.full_name || data.profiles?.username || "User",
      authorInitial: (data.profiles?.full_name || data.profiles?.username || "U")[0].toUpperCase(),
      content: data.content || "",
      imageUrl: data.media_url || undefined,
      postType: data.post_type as "normal" | "life_update",
      updateType: data.update_type || undefined,
      likes: [],
      comments: [],
      createdAt: data.created_at,
    };

    window.dispatchEvent(new CustomEvent("hyp_data_change", { detail: { type: "post" } }));
    return newPost;
  } catch (err) {
    console.error("Error in createPost:", err);
    return null;
  }
}

export async function toggleLikePost(postId: string, userId: string): Promise<HypPost | null> {
  try {
    const supabase = createClient();
    
    // Check if liked
    const { data: existing } = await supabase
      .from("post_likes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (existing && existing.length > 0) {
      // Unlike
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
    } else {
      // Like
      await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: userId });

      // Create notification
      const { data: postData } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single();

      if (postData && postData.user_id !== userId) {
        await supabase.from("notifications").insert({
          user_id: postData.user_id,
          actor_id: userId,
          type: "like",
          post_id: postId,
        });
      }
    }

    // Return the updated post
    const allPosts = await getAllPosts();
    const updated = allPosts.find((p) => p.id === postId) || null;
    
    window.dispatchEvent(new CustomEvent("hyp_data_change", { detail: { type: "post" } }));
    return updated;
  } catch (err) {
    console.error("Error in toggleLikePost:", err);
    return null;
  }
}

export async function addComment(postId: string, comment: Omit<HypComment, "id" | "createdAt">): Promise<HypPost | null> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: comment.authorId,
        content: comment.text,
      });

    if (error) throw error;

    // Create notification
    const { data: postData } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (postData && postData.user_id !== comment.authorId) {
      await supabase.from("notifications").insert({
        user_id: postData.user_id,
        actor_id: comment.authorId,
        type: "comment",
        post_id: postId,
      });
    }

    // Return the updated post
    const allPosts = await getAllPosts();
    const updated = allPosts.find((p) => p.id === postId) || null;

    window.dispatchEvent(new CustomEvent("hyp_data_change", { detail: { type: "post" } }));
    return updated;
  } catch (err) {
    console.error("Error in addComment:", err);
    return null;
  }
}

export async function getPostsByUser(userId: string): Promise<HypPost[]> {
  const posts = await getAllPosts();
  return posts.filter((p) => p.authorId === userId);
}

// ────────────────────────────────────────────
// STORIES
// ────────────────────────────────────────────

const STORY_BG_GRADIENTS = [
  "from-[#2563EB] to-[#60A5FA]",
  "from-[#EC4899] to-[#F97316]",
  "from-[#7C3AED] to-[#4F46E5]",
  "from-[#059669] to-[#10B981]",
  "from-[#D97706] to-[#F59E0B]",
  "from-[#DC2626] to-[#F43F5E]",
  "from-[#0891B2] to-[#06B6D4]",
];

export async function getAllStories(): Promise<HypStory[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("stories")
      .select(`
        id,
        user_id,
        media_url,
        text_content,
        bg_color,
        created_at,
        expires_at,
        profiles (
          username,
          full_name
        )
      `)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((s: any) => ({
      id: s.id,
      authorId: s.user_id,
      authorUsername: s.profiles?.username || "user",
      authorInitial: (s.profiles?.full_name || s.profiles?.username || "U")[0].toUpperCase(),
      text: s.text_content || undefined,
      imageUrl: s.media_url || undefined,
      bg: s.bg_color || "from-[#2563EB] to-[#60A5FA]",
      createdAt: s.created_at,
      expiresAt: s.expires_at,
    }));
  } catch (err) {
    console.error("Error in getAllStories:", err);
    return [];
  }
}

export async function createStory(story: Omit<HypStory, "id" | "createdAt" | "expiresAt" | "bg">): Promise<HypStory | null> {
  try {
    const supabase = createClient();
    const bg = STORY_BG_GRADIENTS[Math.floor(Math.random() * STORY_BG_GRADIENTS.length)];
    const { data, error } = await supabase
      .from("stories")
      .insert({
        user_id: story.authorId,
        media_url: story.imageUrl || null,
        text_content: story.text || null,
        bg_color: bg,
        visibility: "followers"
      })
      .select(`
        id,
        user_id,
        media_url,
        text_content,
        bg_color,
        created_at,
        expires_at,
        profiles (
          username,
          full_name
        )
      `)
      .single();

    if (error) throw error;

    const newStory: HypStory = {
      id: data.id,
      authorId: data.user_id,
      authorUsername: data.profiles?.username || "user",
      authorInitial: (data.profiles?.full_name || data.profiles?.username || "U")[0].toUpperCase(),
      text: data.text_content || undefined,
      imageUrl: data.media_url || undefined,
      bg: data.bg_color,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
    };

    window.dispatchEvent(new CustomEvent("hyp_data_change", { detail: { type: "story" } }));
    return newStory;
  } catch (err) {
    console.error("Error in createStory:", err);
    return null;
  }
}

export async function getStoriesByUser(userId: string): Promise<HypStory[]> {
  const stories = await getAllStories();
  return stories.filter((s) => s.authorId === userId);
}

export async function getUniqueStoryAuthors(): Promise<{ authorId: string; authorUsername: string; authorInitial: string; latestBg: string; hasStory: boolean }[]> {
  const stories = await getAllStories();
  const authorMap = new Map<string, { authorId: string; authorUsername: string; authorInitial: string; latestBg: string }>();

  for (const s of stories) {
    if (!authorMap.has(s.authorId)) {
      authorMap.set(s.authorId, {
        authorId: s.authorId,
        authorUsername: s.authorUsername,
        authorInitial: s.authorInitial,
        latestBg: s.bg,
      });
    }
  }

  return Array.from(authorMap.values()).map((a) => ({ ...a, hasStory: true }));
}

// ────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────

export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 10) return "just now";
  if (diff < 60) return `${diff} seconds ago`;
  
  const mins = Math.floor(diff / 60);
  if (mins < 60) return mins === 1 ? "1 minute ago" : `${mins} minutes ago`;

  const hours = Math.floor(diff / 3600);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;

  const days = Math.floor(diff / 86400);
  if (days < 30) return days === 1 ? "1 day ago" : `${days} days ago`;

  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

// Predefined life update configs (shared with create page)
export const LIFE_UPDATE_CONFIGS: Record<string, { gradient: string; emoji: string }> = {
  "New Job": { gradient: "from-[#7C3AED] via-purple-600 to-pink-500", emoji: "💼" },
  "Started MBA": { gradient: "from-[#7C3AED] to-[#4F46E5]", emoji: "📚" },
  "Got Internship": { gradient: "from-[#D97706] to-[#F59E0B]", emoji: "📋" },
  "Changed City": { gradient: "from-[#2563EB] via-indigo-600 to-[#818CF8]", emoji: "🏙️" },
  "Birthday": { gradient: "from-[#EC4899] to-[#F97316]", emoji: "🎂" },
  "Wedding": { gradient: "from-[#DB2777] to-[#9333EA]", emoji: "💍" },
  "Graduation": { gradient: "from-[#7C3AED] to-[#4F46E5]", emoji: "🎓" },
  "Achievement": { gradient: "from-[#0891B2] to-[#06B6D4]", emoji: "🏆" },
  "New Home": { gradient: "from-[#065F46] to-[#10B981]", emoji: "🏠" },
};
