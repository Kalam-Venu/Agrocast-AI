import { NextResponse } from 'next/server';
import { PESTICIDES_DATA } from '../../../lib/data/pesticides';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').toLowerCase().trim();
  const category = searchParams.get('category') || '';
  const verifiedOnly = searchParams.get('verifiedOnly') === 'true';

  let filtered = PESTICIDES_DATA;

  if (verifiedOnly) {
    filtered = filtered.filter((p) => p.isVerified);
  }

  if (category && category !== 'All') {
    filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (query) {
    filtered = filtered.filter((p) => {
      const matchName = p.name.toLowerCase().includes(query);
      const matchBrand = p.brand.toLowerCase().includes(query);
      const matchIngredient = p.activeIngredient.toLowerCase().includes(query);
      const matchCrops = p.approvedCrops.some((c) => c.toLowerCase().includes(query)) ||
        p.approvedCropsTe.some((c) => c.includes(query));
      const matchPests = p.targetPests.some((pest) => pest.toLowerCase().includes(query)) ||
        p.targetPestsTe.some((pest) => pest.includes(query));

      return matchName || matchBrand || matchIngredient || matchCrops || matchPests;
    });
  }

  return NextResponse.json({
    pesticides: filtered,
    total: filtered.length,
    source: 'CIBRC / ANGRAU Registered Directory',
  });
}
