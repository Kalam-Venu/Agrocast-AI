import { NextResponse } from 'next/server';
import { weatherService } from '@/services/weather/weatherService';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district') || 'Guntur';

  const history = await weatherService.getHistoricalRainfall(district);
  return NextResponse.json({
    rainfallIntelligence: history,
    source: 'IMD Historical 30-Year Rainfall Normal Database',
    updatedAt: new Date().toISOString(),
  });
}
