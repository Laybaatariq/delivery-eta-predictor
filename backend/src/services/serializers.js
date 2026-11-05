import { pinFor } from '../config/areas.js';

const timeParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Karachi',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

// Date -> Karachi time ke minutes (1140 = 7:00 PM)
export function minutesOfDay(date) {
  if (!date) return null;
  const parts = timeParts.formatToParts(date);
  const h = Number(parts.find((p) => p.type === 'hour').value) % 24;
  const m = Number(parts.find((p) => p.type === 'minute').value);
  return h * 60 + m;
}

export function levelFor(riskPercent) {
  return riskPercent >= 60 ? 'high' : riskPercent >= 35 ? 'med' : 'low';
}

export function formatPKR(amount) {
  return 'Rs ' + amount.toLocaleString('en-US');
}

export function serializeListItem(o) {
  const pin = pinFor(o.orderRef, o.area);
  return {
    id: '#' + o.orderRef,
    orderRef: o.orderRef,
    area: o.area,
    rider: o.riderName,
    load: o.riderOpenOrders,
    prob: o.riskPercent,
    level: levelFor(o.riskPercent),
    promised: minutesOfDay(o.promisedAt),
    lat: pin.lat,
    lng: pin.lng,
    prog: o.riderProgress,
  };
}

export function serializeDetail(o) {
  return {
    ...serializeListItem(o),
    lo: minutesOfDay(o.eta?.low),
    mid: minutesOfDay(o.eta?.mid),
    hi: minutesOfDay(o.eta?.high),
    amount: formatPKR(o.amountPKR),
    reasons: o.reasons.map((r) => [r.label, r.impact]),
    why: o.explanation?.why ?? '',
    sources: o.explanation?.sources ?? [],
    actions: o.actions.map((a) => a.label),
    actionsDone: o.actions.map((a) => a.requested),
  };
}