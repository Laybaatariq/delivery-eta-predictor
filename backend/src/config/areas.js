export const AREAS = [
  { name: 'Saddar', lat: 24.8556, lng: 67.0260 },
  { name: 'North Nazimabad', lat: 24.9400, lng: 67.0350 },
  { name: 'Gulshan-e-Iqbal', lat: 24.9180, lng: 67.0970 },
  { name: 'Korangi', lat: 24.8310, lng: 67.1300 },
  { name: 'DHA Phase 6', lat: 24.8000, lng: 67.0650 },
  { name: 'Clifton', lat: 24.8150, lng: 67.0300 },
  { name: 'Nazimabad', lat: 24.9150, lng: 67.0300 },
  { name: 'Malir', lat: 24.8950, lng: 67.1950 },
];

const byName = Object.fromEntries(AREAS.map((a) => [a.name, a]));

// Order ref se ek fixed chhota offset, taake ek area ke pins aik doosre par na girein
export function pinFor(orderRef, areaName) {
  const area = byName[areaName] ?? AREAS[0];
  let h = 0;
  for (const ch of orderRef) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const dLat = ((h % 1000) / 1000 - 0.5) * 0.016;
  const dLng = (((h >>> 10) % 1000) / 1000 - 0.5) * 0.016;
  return { lat: area.lat + dLat, lng: area.lng + dLng };
}