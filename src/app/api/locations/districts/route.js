import { NextResponse } from 'next/server';
import { ANDHRA_PRADESH_DISTRICTS } from '@/lib/data/andhraPradesh';

export async function GET() {
  const districts = ANDHRA_PRADESH_DISTRICTS.map((d) => ({
    id: d.id,
    name: d.name,
    nameTe: d.nameTe,
    latitude: d.latitude,
    longitude: d.longitude,
    dominantSoil: d.dominantSoil,
    soilDescTe: d.soilDescTe,
    soilDescEn: d.soilDescEn,
    commonCrops: d.commonCrops,
    commonCropsTe: d.commonCropsTe,
  }));

  return NextResponse.json({
    state: 'Andhra Pradesh',
    totalDistricts: districts.length,
    districts,
  });
}
