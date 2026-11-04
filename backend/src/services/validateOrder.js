import { AREAS } from '../config/areas.js';

const AREA_NAMES = AREAS.map((a) => a.name);
const REF_PATTERN = /^[A-Za-z0-9-]{3,20}$/;
const MAX_DISTANCE_KM = 50;
const MAX_AMOUNT_PKR = 1_000_000;
const PAST_TOLERANCE_MS = 2 * 60 * 60 * 1000; // 2 ghante tak purana time allowed

// Returns { value } on success or { error } on failure
export function validateNewOrder(body = {}) {
  const orderRef = String(body.orderRef ?? '').trim().replace(/^#/, '');
  if (!REF_PATTERN.test(orderRef)) {
    return { error: 'Order ID 3 se 20 characters ka ho, sirf letters, numbers aur - allowed hain' };
  }

  if (!AREA_NAMES.includes(body.area)) {
    return { error: 'Area list mein nahi hai' };
  }

  const distanceKm = Number(body.distanceKm);
  if (!(distanceKm > 0 && distanceKm <= MAX_DISTANCE_KM)) {
    return { error: `Distance 0 se zyada aur ${MAX_DISTANCE_KM} km se kam honi chahiye` };
  }

  const amountPKR = Number(body.amountPKR);
  if (!(amountPKR > 0 && amountPKR <= MAX_AMOUNT_PKR)) {
    return { error: `Amount 0 se zyada aur ${MAX_AMOUNT_PKR} se kam hona chahiye` };
  }

  if (!['COD', 'PREPAID'].includes(body.paymentType)) {
    return { error: 'Payment type COD ya PREPAID hona chahiye' };
  }

  const riderName = String(body.riderName ?? '').trim();
  if (riderName.length < 2 || riderName.length > 50) {
    return { error: 'Rider name 2 se 50 characters ka hona chahiye' };
  }

  const promisedAt = new Date(body.promisedAt);
  if (Number.isNaN(promisedAt.getTime())) {
    return { error: 'Promised time sahi nahi hai' };
  }
  if (promisedAt.getTime() < Date.now() - PAST_TOLERANCE_MS) {
    return { error: 'Promised time 2 ghante se zyada purana nahi hona chahiye' };
  }

  return {
    value: {
      orderRef,
      area: body.area,
      distanceKm,
      amountPKR,
      paymentType: body.paymentType,
      riderName,
      promisedAt,
    },
  };
}