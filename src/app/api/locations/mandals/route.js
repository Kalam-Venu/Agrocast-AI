import { NextResponse } from 'next/server';
import { ANDHRA_PRADESH_DISTRICTS, getMandalsByDistrict } from '@/lib/data/andhraPradesh';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const districtName = searchParams.get('district');

  if (!districtName) {
    return NextResponse.json({ error: 'district parameter is required' }, { status: 400 });
  }

  const dObj = ANDHRA_PRADESH_DISTRICTS.find(
    (d) => d.name.toLowerCase() === districtName.toLowerCase() || d.id === districtName.toLowerCase()
  );

  if (!dObj) {
    return NextResponse.json({ error: 'District not found in Andhra Pradesh' }, { status: 404 });
  }

  const mandals = (dObj.mandals || []).map((m) => ({
    id: m.id,
    name: m.name,
    nameTe: m.nameTe,
    lgdCode: m.lgdCode,
    latitude: m.lat ?? m.latitude,
    longitude: m.lon ?? m.longitude,
    lat: m.lat ?? m.latitude,
    lon: m.lon ?? m.longitude,
    approximateCoords: m.approximateCoords ?? true,
    villageCount: m.villages ? m.villages.length : 0,
  }));

  return NextResponse.json({
    district: dObj.name,
    districtTe: dObj.nameTe,
    lgdCode: dObj.lgdCode,
    totalMandals: mandals.length,
    mandals,
  });
}
