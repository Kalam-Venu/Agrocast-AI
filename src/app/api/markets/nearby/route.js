import { NextResponse } from 'next/server';
import { marketService } from '@/services/markets/marketService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = Number(searchParams.get('lat'));
    const lon = Number(searchParams.get('lon'));
    const limit = Number(searchParams.get('limit') || '5');
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) {
      return NextResponse.json({ error: 'Valid farm latitude and longitude are required' }, { status: 400 });
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      return NextResponse.json({ error: 'limit must be an integer between 1 and 50' }, { status: 400 });
    }

    const nearby = await marketService.getNearbyMarkets(lat, lon, limit);
    return NextResponse.json({
      nearbyMarkets: nearby,
      userCoordinates: { lat, lon },
      source: 'AP Marketing Directorate Mandi Directory',
      dataStatus: nearby.length ? 'directory' : 'unavailable',
      unavailable: nearby.length === 0,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
