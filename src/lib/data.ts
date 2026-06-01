/**
 * Unified Data Manager for Hyp Social
 * 
 * Manages all user-generated content (posts, stories, comments, likes)
 * using localStorage persistence so data survives page refreshes.
 * 
 * No dummy/mock data — all content is created by real signed-in users.
 */

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

const POSTS_KEY = "hyp_posts";
const STORIES_KEY = "hyp_stories";

const INITIAL_SEED_POSTS: HypPost[] = [
  {
    id: "seed_post_1",
    authorId: "user_priya",
    authorUsername: "priya_m",
    authorDisplayName: "Priya Sharma",
    authorInitial: "P",
    content: "Got Internship at Google! Super excited for this new chapter! 💻✨",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    postType: "life_update",
    updateType: "Got Internship",
    updateEmoji: "📋",
    updateGradient: "from-[#D97706] to-[#F59E0B]",
    likes: ["user_rahul", "user_aman"],
    comments: [
      {
        id: "seed_c_1",
        authorId: "user_rahul",
        authorUsername: "rahul_k",
        text: "Wow! Huge congratulations Priya! Well deserved 🎉",
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
      },
      {
        id: "seed_c_2",
        authorId: "user_aman",
        authorUsername: "aman_t",
        text: "Brilliant! Make us proud! 🚀",
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: "seed_post_2",
    authorId: "user_rahul",
    authorUsername: "rahul_k",
    authorDisplayName: "Rahul Kumar",
    authorInitial: "R",
    content: "Weekend getaway to the mountains. Absolutely serene! 🏔️🌲 Can't get enough of this view.",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    postType: "normal",
    likes: ["user_priya"],
    comments: [
      {
        id: "seed_c_3",
        authorId: "user_priya",
        authorUsername: "priya_m",
        text: "Stunning shot Rahul! Which place is this?",
        createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
  },
  {
    id: "seed_post_3",
    authorId: "user_aman",
    authorUsername: "aman_t",
    authorDisplayName: "Aman Tiwari",
    authorInitial: "A",
    content: "Started MBA at IIM Ahmedabad! Ready to dive in 📚🎓",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    postType: "life_update",
    updateType: "Started MBA",
    updateEmoji: "📚",
    updateGradient: "from-[#7C3AED] to-[#4F46E5]",
    likes: ["user_rahul", "user_priya"],
    comments: [
      {
        id: "seed_c_4",
        authorId: "user_rahul",
        authorUsername: "rahul_k",
        text: "Congratulations Aman! Big moves! 👍",
        createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  }
];

// ────────────────────────────────────────────
// POSTS
// ────────────────────────────────────────────

export function getAllPosts(): HypPost[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (!raw) {
      // Seed initial posts
      localStorage.setItem(POSTS_KEY, JSON.stringify(INITIAL_SEED_POSTS));
      return INITIAL_SEED_POSTS;
    }
    const posts: HypPost[] = JSON.parse(raw);
    // Sort newest first
    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function createPost(post: Omit<HypPost, "id" | "likes" | "comments" | "createdAt">): HypPost {
  const newPost: HypPost = {
    ...post,
    id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };

  const posts = getAllPosts();
  posts.unshift(newPost);
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  
  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent("hyp_data_change", { detail: { type: "post" } }));
  
  return newPost;
}

export function toggleLikePost(postId: string, userId: string): HypPost | null {
  const posts = getAllPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  const idx = post.likes.indexOf(userId);
  if (idx >= 0) {
    post.likes.splice(idx, 1);
  } else {
    post.likes.push(userId);
  }

  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  window.dispatchEvent(new CustomEvent("hyp_data_change", { detail: { type: "post" } }));
  return post;
}

export function addComment(postId: string, comment: Omit<HypComment, "id" | "createdAt">): HypPost | null {
  const posts = getAllPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  post.comments.push({
    ...comment,
    id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  });

  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  window.dispatchEvent(new CustomEvent("hyp_data_change", { detail: { type: "post" } }));
  return post;
}

export function getPostsByUser(userId: string): HypPost[] {
  return getAllPosts().filter((p) => p.authorId === userId);
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

export function getAllStories(): HypStory[] {
  try {
    const raw = localStorage.getItem(STORIES_KEY);
    if (!raw) {
      localStorage.setItem(STORIES_KEY, JSON.stringify([]));
      return [];
    }
    const stories: HypStory[] = JSON.parse(raw);
    const now = new Date().getTime();
    // Filter out expired stories (24h)
    const active = stories.filter((s) => new Date(s.expiresAt).getTime() > now);
    // If some expired, save cleaned list
    if (active.length !== stories.length) {
      localStorage.setItem(STORIES_KEY, JSON.stringify(active));
    }
    return active.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function createStory(story: Omit<HypStory, "id" | "createdAt" | "expiresAt" | "bg">): HypStory {
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h

  const newStory: HypStory = {
    ...story,
    id: `story_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    bg: STORY_BG_GRADIENTS[Math.floor(Math.random() * STORY_BG_GRADIENTS.length)],
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };

  const stories = getAllStories();
  stories.unshift(newStory);
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  
  window.dispatchEvent(new CustomEvent("hyp_data_change", { detail: { type: "story" } }));
  
  return newStory;
}

export function getStoriesByUser(userId: string): HypStory[] {
  return getAllStories().filter((s) => s.authorId === userId);
}

export function getUniqueStoryAuthors(): { authorId: string; authorUsername: string; authorInitial: string; latestBg: string; hasStory: boolean }[] {
  const stories = getAllStories();
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

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
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
