import { NextResponse } from 'next/server';
import { marketService } from '@/services/markets/marketService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { quantity, pricePerQuintal, transportPerQuintal, otherDeductions = 0 } = body;

    const estimate = marketService.calculateEstimate({
      quantity: Number(quantity),
      pricePerQuintal: Number(pricePerQuintal),
      transportPerQuintal: Number(transportPerQuintal),
      otherDeductions: Number(otherDeductions),
    });

    return NextResponse.json({ estimate });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
