import { NextResponse } from 'next/server';
import { databaseUnavailableResponse, requireSupabaseUser } from '@/lib/supabase/api';
import { ANDHRA_PRADESH_DISTRICTS } from '@/lib/data/andhraPradesh';

const GROWTH_STAGES = new Set([
  'germination', 'seedling', 'land_prep', 'sowing', 'vegetative',
  'flowering', 'fruiting', 'maturity', 'harvest', 'harvesting', 'not_sure',
]);
const SETTLEMENT_TYPES = new Set(['village', 'thanda', 'hamlet', 'other']);

function mapSettlement(settlement) {
  return {
    id: settlement.client_id,
    name: settlement.name,
    type: settlement.settlement_type,
    state: settlement.state,
    district: settlement.district,
    mandal: settlement.mandal,
    latitude: settlement.latitude === null ? null : Number(settlement.latitude),
    longitude: settlement.longitude === null ? null : Number(settlement.longitude),
    approximateCoords: true,
    updatedAt: settlement.updated_at,
  };
}

function mapFarmProfile(farm, crops, settlements, farmerName) {
  const customVillages = settlements.map(mapSettlement);
  const location = {
    state: farm.state || 'Andhra Pradesh',
    district: farm.district || '',
    mandal: farm.mandal || '',
    village: farm.village || '',
    latitude: farm.latitude === null ? null : Number(farm.latitude),
    longitude: farm.longitude === null ? null : Number(farm.longitude),
    approximateCoords: farm.coordinates_approximate === true,
  };
  const customLocation = customVillages.find(
    (settlement) =>
      settlement.name.toLowerCase() === location.village.toLowerCase() &&
      settlement.district.toLowerCase() === location.district.toLowerCase() &&
      settlement.mandal.toLowerCase() === location.mandal.toLowerCase()
  );
  if (customLocation) {
    location.customVillage = true;
    location.customVillageId = customLocation.id;
  }

  return {
    id: farm.id,
    farmerName: farmerName || '',
    location,
    customVillages,
    soilType: farm.soil_type || 'not_sure',
    landArea: farm.land_area === null ? 1 : Number(farm.land_area),
    irrigationMethod: farm.irrigation_method || 'rainfed',
    crops: crops.map((crop) => ({
      id: crop.client_id,
      cropName: crop.crop_name,
      sowingDate: crop.sowing_date,
      growthStage: crop.growth_stage,
      healthStatus: crop.health_status || 'healthy',
      notes: crop.notes || '',
      location: crop.location || {},
    })),
    updatedAt: farm.updated_at,
  };
}

async function readFarm(supabase, userId) {
  const [
    { data: farm, error: farmError },
    { data: profile, error: profileError },
  ] = await Promise.all([
    supabase.from('farm_profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle(),
  ]);
  if (farmError || profileError) return { error: farmError || profileError };
  if (!farm) return { farmProfile: null };

  const [{ data: crops, error: cropsError }, { data: settlements, error: settlementsError }] =
    await Promise.all([
      supabase.from('farm_crops').select('*').eq('farm_profile_id', farm.id).order('created_at'),
      supabase.from('custom_settlements').select('*').eq('user_id', userId).order('created_at'),
    ]);
  if (cropsError || settlementsError) return { error: cropsError || settlementsError };
  return {
    farmProfile: mapFarmProfile(farm, crops || [], settlements || [], profile?.full_name),
  };
}

function parseCoordinate(value, minimum, maximum) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) return undefined;
  return parsed;
}

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function findMandal(districtName, mandalName) {
  const district = ANDHRA_PRADESH_DISTRICTS.find(
    (item) => item.name.toLowerCase() === districtName.trim().toLowerCase()
  );
  if (!district) return null;
  const mandal = district.mandals.find(
    (item) => item.name.toLowerCase() === mandalName.trim().toLowerCase()
  );
  return mandal ? { district, mandal } : null;
}

function validateFarmSnapshot(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Farm profile must be a JSON object.';
  }
  const location = body.location;
  if (
    !location ||
    typeof location !== 'object' ||
    location.state !== 'Andhra Pradesh' ||
    !['district', 'mandal', 'village'].every(
      (field) => typeof location[field] === 'string' && location[field].trim()
    )
  ) {
    return 'Select an Andhra Pradesh district, mandal, and village before saving.';
  }
  const selectedParent = findMandal(location.district, location.mandal);
  if (!selectedParent) return 'The selected mandal does not belong to the selected Andhra Pradesh district.';
  const landArea = Number(body.landArea);
  if (!Number.isFinite(landArea) || landArea < 0.1 || landArea > 9999) {
    return 'Land area must be between 0.1 and 9999 acres.';
  }
  if (!Array.isArray(body.crops) || body.crops.length > 100) {
    return 'Farm crops must be an array containing no more than 100 items.';
  }
  if (!Array.isArray(body.customVillages) || body.customVillages.length > 500) {
    return 'Custom settlements must be an array containing no more than 500 items.';
  }
  const villageName = location.village.trim().toLowerCase();
  const villageIsListed = selectedParent.mandal.villages.some(
    (village) =>
      village.name?.trim().toLowerCase() === villageName ||
      village.nameTe?.trim() === location.village.trim()
  );
  const villageIsCustom = body.customVillages.some(
    (village) =>
      typeof village?.name === 'string' &&
      village.name.trim().toLowerCase() === villageName &&
      typeof village.district === 'string' &&
      village.district.trim().toLowerCase() === location.district.trim().toLowerCase() &&
      typeof village.mandal === 'string' &&
      village.mandal.trim().toLowerCase() === location.mandal.trim().toLowerCase()
  );
  if (!villageIsListed && !villageIsCustom) {
    return 'The selected village must belong to the selected mandal or be saved as a custom settlement.';
  }
  const cropIds = new Set();
  for (const [index, crop] of body.crops.entries()) {
    if (
      !crop ||
      typeof crop.cropName !== 'string' ||
      !crop.cropName.trim() ||
      crop.cropName.length > 120 ||
      !isValidDate(crop.sowingDate) ||
      !GROWTH_STAGES.has(crop.growthStage)
    ) {
      return 'Each crop needs a name, valid sowing date, and supported growth stage.';
    }
    if (crop.cropName.trim().length > 120 || (typeof crop.id === 'string' && crop.id.length > 100)) {
      return 'Crop names must be at most 120 characters and crop IDs at most 100 characters.';
    }
    const cropId = typeof crop.id === 'string' ? crop.id : `crop-${index}`;
    if (cropIds.has(cropId)) return 'Farm crops cannot contain duplicate IDs.';
    cropIds.add(cropId);
  }
  const settlementNames = new Set();
  for (const settlement of body.customVillages) {
    if (
      !settlement ||
      typeof settlement.name !== 'string' ||
      !settlement.name.trim() ||
      settlement.name.trim().length > 120 ||
      typeof settlement.district !== 'string' ||
      !settlement.district.trim() ||
      settlement.district.length > 100 ||
      typeof settlement.mandal !== 'string' ||
      !settlement.mandal.trim() ||
      settlement.mandal.length > 100 ||
      (settlement.state !== undefined && settlement.state !== 'Andhra Pradesh') ||
      !SETTLEMENT_TYPES.has(settlement.type || 'village')
    ) {
      return 'Each custom settlement needs a name, district, mandal, and valid type.';
    }
    if (typeof settlement.id === 'string' && settlement.id.length > 100) {
      return 'Custom settlement IDs must be 100 characters or fewer.';
    }
    const parent = findMandal(settlement.district, settlement.mandal);
    if (!parent) return 'Each custom settlement must use a mandal within its selected district.';
    if (parent.mandal.villages.some(
      (village) =>
        village.name?.trim().toLowerCase() === settlement.name.trim().toLowerCase() ||
        village.nameTe?.trim() === settlement.name.trim()
    )) {
      return 'A listed village cannot also be stored as a custom settlement.';
    }
    const settlementState = typeof settlement.state === 'string' && settlement.state.trim()
      ? settlement.state.trim()
      : 'Andhra Pradesh';
    const key = [
      settlementState.toLowerCase(),
      settlement.district.trim().toLowerCase(),
      settlement.mandal.trim().toLowerCase(),
      settlement.name.trim().toLowerCase(),
    ].join('|');
    if (settlementNames.has(key)) return 'Custom settlements cannot be duplicated within a mandal.';
    settlementNames.add(key);
  }
  const settlementIds = new Set();
  for (const [index, settlement] of body.customVillages.entries()) {
    const settlementId = typeof settlement.id === 'string' ? settlement.id : `settlement-${index}`;
    if (settlementIds.has(settlementId)) {
      return 'Custom settlements cannot contain duplicate IDs.';
    }
    settlementIds.add(settlementId);
  }
  if (
    parseCoordinate(body.location.latitude, -90, 90) === undefined ||
    parseCoordinate(body.location.longitude, -180, 180) === undefined
  ) {
    return 'Farm coordinates must be valid latitude and longitude values.';
  }
  for (const settlement of body.customVillages) {
    if (
      parseCoordinate(settlement.latitude, -90, 90) === undefined ||
      parseCoordinate(settlement.longitude, -180, 180) === undefined
    ) {
      return 'Custom settlement coordinates must be valid latitude and longitude values.';
    }
  }
  return null;
}

function snapshotArguments(body, createOnly) {
  return {
    p_farm_profile: {
      location: {
        state: body.location.state,
        district: body.location.district.trim(),
        mandal: body.location.mandal.trim(),
        village: body.location.village.trim(),
        latitude: parseCoordinate(body.location.latitude, -90, 90),
        longitude: parseCoordinate(body.location.longitude, -180, 180),
        approximateCoords: body.location.approximateCoords === true,
      },
      soilType: typeof body.soilType === 'string' ? body.soilType.slice(0, 50) : 'not_sure',
      landArea: Number(body.landArea),
      irrigationMethod: typeof body.irrigationMethod === 'string' ? body.irrigationMethod.slice(0, 50) : 'rainfed',
    },
    p_crops: body.crops.map((crop, index) => ({
      id: typeof crop.id === 'string' ? crop.id.slice(0, 100) : `crop-${index}`,
      cropName: crop.cropName.trim(),
      sowingDate: crop.sowingDate,
      growthStage: crop.growthStage,
      notes: typeof crop.notes === 'string' ? crop.notes.slice(0, 2000) : '',
      healthStatus: typeof crop.healthStatus === 'string' ? crop.healthStatus.slice(0, 40) : 'healthy',
      location: crop.location && typeof crop.location === 'object' ? crop.location : {},
    })),
    p_custom_settlements: body.customVillages.map((settlement, index) => ({
      id: typeof settlement.id === 'string' ? settlement.id.slice(0, 100) : `settlement-${index}`,
      name: settlement.name.trim().slice(0, 120),
      type: settlement.type || 'village',
      state: typeof settlement.state === 'string' ? settlement.state : 'Andhra Pradesh',
      district: settlement.district.trim().slice(0, 100),
      mandal: settlement.mandal.trim().slice(0, 100),
      latitude: parseCoordinate(settlement.latitude, -90, 90),
      longitude: parseCoordinate(settlement.longitude, -180, 180),
    })),
    p_create_only: createOnly,
  };
}

async function saveFarm(request, createOnly) {
  const { supabase, user, response } = await requireSupabaseUser();
  if (response) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const validationError = validateFarmSnapshot(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const { error } = await supabase.rpc('save_farm_snapshot', snapshotArguments(body, createOnly));
  if (error) {
    if (createOnly && error.code === '23505') {
      const existing = await readFarm(supabase, user.id);
      if (existing.error) return databaseUnavailableResponse(existing.error, 'farm conflict check');
      if (existing.farmProfile) {
        return NextResponse.json(
          { error: 'A cloud farm already exists; local data was not imported.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'The farm snapshot conflicts with existing crop or settlement records.' },
        { status: 409 }
      );
    }
    if (error.code === 'P0002') {
      return NextResponse.json({ error: 'Farm profile not found.' }, { status: 404 });
    }
    return databaseUnavailableResponse(error, 'farm save');
  }

  const saved = await readFarm(supabase, user.id);
  if (saved.error) return databaseUnavailableResponse(saved.error, 'farm refresh');
  return NextResponse.json({ farmProfile: saved.farmProfile });
}

export async function GET() {
  const { supabase, user, response } = await requireSupabaseUser();
  if (response) return response;
  const result = await readFarm(supabase, user.id);
  if (result.error) return databaseUnavailableResponse(result.error, 'farm read');
  return NextResponse.json({ farmProfile: result.farmProfile });
}

export async function POST(request) {
  return saveFarm(request, true);
}

export async function PUT(request) {
  return saveFarm(request, false);
}
