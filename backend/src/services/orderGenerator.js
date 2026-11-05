import { AREAS } from '../config/areas.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const between = (min, max) => min + Math.random() * (max - min);

// Simulator ka random order. Asli system mein ye data external source se aayega.
export function randomIncomingOrder() {
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);

  return {
    orderRef: `SIM-${stamp}${suffix}`,
    area: pick(AREAS).name,
    distanceKm: Math.round(between(1, 15) * 10) / 10,
    weightKg: Math.round(between(0.2, 5) * 10) / 10,
    amountPKR: Math.round(between(500, 12000) / 10) * 10,
    paymentType: Math.random() < 0.7 ? 'COD' : 'PREPAID',
    promisedAt: new Date(Date.now() + between(45, 120) * 60000).toISOString(),
  };
}