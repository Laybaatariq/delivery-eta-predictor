import { Order } from '../models/Order.js';
import { RIDERS } from '../config/riders.js';
import { pinFor } from '../config/areas.js';

const ACTIVE = { $nin: ['DELIVERED', 'FAILED'] };

// Sab se kam active orders wala rider. Barabar hon to random.
export async function pickRider() {
  const rows = await Order.aggregate([
    { $match: { status: ACTIVE } },
    { $group: { _id: '$riderName', count: { $sum: 1 } } },
  ]);
  const loadOf = Object.fromEntries(rows.map((r) => [r._id, r.count]));

  const ranked = RIDERS.map((name) => ({ name, load: loadOf[name] ?? 0 })).sort(
    (a, b) => a.load - b.load || Math.random() - 0.5
  );
  return ranked[0].name;
}

// Rider ke active orders ginta hai aur us ke sab orders mein riderOpenOrders update karta hai
export async function syncRiderLoad(riderName) {
  const count = await Order.countDocuments({ riderName, status: ACTIVE });
  await Order.updateMany({ riderName }, { $set: { riderOpenOrders: count } });
  return count;
}

export async function ingestOrder(data) {
  const riderName = await pickRider();
  const pin = pinFor(data.orderRef, data.area);

  const created = await Order.create({
    ...data,
    riderName,
    city: 'Karachi',
    riderOpenOrders: 0,
    mapPos: { x: pin.lng, y: pin.lat },
    riderProgress: 0,
    status: 'DISPATCHED',
    riskPercent: 0,
  });

  await syncRiderLoad(riderName);
  return Order.findById(created._id);
}