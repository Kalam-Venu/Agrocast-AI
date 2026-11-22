import { NextResponse } from 'next/server';
import { marketService } from '@/services/markets/marketService';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const market = await marketService.getMarketById(id);
    if (!market) {
      return NextResponse.json({ error: 'Market yard not found' }, { status: 404 });
    }
    return NextResponse.json({ market });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
