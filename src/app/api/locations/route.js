import { NextResponse } from 'next/server';
import { ANDHRA_PRADESH_DISTRICTS } from '@/lib/data/andhraPradesh';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const districtName = searchParams.get('district');
  const mandalName = searchParams.get('mandal');
  const searchQuery = searchParams.get('q');

  if (!districtName) {
    // Return all districts with baseline data
    const districts = ANDHRA_PRADESH_DISTRICTS.map((d) => ({
      id: d.id,
      name: d.name,
      nameTe: d.nameTe,
      lgdCode: d.lgdCode,
      latitude: d.latitude,
      longitude: d.longitude,
      dominantSoil: d.dominantSoil,
      soilDescTe: d.soilDescTe,
      soilDescEn: d.soilDescEn,
      commonCrops: d.commonCrops,
      commonCropsTe: d.commonCropsTe,
      mandalCount: d.mandals.length,
    }));
    return NextResponse.json({ state: 'Andhra Pradesh', totalDistricts: districts.length, districts });
  }

  const district = ANDHRA_PRADESH_DISTRICTS.find(
    (d) => d.name.toLowerCase() === districtName.toLowerCase() || d.id === districtName.toLowerCase()
  );

  if (!district) {
    return NextResponse.json({ error: 'District not found' }, { status: 404 });
  }

  if (!mandalName) {
    return NextResponse.json({
      district: district.name,
      districtTe: district.nameTe,
      lgdCode: district.lgdCode,
      latitude: district.latitude,
      longitude: district.longitude,
      dominantSoil: district.dominantSoil,
      soilDescTe: district.soilDescTe,
      soilDescEn: district.soilDescEn,
      commonCrops: district.commonCrops,
      commonCropsTe: district.commonCropsTe,
      mandals: district.mandals.map((m) => ({
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
      })),
    });
  }

  const mandal = district.mandals.find(
    (m) => m.name.toLowerCase() === mandalName.toLowerCase() || m.id === mandalName.toLowerCase()
  );

  if (!mandal) {
    return NextResponse.json({ error: 'Mandal not found' }, { status: 404 });
  }

  let villages = mandal.villages || [];
  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    villages = villages.filter(
      (v) => (v.name && v.name.toLowerCase().includes(q)) || (v.nameTe && v.nameTe.includes(q))
    );
  }

  return NextResponse.json({
    district: district.name,
    districtTe: district.nameTe,
    districtLgdCode: district.lgdCode,
    mandal: mandal.name,
    mandalTe: mandal.nameTe,
    mandalLgdCode: mandal.lgdCode,
    mandalLatitude: mandal.lat ?? mandal.latitude,
    mandalLongitude: mandal.lon ?? mandal.longitude,
    latitude: mandal.lat ?? mandal.latitude,
    longitude: mandal.lon ?? mandal.longitude,
    lat: mandal.lat ?? mandal.latitude,
    lon: mandal.lon ?? mandal.longitude,
    approximateCoords: mandal.approximateCoords ?? true,
    totalVillages: villages.length,
    villages: villages.map((v) => {
      const villageLatitude = v.lat ?? v.latitude;
      const villageLongitude = v.lon ?? v.longitude;
      const hasVillageCoordinates = villageLatitude != null && villageLongitude != null;
      const latitude = hasVillageCoordinates ? villageLatitude : mandal.lat ?? mandal.latitude;
      const longitude = hasVillageCoordinates ? villageLongitude : mandal.lon ?? mandal.longitude;
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
