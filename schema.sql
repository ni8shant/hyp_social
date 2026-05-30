-- Supabase Schema for hyp MVP
-- Run this in your Supabase SQL editor

-- =============================================
-- TABLES
-- =============================================

-- 1. Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  cover_url     TEXT,
  bio           TEXT,
  location      TEXT,
  dob           DATE,
  is_private    BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Posts (normal posts + Life Update Cards)
CREATE TABLE public.posts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content       TEXT,
  media_url     TEXT,
  post_type     TEXT DEFAULT 'normal' CHECK (post_type IN ('normal', 'life_update')),
  update_type   TEXT,         -- e.g. 'New Job', 'Birthday', or custom text
  visibility    TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'close_friends', 'custom')),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Stories (24-hour expiry)
CREATE TABLE public.stories (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  media_url     TEXT,
  text_content  TEXT,
  bg_color      TEXT DEFAULT '#2563EB',
  visibility    TEXT DEFAULT 'followers' CHECK (visibility IN ('everyone', 'followers', 'close_friends', 'custom')),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Follows
CREATE TABLE public.follows (
  follower_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status        TEXT DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted')),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

-- 5. Post Likes
CREATE TABLE public.post_likes (
  post_id       UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

-- 6. Comments
CREATE TABLE public.comments (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id       UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Messages (1-to-1)
CREATE TABLE public.messages (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content       TEXT,
  media_url     TEXT,
  is_read       BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Group Chats (Talkie)
CREATE TABLE public.groups (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT,
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Group Members
CREATE TABLE public.group_members (
  group_id      UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role          TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (group_id, user_id)
);

-- 10. Group Messages
CREATE TABLE public.group_messages (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id      UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  sender_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content       TEXT,
  media_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. Notifications
CREATE TABLE public.notifications (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'follow_request', 'mention', 'story_reaction')),
  post_id       UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  is_read       BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. Life Update type usage counter (for trending)
CREATE TABLE public.life_update_usage (
  update_type   TEXT PRIMARY KEY,
  use_count     BIGINT DEFAULT 1,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications   ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (is_private = false OR auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Posts
CREATE POLICY "Public posts viewable" ON public.posts FOR SELECT
  USING (
    visibility = 'public' OR auth.uid() = user_id
    OR (visibility = 'followers' AND EXISTS (
      SELECT 1 FROM public.follows WHERE follower_id = auth.uid() AND following_id = posts.user_id AND status = 'accepted'
    ))
  );
CREATE POLICY "Own post insert" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own post delete" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Stories (only non-expired)
CREATE POLICY "Stories viewable" ON public.stories FOR SELECT USING (expires_at > NOW() AND auth.uid() IS NOT NULL);
CREATE POLICY "Own story insert" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own story delete" ON public.stories FOR DELETE USING (auth.uid() = user_id);

-- Follows
CREATE POLICY "Follows viewable" ON public.follows FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Own follow insert" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Own follow delete" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Messages (only sender or receiver)
CREATE POLICY "Own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Send message" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications (only recipient can view)
CREATE POLICY "Own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- AUTO PROFILE ON SIGNUP TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, dob, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'full_name',
    NULLIF(new.raw_user_meta_data->>'dob', '')::DATE,
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- UPDATE LIFE UPDATE USAGE (for trending)
-- =============================================

CREATE OR REPLACE FUNCTION public.track_life_update_usage()
RETURNS trigger AS $$
BEGIN
  IF NEW.post_type = 'life_update' AND NEW.update_type IS NOT NULL THEN
    INSERT INTO public.life_update_usage (update_type, use_count)
    VALUES (NEW.update_type, 1)
    ON CONFLICT (update_type) DO UPDATE
    SET use_count = life_update_usage.use_count + 1, updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_created_track_update
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.track_life_update_usage();
