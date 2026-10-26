// Karachi is UTC+5 with no DST, so we build dates with a fixed offset.
const todayKarachi = new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);
const at = (minutesOfDay) =>
  new Date(new Date(`${todayKarachi}T00:00:00+05:00`).getTime() + minutesOfDay * 60000);

export const seedSnapshot = {
  asOfLabel: '5:42 PM',
  onTimePct: 87,
  avgEtaErrorMin: 26,
  weather: 'Light rain over Saddar, Gulshan and North Nazimabad. Clear in DHA, Clifton and Korangi.',
};

export const seedOrders = [
  {
    orderRef: 'PK-4821', area: 'Saddar', distanceKm: 6.2, weightKg: 0.8, paymentType: 'COD', amountPKR: 3450,
    riderName: 'Hamza R.', riderOpenOrders: 9, mapPos: { x: 260, y: 318 }, riderProgress: 0.55,
    promisedAt: at(1140), eta: { low: at(1210), mid: at(1250), high: at(1300) }, riskPercent: 82,
    reasons: [
      { label: 'Rider has 9 open orders', impact: 0.31 },
      { label: 'Rain in Saddar', impact: 0.24 },
      { label: 'Evening rush near Saddar', impact: 0.19 },
      { label: 'Distance 6.2 km', impact: 0.06 },
      { label: 'Parcel weighs 0.8 kg', impact: -0.04 },
    ],
    explanation: {
      why: 'Hamza has 9 open orders, above the limit of 8 in the dispatch policy, and rain plus the evening rush is slowing Saddar. In two similar past cases, moving part of the load to a nearby rider cut the delay from about 3 hours to 40 minutes.',
      sources: ['SOP-4 Rider load limits', 'Case #211 Saddar, rain, 9 orders', 'Zone note: Saddar evening traffic'],
    },
    actions: [{ label: 'Reassign 3 orders to a nearby rider' }, { label: 'Notify customer before 7:00 PM' }],
  },
  {
    orderRef: 'PK-4844', area: 'North Nazimabad', distanceKm: 9.4, paymentType: 'COD', amountPKR: 1980,
    riderName: 'Ahsan M.', riderOpenOrders: 8, mapPos: { x: 250, y: 90 }, riderProgress: 0.4,
    promisedAt: at(1155), eta: { low: at(1170), mid: at(1230), high: at(1290) }, riskPercent: 71,
    reasons: [
      { label: 'Rider has 8 open orders', impact: 0.26 },
      { label: 'Evening rush on this route', impact: 0.21 },
      { label: 'Distance 9.4 km', impact: 0.11 },
      { label: 'Rain in North Nazimabad', impact: 0.10 },
      { label: 'Rider on-time record here', impact: -0.06 },
    ],
    explanation: {
      why: 'Ahsan is at 8 open orders, right at the limit, and the evening rush on this route is heavy. In past cases, moving one order to another rider brought the load back under the limit and delays fell to under an hour.',
      sources: ['SOP-4 Rider load limits', 'Case #203 North Nazimabad, 8 orders', 'Zone note: North Nazimabad rush hour'],
    },
    actions: [{ label: 'Reassign 1 order' }, { label: 'Notify customer' }],
  },
  {
    orderRef: 'PK-4830', area: 'Gulshan-e-Iqbal', distanceKm: 4.1, paymentType: 'COD', amountPKR: 5200,
    riderName: 'Bilal S.', riderOpenOrders: 7, mapPos: { x: 410, y: 150 }, riderProgress: 0.5,
    promisedAt: at(1170), eta: { low: at(1165), mid: at(1215), high: at(1260) }, riskPercent: 61,
    reasons: [
      { label: 'Rain in Gulshan', impact: 0.18 },
      { label: 'Rush hour on University Road', impact: 0.17 },
      { label: 'Rider has 7 open orders', impact: 0.14 },
      { label: 'Address needs a landmark call', impact: 0.08 },
      { label: 'Distance 4.1 km', impact: -0.05 },
    ],
    explanation: {
      why: 'Rain and rush hour on University Road are the main drivers. Rider load is manageable, so a heads-up to the customer is enough for now. In past Gulshan cases, a landmark call before arrival saved 15 to 20 minutes.',
      sources: ['SOP-7 Proactive delay notices', 'Case #187 Gulshan, rain', 'Zone note: University Road evening traffic'],
    },
    actions: [{ label: 'Notify customer' }, { label: 'Call to confirm landmark' }],
  },
  {
    orderRef: 'PK-4860', area: 'Korangi', distanceKm: 8.7, paymentType: 'COD', amountPKR: 2750,
    riderName: 'Imran Q.', riderOpenOrders: 6, mapPos: { x: 520, y: 240 }, riderProgress: 0.6,
    promisedAt: at(1185), eta: { low: at(1170), mid: at(1200), high: at(1245) }, riskPercent: 48,
    reasons: [
      { label: 'Gate checks in industrial zone', impact: 0.15 },
      { label: 'Rider has 6 open orders', impact: 0.09 },
      { label: 'Distance 8.7 km', impact: 0.08 },
      { label: 'Clear weather', impact: -0.07 },
      { label: 'Rider knows this area', impact: -0.05 },
    ],
    explanation: {
      why: 'The main risk is gate and security checks in the Korangi industrial zone, which added 30 to 40 minutes in past cases. Calling the recipient ahead so someone meets the rider at the gate is the fix that worked.',
      sources: ['Case #164 Korangi gate delay', 'SOP-9 Gate clearance calls'],
    },
    actions: [{ label: 'Call recipient to confirm gate access' }],
  },
  {
    orderRef: 'PK-4835', area: 'DHA Phase 6', distanceKm: 11.8, paymentType: 'COD', amountPKR: 8400,
    riderName: 'Usman K.', riderOpenOrders: 4, mapPos: { x: 480, y: 330 }, riderProgress: 0.7,
    promisedAt: at(1200), eta: { low: at(1170), mid: at(1195), high: at(1235) }, riskPercent: 34,
    reasons: [
      { label: 'Distance 11.8 km', impact: 0.16 },
      { label: 'Rider has 4 open orders', impact: -0.12 },
      { label: 'Clear weather', impact: -0.09 },
      { label: 'Evening traffic', impact: 0.07 },
      { label: 'Sunday, lighter traffic', impact: -0.05 },
    ],
    explanation: {
      why: 'Risk is low. The distance is long, but the rider has only 4 open orders, the weather is clear and Sunday traffic in DHA is light. No action needed unless the ETA moves past 8:00 PM.',
      sources: ['Zone note: DHA Sunday traffic', 'Case #142 DHA long distance, on time'],
    },
    actions: [],
  },
  {
    orderRef: 'PK-4852', area: 'Clifton', distanceKm: 2.3, paymentType: 'COD', amountPKR: 1300,
    riderName: 'Farhan T.', riderOpenOrders: 3, mapPos: { x: 400, y: 335 }, riderProgress: 0.85,
    promisedAt: at(1140), eta: { low: at(1105), mid: at(1120), high: at(1145) }, riskPercent: 12,
    reasons: [
      { label: 'Distance 2.3 km', impact: -0.21 },
      { label: 'Rider has 3 open orders', impact: -0.15 },
      { label: 'Clear weather', impact: -0.06 },
      { label: 'Evening traffic', impact: 0.09 },
    ],
    explanation: {
      why: 'Short distance and a light rider load. Expect delivery about 20 minutes before the promised time.',
      sources: ['Zone note: Clifton evening traffic'],
    },
    actions: [],
  },
];