import { BOARD } from '../config/board.js';

const KARACHI_TZ = 'Asia/Karachi';
const timeParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: KARACHI_TZ,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

// Date -> minutes since midnight in Karachi time
export function minutesOfDay(date) {
  if (!date) return null;
  const parts = timeParts.formatToParts(date);
  const h = Number(parts.find((p) => p.type === 'hour').value) % 24;
  const m = Number(parts.find((p) => p.type === 'minute').value);
  return h * 60 + m;
}

// Same thresholds as the prototype and the ML service
export function levelFor(riskPercent) {
  return riskPercent >= 60 ? 'high' : riskPercent >= 35 ? 'med' : 'low';
}

export function formatPKR(amount) {
  return 'Rs ' + amount.toLocaleString('en-US');
}

// Shape used on the left-side order list and on the map
export function serializeListItem(o) {
  return {
    id: '#' + o.orderRef,
    orderRef: o.orderRef,
    area: o.area,
    prob: o.riskPercent,
    level: levelFor(o.riskPercent),
    promised: minutesOfDay(o.promisedAt),
    x: o.mapPos.x,
    y: o.mapPos.y,
    prog: o.riderProgress,
  };
}

// Shape used on the right-side detail panel
export function serializeDetail(o) {
  return {
    ...serializeListItem(o),
    lo: minutesOfDay(o.eta?.low),
    mid: minutesOfDay(o.eta?.mid),
    hi: minutesOfDay(o.eta?.high),
    rider: o.riderName,
    load: o.riderOpenOrders,
    amount: formatPKR(o.amountPKR),
    reasons: o.reasons.map((r) => [r.label, r.impact]),
    why: o.explanation?.why ?? '',
    sources: o.explanation?.sources ?? [],
    actions: o.actions.map((a) => a.label),
    actionsDone: o.actions.map((a) => a.requested),
  };
}