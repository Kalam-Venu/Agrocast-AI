import { NextResponse } from 'next/server';
import { databaseUnavailableResponse, requireSupabaseUser } from '@/lib/supabase/api';

const GROWTH_STAGES = new Set([
  'germination', 'seedling', 'land_prep', 'sowing', 'vegetative',
  'flowering', 'fruiting', 'maturity', 'harvest', 'harvesting', 'not_sure',
]);

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function mapCrop(crop) {
  return {
    id: crop.client_id,
    cropName: crop.crop_name,
    sowingDate: crop.sowing_date,
    growthStage: crop.growth_stage,
    healthStatus: crop.health_status || 'healthy',
    notes: crop.notes || '',
    location: crop.location || {},
    updatedAt: crop.updated_at,
  };
}

function invalidCrop(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Crop data must be a JSON object.';
  }
  if (
    typeof body.cropName !== 'string' ||
    !body.cropName.trim() ||
    body.cropName.trim().length > 120 ||
    !isValidDate(body.sowingDate) ||
    !GROWTH_STAGES.has(body.growthStage)
  ) {
    return 'Each crop needs a name, valid sowing date, and supported growth stage.';
  }
  if (body.notes !== undefined && (typeof body.notes !== 'string' || body.notes.length > 2000)) {
    return 'Crop notes must be 2000 characters or fewer.';
  }
  if (body.location !== undefined &&
      (!body.location || typeof body.location !== 'object' || Array.isArray(body.location))) {
    return 'Crop location must be a JSON object.';
  }
  return null;
}

export async function GET() {
  const { supabase, user, response } = await requireSupabaseUser();
  if (response) return response;

  const { data: farm, error: farmError } = await supabase
    .from('farm_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (farmError) return databaseUnavailableResponse(farmError, 'crop farm lookup');
  if (!farm) return NextResponse.json({ crops: [] });

  const { data, error } = await supabase
    .from('farm_crops')
    .select('*')
    .eq('farm_profile_id', farm.id)
    .order('created_at');
  if (error) return databaseUnavailableResponse(error, 'crop read');
  return NextResponse.json({ crops: (data || []).map(mapCrop) });
}

export async function POST(request) {
  const { supabase, user, response } = await requireSupabaseUser();
  if (response) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const validationError = invalidCrop(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const { data: farm, error: farmError } = await supabase
    .from('farm_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (farmError) return databaseUnavailableResponse(farmError, 'crop farm lookup');
  if (!farm) {
    return NextResponse.json({ error: 'Create a farm profile before adding crops.' }, { status: 409 });
  }

  const crop = {
    farm_profile_id: farm.id,
    client_id: `crop-${crypto.randomUUID()}`,
    crop_name: body.cropName.trim(),
    sowing_date: body.sowingDate,
    growth_stage: body.growthStage,
    health_status: typeof body.healthStatus === 'string' ? body.healthStatus.slice(0, 40) : 'healthy',
    notes: typeof body.notes === 'string' ? body.notes.trim() : null,
    location: body.location || {},
  };
  const { data, error } = await supabase.from('farm_crops').insert(crop).select('*').single();
  if (error) return databaseUnavailableResponse(error, 'crop create');
  return NextResponse.json({ crop: mapCrop(data) }, { status: 201 });
}
