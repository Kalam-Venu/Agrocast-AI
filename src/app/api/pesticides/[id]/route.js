import { NextResponse } from 'next/server';
import { pesticideService } from '@/services/pesticides/pesticideService';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const pesticide = await pesticideService.getPesticideById(id);
    if (!pesticide) {
      return NextResponse.json({ error: 'Pesticide not found in CIBRC registry' }, { status: 404 });
    }
    return NextResponse.json({ pesticide });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
