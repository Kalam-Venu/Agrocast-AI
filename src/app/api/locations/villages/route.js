import { NextResponse } from 'next/server';
import { ANDHRA_PRADESH_DISTRICTS } from '@/lib/data/andhraPradesh';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const districtName = searchParams.get('district');
  const mandalName = searchParams.get('mandal');
  const searchQuery = searchParams.get('q');

  if (!districtName || !mandalName) {
    return NextResponse.json({ error: 'Both district and mandal parameters are required' }, { status: 400 });
  }

  const dObj = ANDHRA_PRADESH_DISTRICTS.find(
    (d) => d.name.toLowerCase() === districtName.toLowerCase() || d.id === districtName.toLowerCase()
  );
  if (!dObj) {
    return NextResponse.json({ error: 'District not found' }, { status: 404 });
  }

  const mObj = (dObj.mandals || []).find(
    (m) => m.name.toLowerCase() === mandalName.toLowerCase() || m.id === mandalName.toLowerCase()
  );
  if (!mObj) {
    return NextResponse.json({ error: 'Mandal not found' }, { status: 404 });
  }

  let villages = mObj.villages || [];
  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    villages = villages.filter(
      (v) => (v.name && v.name.toLowerCase().includes(q)) || (v.nameTe && v.nameTe.includes(q))
    );
  }

  return NextResponse.json({
    district: dObj.name,
    districtTe: dObj.nameTe,
    districtLgdCode: dObj.lgdCode,
    mandal: mObj.name,
    mandalTe: mObj.nameTe,
    mandalLgdCode: mObj.lgdCode,
    mandalLatitude: mObj.lat ?? mObj.latitude,
    mandalLongitude: mObj.lon ?? mObj.longitude,
    latitude: mObj.lat ?? mObj.latitude,
    longitude: mObj.lon ?? mObj.longitude,
    lat: mObj.lat ?? mObj.latitude,
    lon: mObj.lon ?? mObj.longitude,
    approximateCoords: mObj.approximateCoords ?? true,
    totalVillages: villages.length,
    villages: villages.map((v) => {
      const villageLatitude = v.lat ?? v.latitude;
      const villageLongitude = v.lon ?? v.longitude;
      const hasVillageCoordinates = villageLatitude != null && villageLongitude != null;
      const latitude = hasVillageCoordinates ? villageLatitude : mObj.lat ?? mObj.latitude;
      const longitude = hasVillageCoordinates ? villageLongitude : mObj.lon ?? mObj.longitude;
      return {
        name: v.name,
        nameTe: v.nameTe,
        lat: latitude,
        lon: longitude,
        latitude,
        longitude,
        approximateCoords: !hasVillageCoordinates || v.approximateCoords !== false,
      };
    }),
  });
}
