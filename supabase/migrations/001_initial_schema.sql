-- ============================================================
-- AgroCast AI — Supabase PostgreSQL Database Schema
-- Dedicated Agricultural Intelligence Platform for Andhra Pradesh
-- ============================================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  preferred_language VARCHAR(5) DEFAULT 'te' CHECK (preferred_language IN ('te', 'en')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LOCATIONS (Andhra Pradesh State Hierarchy)
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL DEFAULT 'Andhra Pradesh',
  district TEXT NOT NULL,
  mandal TEXT NOT NULL,
  village TEXT NOT NULL,
  latitude NUMERIC(9,6) NOT NULL,
  longitude NUMERIC(9,6) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FARM PROFILES
CREATE TABLE IF NOT EXISTS farm_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  soil_type VARCHAR(50) DEFAULT 'black',
  land_area NUMERIC(6,2) DEFAULT 2.0,
  irrigation_method VARCHAR(50) DEFAULT 'canal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FARM CROPS
CREATE TABLE IF NOT EXISTS farm_crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_profile_id UUID REFERENCES farm_profiles(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  sowing_date DATE NOT NULL,
  growth_stage VARCHAR(50) DEFAULT 'vegetative',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REGIONAL AGRICULTURE BASELINE
CREATE TABLE IF NOT EXISTS regional_agriculture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district TEXT NOT NULL,
  soil_information TEXT NOT NULL,
  common_crops TEXT[] NOT NULL,
  agricultural_notes TEXT,
  source TEXT DEFAULT 'ANGRAU & AP Dept of Agriculture',
  verification_status BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AI CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  preferred_language VARCHAR(5) DEFAULT 'te',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('user', 'assistant', 'system')),
  message TEXT NOT NULL,
  language VARCHAR(5) DEFAULT 'te',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. WEATHER ALERTS
CREATE TABLE IF NOT EXISTS weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'moderate',
  title TEXT NOT NULL,
  title_te TEXT NOT NULL,
  description TEXT NOT NULL,
  description_te TEXT NOT NULL,
  affected_locations TEXT[] NOT NULL,
  is_official BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL,
  advisory_text TEXT,
  advisory_text_te TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PESTICIDES & APPROVED USES
CREATE TABLE IF NOT EXISTS pesticides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  active_ingredient TEXT NOT NULL,
  formulation TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  description_te TEXT,
  description_en TEXT,
  dosage TEXT NOT NULL,
  application_method TEXT NOT NULL,
  safety_equipment TEXT[] DEFAULT ARRAY['Gloves', 'Mask'],
  pre_harvest_interval_days INTEGER DEFAULT 14,
  reentry_hours INTEGER DEFAULT 24,
  source TEXT NOT NULL DEFAULT 'CIBRC Registered',
  is_verified BOOLEAN DEFAULT TRUE,
  verified_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pesticide_approved_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pesticide_id UUID REFERENCES pesticides(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  target_pest TEXT NOT NULL,
  approved_dosage TEXT NOT NULL,
  application_method TEXT NOT NULL,
  pre_harvest_interval INTEGER DEFAULT 14,
  safety_information TEXT,
  source TEXT DEFAULT 'CIBRC / ANGRAU',
  is_verified BOOLEAN DEFAULT TRUE
);

-- 9. FARMER REVIEWS, COMMENTS, VOTES & REPORTS
CREATE TABLE IF NOT EXISTS pesticide_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  pesticide_name TEXT NOT NULL,
  farmer_name TEXT NOT NULL,
  crop TEXT NOT NULL,
  target_pest TEXT,
  review_text TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  video_url TEXT,
  location TEXT DEFAULT 'Andhra Pradesh',
  helpful_votes INTEGER DEFAULT 0,
  moderation_status VARCHAR(20) DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES pesticide_reviews(id) ON DELETE CASCADE,
  farmer_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES pesticide_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50) NOT NULL,
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MARKETS, PRICES & MSP
CREATE TABLE IF NOT EXISTS markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_te TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  category_te TEXT NOT NULL,
  district TEXT NOT NULL,
  location TEXT NOT NULL,
  distance_km NUMERIC(6,2),
  contact TEXT,
  accepted_crops TEXT[] NOT NULL,
  is_govt_verified BOOLEAN DEFAULT TRUE,
  source TEXT DEFAULT 'AP Agricultural Marketing Dept',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  crop_name_te TEXT NOT NULL,
  min_price NUMERIC(10,2) NOT NULL,
  max_price NUMERIC(10,2) NOT NULL,
  modal_price NUMERIC(10,2) NOT NULL,
  unit VARCHAR(20) DEFAULT '₹ / Quintal',
  market_date DATE DEFAULT CURRENT_DATE,
  source TEXT DEFAULT 'AGMARKNET Daily Bulletin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS msp_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL,
  crop_name_te TEXT NOT NULL,
  variety TEXT,
  season VARCHAR(20) NOT NULL,
  year VARCHAR(20) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  unit VARCHAR(20) DEFAULT '₹ / Quintal',
  official_source TEXT NOT NULL,
  announcement_date DATE NOT NULL
);

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'weather_alert',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesticide_reviews ENABLE ROW LEVEL SECURITY;

-- Public Reference Data Read Policies
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_agriculture ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesticides ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE msp_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT * FROM (VALUES
      ('locations', 'Public locations read'),
      ('regional_agriculture', 'Public regional agriculture read'),
      ('pesticides', 'Public pesticides read'),
      ('markets', 'Public markets read'),
      ('market_prices', 'Public market prices read'),
      ('msp_rates', 'Public msp rates read'),
      ('weather_alerts', 'Public weather alerts read')
    ) AS expected(tablename, policyname)
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = policy_record.tablename
        AND policyname = policy_record.policyname
        AND (
          cmd <> 'SELECT'
          OR regexp_replace(COALESCE(qual, ''), '[()[:space:]]', '', 'g') <> 'true'
        )
    ) THEN
      RAISE EXCEPTION 'Existing public policy % on % does not match the expected read-only policy.',
        policy_record.policyname, policy_record.tablename;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = policy_record.tablename
        AND policyname = policy_record.policyname
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT USING (true)',
        policy_record.policyname,
        policy_record.tablename
      );
    END IF;
  END LOOP;
END
$$;
