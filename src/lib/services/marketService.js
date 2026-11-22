import { AP_MARKETS } from '../data/markets';

// Haversine formula to compute distance between two lat/lon coordinates in kilometers
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) {
    return null;
  }
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

// Get markets sorted by distance from farm location
export function getMarketsWithDistance(farmLat, farmLon) {
  return AP_MARKETS.map((market) => {
    const dist = market.coordinatesVerified === true
      ? calculateHaversineDistanceKm(farmLat, farmLon, market.lat, market.lon)
      : null;
    return {
      ...market,
      distanceKm: dist,
      isCalculated: dist != null,
    };
  }).sort((a, b) => {
    if (a.distanceKm == null) return 1;
    if (b.distanceKm == null) return -1;
    return a.distanceKm - b.distanceKm;
  });
}
