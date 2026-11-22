import { NextResponse } from 'next/server';
import { AP_MARKETS, DAILY_MARKET_PRICES, OFFICIAL_MSP_RATES, PRICE_TREND_DATA } from '../../../lib/data/markets';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');
  const crop = searchParams.get('crop');

  let markets = AP_MARKETS;
  let prices = DAILY_MARKET_PRICES;

  if (district) {
    markets = markets.filter((m) => m.district.toLowerCase() === district.toLowerCase());
  }

  if (crop) {
    prices = prices.filter((p) => p.cropName.toLowerCase().includes(crop.toLowerCase()));
  }

  return NextResponse.json({
    markets,
    demoPrices: prices,
    demoPriceStatus: 'demo',
    mspRates: OFFICIAL_MSP_RATES,
    priceTrends: PRICE_TREND_DATA,
    priceTrendStatus: 'demo',
    source: 'AP Department of Agricultural Marketing & CACP India',
    dataStatus: 'directory',
  });
}
