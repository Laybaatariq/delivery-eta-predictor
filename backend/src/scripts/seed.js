import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Order } from '../models/Order.js';
import { DispatchSnapshot } from '../models/DispatchSnapshot.js';
import { seedOrders, seedSnapshot } from '../data/seedData.js';

async function main() {
  await connectDB(process.env.MONGO_URI);

  // Development only: this wipes existing orders and snapshots
  await Order.deleteMany({});
  await DispatchSnapshot.deleteMany({});

  await Order.insertMany(seedOrders);
  await DispatchSnapshot.create(seedSnapshot);

  console.log(`Seeded ${seedOrders.length} orders and 1 snapshot`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});