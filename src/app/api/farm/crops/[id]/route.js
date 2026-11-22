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

export async function PUT(request, { params }) {
  const { supabase, response } = await requireSupabaseUser();
  if (response) return response;

  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body) || !Object.keys(body).length) {
    return NextResponse.json({ error: 'Crop updates must be a non-empty JSON object.' }, { status: 400 });
  }

  const updates = {};
  if (body.cropName !== undefined) {
    if (typeof body.cropName !== 'string' || !body.cropName.trim() || body.cropName.trim().length > 120) {
      return NextResponse.json({ error: 'Crop name must contain 1 to 120 characters.' }, { status: 400 });
    }
    updates.crop_name = body.cropName.trim();
  }
  if (body.sowingDate !== undefined) {
    if (!isValidDate(body.sowingDate)) {
      return NextResponse.json({ error: 'Sowing date must be a valid YYYY-MM-DD date.' }, { status: 400 });
    }
    updates.sowing_date = body.sowingDate;
  }
  if (body.growthStage !== undefined) {
    if (!GROWTH_STAGES.has(body.growthStage)) {
      return NextResponse.json({ error: 'Unsupported crop growth stage.' }, { status: 400 });
    }
    updates.growth_stage = body.growthStage;
  }
  if (body.healthStatus !== undefined) {
    if (typeof body.healthStatus !== 'string' || body.healthStatus.length > 40) {
      return NextResponse.json({ error: 'Crop health status must be 40 characters or fewer.' }, { status: 400 });
    }
    updates.health_status = body.healthStatus;
  }
  if (body.notes !== undefined) {
    if (typeof body.notes !== 'string' || body.notes.length > 2000) {
      return NextResponse.json({ error: 'Crop notes must be 2000 characters or fewer.' }, { status: 400 });
    }
    updates.notes = body.notes.trim();
  }
  if (body.location !== undefined) {
    if (!body.location || typeof body.location !== 'object' || Array.isArray(body.location)) {
      return NextResponse.json({ error: 'Crop location must be a JSON object.' }, { status: 400 });
    }
    updates.location = body.location;
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('farm_crops')
    .update(updates)
    .eq('client_id', id)
    .select('*')
    .maybeSingle();
  if (error) return databaseUnavailableResponse(error, 'crop update');
  if (!data) return NextResponse.json({ error: 'Crop not found.' }, { status: 404 });
  return NextResponse.json({ crop: mapCrop(data) });
}

export async function DELETE(_request, { params }) {
  const { supabase, response } = await requireSupabaseUser();
  if (response) return response;

  const { id } = await params;
  const { data, error } = await supabase
    .from('farm_crops')
    .delete()
    .eq('client_id', id)
    .select('client_id')
    .maybeSingle();
  if (error) return databaseUnavailableResponse(error, 'crop delete');
  if (!data) return NextResponse.json({ error: 'Crop not found.' }, { status: 404 });
  return NextResponse.json({ success: true, deletedId: id });
}
