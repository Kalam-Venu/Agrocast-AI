import { NextResponse } from 'next/server';
import { marketService } from '@/services/markets/marketService';

export async function GET() {
  try {
    const trends = await marketService.getPriceTrends();
    return NextResponse.json({
      trends,
      period: 'Past 6 Months (Monthly Modal Averages)',
      source: 'AP Agricultural Marketing Directorate Bulletin',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
