export const fmt = (m) => {
  if (m == null) return '';
  const h = Math.floor(m / 60);
  const min = String(m % 60).padStart(2, '0');
  return `${h % 12 || 12}:${min} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const duration = (m) => {
  const a = Math.abs(m);
  const h = Math.floor(a / 60);
  const min = a % 60;
  if (!h) return `${min} min`;
  return min ? `${h} h ${min} min` : `${h} h`;
};

export const LEVEL_WORD = { high: 'High', med: 'Moderate', low: 'Low' };

// ETA bar ka scale: 5:30 PM se 10:30 PM tak
const SCALE_START = 17 * 60 + 30;
const SCALE_SPAN = 300;

export const toPct = (m) =>
  Math.max(0, Math.min(100, ((m - SCALE_START) / SCALE_SPAN) * 100));