import { NextResponse } from 'next/server';
import { pesticideService } from '@/services/pesticides/pesticideService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';

    const results = await pesticideService.getAllPesticides({
      query,
      category,
      verifiedOnly,
    });

    return NextResponse.json({
      results,
      count: results.length,
      source: 'Central Insecticides Board & Registration Committee (CIBRC)',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
