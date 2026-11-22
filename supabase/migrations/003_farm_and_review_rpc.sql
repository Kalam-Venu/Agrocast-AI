BEGIN;

CREATE OR REPLACE FUNCTION public.save_farm_snapshot(
  p_farm_profile JSONB,
  p_crops JSONB,
  p_custom_settlements JSONB,
  p_create_only BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  farm_id UUID;
  farm_location JSONB := COALESCE(p_farm_profile -> 'location', '{}'::JSONB);
  crop_record JSONB;
  settlement_record JSONB;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;
  IF jsonb_typeof(p_farm_profile) IS DISTINCT FROM 'object'
    OR jsonb_typeof(COALESCE(p_crops, '[]'::JSONB)) <> 'array'
    OR jsonb_typeof(COALESCE(p_custom_settlements, '[]'::JSONB)) <> 'array' THEN
    RAISE EXCEPTION 'Invalid farm snapshot';
  END IF;
  IF jsonb_typeof(farm_location) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Invalid farm location';
  END IF;

  SELECT id INTO farm_id
  FROM public.farm_profiles
  WHERE user_id = current_user_id
  LIMIT 1;

  IF p_create_only AND farm_id IS NOT NULL THEN
    RAISE EXCEPTION 'Farm already exists' USING ERRCODE = '23505';
  END IF;

  IF farm_id IS NULL THEN
    INSERT INTO public.farm_profiles (
      user_id, state, district, mandal, village, latitude, longitude,
      coordinates_approximate, soil_type, land_area, irrigation_method
    )
    VALUES (
      current_user_id,
      COALESCE(NULLIF(farm_location ->> 'state', ''), 'Andhra Pradesh'),
      NULLIF(farm_location ->> 'district', ''),
      NULLIF(farm_location ->> 'mandal', ''),
      NULLIF(farm_location ->> 'village', ''),
      NULLIF(farm_location ->> 'latitude', '')::NUMERIC,
      NULLIF(farm_location ->> 'longitude', '')::NUMERIC,
      COALESCE((farm_location ->> 'approximateCoords')::BOOLEAN, FALSE),
      NULLIF(p_farm_profile ->> 'soilType', ''),
      NULLIF(p_farm_profile ->> 'landArea', '')::NUMERIC,
      NULLIF(p_farm_profile ->> 'irrigationMethod', '')
    )
    RETURNING id INTO farm_id;
  ELSE
    IF p_create_only IS FALSE AND NOT EXISTS (
      SELECT 1 FROM public.farm_profiles
      WHERE id = farm_id AND user_id = current_user_id
    ) THEN
      RAISE EXCEPTION 'Farm not found' USING ERRCODE = 'P0002';
    END IF;
    UPDATE public.farm_profiles
    SET state = COALESCE(NULLIF(farm_location ->> 'state', ''), 'Andhra Pradesh'),
        district = NULLIF(farm_location ->> 'district', ''),
        mandal = NULLIF(farm_location ->> 'mandal', ''),
        village = NULLIF(farm_location ->> 'village', ''),
        latitude = NULLIF(farm_location ->> 'latitude', '')::NUMERIC,
        longitude = NULLIF(farm_location ->> 'longitude', '')::NUMERIC,
        coordinates_approximate =
          COALESCE((farm_location ->> 'approximateCoords')::BOOLEAN, FALSE),
        soil_type = NULLIF(p_farm_profile ->> 'soilType', ''),
        land_area = NULLIF(p_farm_profile ->> 'landArea', '')::NUMERIC,
        irrigation_method = NULLIF(p_farm_profile ->> 'irrigationMethod', ''),
        updated_at = NOW()
    WHERE id = farm_id AND user_id = current_user_id;
  END IF;

  DELETE FROM public.farm_crops crop
  WHERE crop.farm_profile_id = farm_id
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(COALESCE(p_crops, '[]'::JSONB)) AS desired(value)
      WHERE desired.value ->> 'id' = crop.client_id
    );

  FOR crop_record IN
    SELECT value FROM jsonb_array_elements(COALESCE(p_crops, '[]'::JSONB))
  LOOP
    IF NULLIF(crop_record ->> 'cropName', '') IS NULL THEN
      RAISE EXCEPTION 'Crop name is required';
    END IF;

    INSERT INTO public.farm_crops (
      farm_profile_id, client_id, crop_name, sowing_date, growth_stage,
      notes, location, health_status
    )
    VALUES (
      farm_id,
      COALESCE(NULLIF(crop_record ->> 'id', ''), gen_random_uuid()::TEXT),
      crop_record ->> 'cropName',
      COALESCE(NULLIF(crop_record ->> 'sowingDate', '')::DATE, CURRENT_DATE),
      COALESCE(NULLIF(crop_record ->> 'growthStage', ''), 'vegetative'),
      NULLIF(crop_record ->> 'notes', ''),
      COALESCE(crop_record -> 'location', '{}'::JSONB),
      NULLIF(crop_record ->> 'healthStatus', '')
    )
    ON CONFLICT (farm_profile_id, client_id) DO UPDATE
    SET crop_name = EXCLUDED.crop_name,
        sowing_date = EXCLUDED.sowing_date,
        growth_stage = EXCLUDED.growth_stage,
        notes = EXCLUDED.notes,
        location = EXCLUDED.location,
        health_status = EXCLUDED.health_status,
        updated_at = NOW();
  END LOOP;

  DELETE FROM public.custom_settlements settlement
  WHERE settlement.user_id = current_user_id
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(COALESCE(p_custom_settlements, '[]'::JSONB)) AS desired(value)
      WHERE desired.value ->> 'id' = settlement.client_id
    );

  FOR settlement_record IN
    SELECT value FROM jsonb_array_elements(COALESCE(p_custom_settlements, '[]'::JSONB))
  LOOP
    IF NULLIF(settlement_record ->> 'name', '') IS NULL
      OR NULLIF(settlement_record ->> 'district', '') IS NULL
      OR NULLIF(settlement_record ->> 'mandal', '') IS NULL THEN
      RAISE EXCEPTION 'Settlement name, district, and mandal are required';
    END IF;

    INSERT INTO public.custom_settlements (
      user_id, client_id, name, settlement_type, state, district, mandal,
      latitude, longitude, coordinates_approximate
    )
    VALUES (
      current_user_id,
      COALESCE(NULLIF(settlement_record ->> 'id', ''), gen_random_uuid()::TEXT),
      settlement_record ->> 'name',
      COALESCE(NULLIF(settlement_record ->> 'type', ''), 'village'),
      COALESCE(NULLIF(settlement_record ->> 'state', ''), 'Andhra Pradesh'),
      settlement_record ->> 'district',
      settlement_record ->> 'mandal',
      NULLIF(settlement_record ->> 'latitude', '')::NUMERIC,
      NULLIF(settlement_record ->> 'longitude', '')::NUMERIC,
      TRUE
    )
    ON CONFLICT (user_id, client_id) DO UPDATE
    SET name = EXCLUDED.name,
        settlement_type = EXCLUDED.settlement_type,
        state = EXCLUDED.state,
        district = EXCLUDED.district,
        mandal = EXCLUDED.mandal,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        coordinates_approximate = TRUE,
        updated_at = NOW();
  END LOOP;

  RETURN farm_id;
END;
$$;

REVOKE ALL ON FUNCTION public.save_farm_snapshot(JSONB, JSONB, JSONB, BOOLEAN)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_farm_snapshot(JSONB, JSONB, JSONB, BOOLEAN)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.update_user_preferences(
  p_preferred_language VARCHAR(5) DEFAULT NULL,
  p_notifications_enabled BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  saved_preferences public.user_preferences%ROWTYPE;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;
  IF p_preferred_language IS NOT NULL AND p_preferred_language NOT IN ('te', 'en') THEN
    RAISE EXCEPTION 'Unsupported language';
  END IF;

  INSERT INTO public.user_preferences (user_id)
  VALUES (current_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.user_preferences
  SET preferred_language = COALESCE(p_preferred_language, preferred_language),
      notifications_enabled = COALESCE(p_notifications_enabled, notifications_enabled),
      updated_at = NOW()
  WHERE user_id = current_user_id
  RETURNING * INTO saved_preferences;

  UPDATE public.profiles
  SET preferred_language = saved_preferences.preferred_language,
      notifications_enabled = saved_preferences.notifications_enabled,
      updated_at = NOW()
  WHERE id = current_user_id;

  RETURN jsonb_build_object(
    'user_id', saved_preferences.user_id,
    'preferred_language', saved_preferences.preferred_language,
    'notifications_enabled', saved_preferences.notifications_enabled,
    'preferences', saved_preferences.preferences,
    'updated_at', saved_preferences.updated_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.update_user_preferences(VARCHAR, BOOLEAN)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_user_preferences(VARCHAR, BOOLEAN)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.vote_review_helpful(p_review_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  vote_total INTEGER;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.pesticide_reviews
    WHERE id = p_review_id AND moderation_status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Review not found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.review_votes (review_id, user_id)
  VALUES (p_review_id, current_user_id)
  ON CONFLICT (review_id, user_id) DO NOTHING;

  SELECT COUNT(*)::INTEGER INTO vote_total
  FROM public.review_votes
  WHERE review_id = p_review_id;

  UPDATE public.pesticide_reviews
  SET helpful_votes = vote_total
  WHERE id = p_review_id;

  RETURN vote_total;
END;
$$;

REVOKE ALL ON FUNCTION public.vote_review_helpful(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vote_review_helpful(UUID) TO authenticated;

COMMIT;
