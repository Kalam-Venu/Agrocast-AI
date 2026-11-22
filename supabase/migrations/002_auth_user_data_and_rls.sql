BEGIN;

ALTER TABLE public.profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_id_auth_users_fkey'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_id_auth_users_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
  END IF;
END
$$;

ALTER TABLE public.farm_profiles
  ADD COLUMN IF NOT EXISTS state TEXT NOT NULL DEFAULT 'Andhra Pradesh',
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS mandal TEXT,
  ADD COLUMN IF NOT EXISTS village TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(9, 6),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(9, 6),
  ADD COLUMN IF NOT EXISTS coordinates_approximate BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'farm_profiles_latitude_range_check'
      AND conrelid = 'public.farm_profiles'::regclass
  ) THEN
    ALTER TABLE public.farm_profiles
      ADD CONSTRAINT farm_profiles_latitude_range_check
      CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'farm_profiles_longitude_range_check'
      AND conrelid = 'public.farm_profiles'::regclass
  ) THEN
    ALTER TABLE public.farm_profiles
      ADD CONSTRAINT farm_profiles_longitude_range_check
      CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'farm_profiles_user_auth_fkey'
      AND conrelid = 'public.farm_profiles'::regclass
  ) THEN
    ALTER TABLE public.farm_profiles
      ADD CONSTRAINT farm_profiles_user_auth_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS farm_profiles_one_per_user_idx
  ON public.farm_profiles(user_id)
  WHERE user_id IS NOT NULL;

ALTER TABLE public.farm_crops
  ADD COLUMN IF NOT EXISTS client_id TEXT,
  ADD COLUMN IF NOT EXISTS location JSONB NOT NULL DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS health_status TEXT;

UPDATE public.farm_crops
SET client_id = id::TEXT
WHERE client_id IS NULL;

ALTER TABLE public.farm_crops
  ALTER COLUMN client_id SET DEFAULT gen_random_uuid()::TEXT,
  ALTER COLUMN client_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS farm_crops_farm_client_id_idx
  ON public.farm_crops(farm_profile_id, client_id);

CREATE TABLE IF NOT EXISTS public.custom_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  name TEXT NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 120),
  settlement_type TEXT NOT NULL DEFAULT 'village'
    CHECK (settlement_type IN ('village', 'thanda', 'hamlet', 'other')),
  state TEXT NOT NULL DEFAULT 'Andhra Pradesh',
  district TEXT NOT NULL,
  mandal TEXT NOT NULL,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  coordinates_approximate BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  UNIQUE (user_id, client_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS custom_settlements_parent_name_idx
  ON public.custom_settlements (
    user_id,
    lower(state),
    lower(district),
    lower(mandal),
    lower(name)
  );

CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_language VARCHAR(5) NOT NULL DEFAULT 'te'
    CHECK (preferred_language IN ('te', 'en')),
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  preferences JSONB NOT NULL DEFAULT '{}'::JSONB
    CHECK (jsonb_typeof(preferences) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 180),
  body TEXT NOT NULL CHECK (length(btrim(body)) BETWEEN 1 AND 10000),
  crop TEXT,
  district TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL CHECK (length(btrim(body)) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.review_comments
  ADD COLUMN IF NOT EXISTS user_id UUID;

ALTER TABLE public.content_reports
  ADD COLUMN IF NOT EXISTS user_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'review_comments_user_auth_fkey'
      AND conrelid = 'public.review_comments'::regclass
  ) THEN
    ALTER TABLE public.review_comments
      ADD CONSTRAINT review_comments_user_auth_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'review_votes_user_auth_fkey'
      AND conrelid = 'public.review_votes'::regclass
  ) THEN
    ALTER TABLE public.review_votes
      ADD CONSTRAINT review_votes_user_auth_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'content_reports_user_auth_fkey'
      AND conrelid = 'public.content_reports'::regclass
  ) THEN
    ALTER TABLE public.content_reports
      ADD CONSTRAINT content_reports_user_auth_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS farm_profiles_user_id_idx ON public.farm_profiles(user_id);
CREATE INDEX IF NOT EXISTS farm_crops_farm_profile_id_idx ON public.farm_crops(farm_profile_id);
CREATE INDEX IF NOT EXISTS custom_settlements_user_parent_idx
  ON public.custom_settlements(user_id, district, mandal);
CREATE INDEX IF NOT EXISTS community_posts_public_created_idx
  ON public.community_posts(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS community_posts_user_created_idx
  ON public.community_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS community_comments_post_created_idx
  ON public.community_comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS pesticide_reviews_public_created_idx
  ON public.pesticide_reviews(moderation_status, created_at DESC);
CREATE INDEX IF NOT EXISTS review_comments_review_created_idx
  ON public.review_comments(review_id, created_at);
CREATE INDEX IF NOT EXISTS content_reports_user_created_idx
  ON public.content_reports(user_id, created_at DESC);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesticide_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = (SELECT auth.uid()));
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone, preferred_language, notifications_enabled, avatar_url, updated_at)
  ON public.profiles TO authenticated;

DROP POLICY IF EXISTS farm_profiles_select_own ON public.farm_profiles;
CREATE POLICY farm_profiles_select_own ON public.farm_profiles
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS farm_profiles_insert_own ON public.farm_profiles;
CREATE POLICY farm_profiles_insert_own ON public.farm_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS farm_profiles_update_own ON public.farm_profiles;
CREATE POLICY farm_profiles_update_own ON public.farm_profiles
  FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS farm_profiles_delete_own ON public.farm_profiles;
CREATE POLICY farm_profiles_delete_own ON public.farm_profiles
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS farm_crops_select_own ON public.farm_crops;
CREATE POLICY farm_crops_select_own ON public.farm_crops
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.farm_profiles farm
      WHERE farm.id = farm_profile_id AND farm.user_id = (SELECT auth.uid())
    )
  );
DROP POLICY IF EXISTS farm_crops_insert_own ON public.farm_crops;
CREATE POLICY farm_crops_insert_own ON public.farm_crops
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.farm_profiles farm
      WHERE farm.id = farm_profile_id AND farm.user_id = (SELECT auth.uid())
    )
  );
DROP POLICY IF EXISTS farm_crops_update_own ON public.farm_crops;
CREATE POLICY farm_crops_update_own ON public.farm_crops
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.farm_profiles farm
      WHERE farm.id = farm_profile_id AND farm.user_id = (SELECT auth.uid())
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.farm_profiles farm
      WHERE farm.id = farm_profile_id AND farm.user_id = (SELECT auth.uid())
    )
  );
DROP POLICY IF EXISTS farm_crops_delete_own ON public.farm_crops;
CREATE POLICY farm_crops_delete_own ON public.farm_crops
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.farm_profiles farm
      WHERE farm.id = farm_profile_id AND farm.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS custom_settlements_owner_all ON public.custom_settlements;
CREATE POLICY custom_settlements_owner_all ON public.custom_settlements
  FOR ALL TO authenticated USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS user_preferences_owner_all ON public.user_preferences;
CREATE POLICY user_preferences_owner_all ON public.user_preferences
  FOR ALL TO authenticated USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS community_posts_read_visible ON public.community_posts;
CREATE POLICY community_posts_read_visible ON public.community_posts
  FOR SELECT USING (visibility = 'public' OR user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS community_posts_insert_own ON public.community_posts;
CREATE POLICY community_posts_insert_own ON public.community_posts
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS community_posts_update_own ON public.community_posts;
CREATE POLICY community_posts_update_own ON public.community_posts
  FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS community_posts_delete_own ON public.community_posts;
CREATE POLICY community_posts_delete_own ON public.community_posts
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS community_comments_read_visible ON public.community_comments;
CREATE POLICY community_comments_read_visible ON public.community_comments
  FOR SELECT USING (
    user_id = (SELECT auth.uid()) OR EXISTS (
      SELECT 1 FROM public.community_posts post
      WHERE post.id = post_id AND post.visibility = 'public'
    )
  );
DROP POLICY IF EXISTS community_comments_insert_own ON public.community_comments;
CREATE POLICY community_comments_insert_own ON public.community_comments
  FOR INSERT TO authenticated WITH CHECK (
    user_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM public.community_posts post
      WHERE post.id = post_id AND post.visibility = 'public'
    )
  );
DROP POLICY IF EXISTS community_comments_update_own ON public.community_comments;
CREATE POLICY community_comments_update_own ON public.community_comments
  FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid()))
  WITH CHECK (
    user_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM public.community_posts post
      WHERE post.id = post_id AND post.visibility = 'public'
    )
  );
DROP POLICY IF EXISTS community_comments_delete_own ON public.community_comments;
CREATE POLICY community_comments_delete_own ON public.community_comments
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS conversations_owner_all ON public.conversations;
CREATE POLICY conversations_owner_all ON public.conversations
  FOR ALL TO authenticated USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS conversation_messages_owner_all ON public.conversation_messages;
CREATE POLICY conversation_messages_owner_all ON public.conversation_messages
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.conversations conversation
      WHERE conversation.id = conversation_id AND conversation.user_id = (SELECT auth.uid())
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations conversation
      WHERE conversation.id = conversation_id AND conversation.user_id = (SELECT auth.uid())
    )
  );
DROP POLICY IF EXISTS notifications_owner_all ON public.notifications;
CREATE POLICY notifications_owner_all ON public.notifications
  FOR ALL TO authenticated USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS pesticide_reviews_read_visible ON public.pesticide_reviews;
CREATE POLICY pesticide_reviews_read_visible ON public.pesticide_reviews
  FOR SELECT USING (
    moderation_status = 'approved' OR user_id = (SELECT auth.uid())
  );
DROP POLICY IF EXISTS pesticide_reviews_insert_own ON public.pesticide_reviews;
CREATE POLICY pesticide_reviews_insert_own ON public.pesticide_reviews
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS pesticide_reviews_delete_own ON public.pesticide_reviews;
CREATE POLICY pesticide_reviews_delete_own ON public.pesticide_reviews
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));
REVOKE UPDATE ON public.pesticide_reviews FROM authenticated;

DROP POLICY IF EXISTS review_comments_read_visible ON public.review_comments;
CREATE POLICY review_comments_read_visible ON public.review_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pesticide_reviews review
      WHERE review.id = review_id
        AND (review.moderation_status = 'approved' OR review.user_id = (SELECT auth.uid()))
    )
  );
DROP POLICY IF EXISTS review_comments_insert_own ON public.review_comments;
CREATE POLICY review_comments_insert_own ON public.review_comments
  FOR INSERT TO authenticated WITH CHECK (
    user_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM public.pesticide_reviews review
      WHERE review.id = review_id
        AND (review.moderation_status = 'approved' OR review.user_id = (SELECT auth.uid()))
    )
  );
DROP POLICY IF EXISTS review_comments_delete_own ON public.review_comments;
CREATE POLICY review_comments_delete_own ON public.review_comments
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));
REVOKE UPDATE ON public.review_comments FROM authenticated;

DROP POLICY IF EXISTS review_votes_read_visible ON public.review_votes;
DROP POLICY IF EXISTS review_votes_insert_own ON public.review_votes;
CREATE POLICY review_votes_insert_own ON public.review_votes
  FOR INSERT TO authenticated WITH CHECK (
    user_id = (SELECT auth.uid()) AND EXISTS (
      SELECT 1 FROM public.pesticide_reviews review
      WHERE review.id = review_id AND review.moderation_status = 'approved'
    )
  );
DROP POLICY IF EXISTS review_votes_delete_own ON public.review_votes;
CREATE POLICY review_votes_delete_own ON public.review_votes
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));
REVOKE ALL ON public.review_votes FROM anon, authenticated;

DROP POLICY IF EXISTS content_reports_insert_own ON public.content_reports;
CREATE POLICY content_reports_insert_own ON public.content_reports
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS content_reports_read_own ON public.content_reports;
CREATE POLICY content_reports_read_own ON public.content_reports
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
REVOKE UPDATE, DELETE ON public.content_reports FROM authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.farm_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.farm_crops TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_settlements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.pesticide_reviews TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.review_comments TO authenticated;
GRANT SELECT, INSERT ON public.content_reports TO authenticated;
GRANT SELECT ON public.community_posts, public.community_comments,
  public.pesticide_reviews, public.review_comments
  TO anon;
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone, preferred_language, notifications_enabled, avatar_url, updated_at)
  ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_name TEXT;
BEGIN
  profile_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'Farmer'
  );

  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id, profile_name, COALESCE(NEW.email, ''), NEW.phone)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_agrocast ON auth.users;
CREATE TRIGGER on_auth_user_created_agrocast
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

INSERT INTO public.profiles (id, full_name, email, phone)
SELECT
  id,
  COALESCE(
    NULLIF(raw_user_meta_data ->> 'full_name', ''),
    NULLIF(raw_user_meta_data ->> 'name', ''),
    NULLIF(split_part(COALESCE(email, ''), '@', 1), ''),
    'Farmer'
  ),
  COALESCE(email, ''),
  phone
FROM auth.users
ON CONFLICT DO NOTHING;

INSERT INTO public.user_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.set_authenticated_author()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  current_name TEXT;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.user_id := OLD.user_id;
    IF TG_TABLE_NAME IN ('pesticide_reviews', 'review_comments') THEN
      NEW.farmer_name := OLD.farmer_name;
    ELSE
      NEW.author_name := OLD.author_name;
    END IF;
    RETURN NEW;
  END IF;

  SELECT full_name INTO current_name
  FROM public.profiles
  WHERE id = current_user_id;

  IF TG_TABLE_NAME = 'pesticide_reviews' THEN
    NEW.user_id := current_user_id;
    NEW.farmer_name := COALESCE(current_name, 'Farmer');
  ELSIF TG_TABLE_NAME = 'review_comments' THEN
    NEW.user_id := current_user_id;
    NEW.farmer_name := COALESCE(current_name, 'Farmer');
  ELSIF TG_TABLE_NAME = 'community_posts' THEN
    NEW.user_id := current_user_id;
    NEW.author_name := COALESCE(current_name, 'Farmer');
  ELSIF TG_TABLE_NAME = 'community_comments' THEN
    NEW.user_id := current_user_id;
    NEW.author_name := COALESCE(current_name, 'Farmer');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pesticide_reviews_set_author ON public.pesticide_reviews;
CREATE TRIGGER pesticide_reviews_set_author
  BEFORE INSERT OR UPDATE ON public.pesticide_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_authenticated_author();
DROP TRIGGER IF EXISTS review_comments_set_author ON public.review_comments;
CREATE TRIGGER review_comments_set_author
  BEFORE INSERT OR UPDATE ON public.review_comments
  FOR EACH ROW EXECUTE FUNCTION public.set_authenticated_author();
DROP TRIGGER IF EXISTS community_posts_set_author ON public.community_posts;
CREATE TRIGGER community_posts_set_author
  BEFORE INSERT OR UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_authenticated_author();
DROP TRIGGER IF EXISTS community_comments_set_author ON public.community_comments;
CREATE TRIGGER community_comments_set_author
  BEFORE INSERT OR UPDATE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.set_authenticated_author();

COMMIT;
