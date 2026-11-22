import { NextResponse } from 'next/server';
import { AP_WEATHER_ALERTS } from '../../../../lib/data/weatherAlerts';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');

  let alerts = AP_WEATHER_ALERTS;
  if (district) {
    alerts = alerts.filter(
      (a) =>
        a.affectedLocations.includes('All') ||
        a.affectedLocations.some((loc) => loc.toLowerCase() === district.toLowerCase())
    );
  }

  return NextResponse.json({
    alerts,
    count: alerts.length,
    timestamp: new Date().toISOString(),
  });
}
