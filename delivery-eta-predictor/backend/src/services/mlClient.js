import axios from 'axios';

const client = axios.create({
  baseURL: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  timeout: 5000,
});

// Sends order features to the FastAPI service and returns ETA + risk.
export async function predictForOrder(order) {
  const now = new Date();
  const payload = {
    distance_km: order.distanceKm,
    weight_kg: order.weightKg,
    area: order.area,
    rider_open_orders: order.riderOpenOrders ?? 0,
    payment_type: order.paymentType,
    hour_of_day: now.getHours(),
    day_of_week: now.getDay(),
    promised_minutes_from_now: Math.round((order.promisedAt - now) / 60000),
  };

  const { data } = await client.post('/predict', payload);
  return data;
}