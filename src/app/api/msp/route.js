import { NextResponse } from 'next/server';
import { marketService } from '@/services/markets/marketService';

export async function GET() {
  try {
    const mspRates = await marketService.getMSPRates();
    return NextResponse.json({
      mspRates,
      count: mspRates.length,
      officialSource: 'Commission for Agricultural Costs & Prices (CACP), Ministry of Agriculture & Farmers Welfare, GoI',
      notifiedYear: '2025-26 / 2026',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
