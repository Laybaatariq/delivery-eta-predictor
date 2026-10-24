import mongoose from 'mongoose';

const { Schema } = mongoose;

// One driver of the risk: label + impact (positive = pushes toward late)
const reasonSchema = new Schema(
  {
    label: { type: String, required: true },
    impact: { type: Number, required: true },
  },
  { _id: false }
);

// A button the dispatcher can press, e.g. "Notify customer"
const actionSchema = new Schema(
  {
    label: { type: String, required: true },
    requested: { type: Boolean, default: false },
    requestedAt: Date,
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderRef: { type: String, required: true, unique: true, index: true }, // "PK-4821", shown as "#PK-4821"
    area: { type: String, required: true },
    city: { type: String, default: 'Karachi' },

    distanceKm: { type: Number, required: true },
    weightKg: { type: Number, default: 1 },
    paymentType: { type: String, enum: ['COD', 'PREPAID'], default: 'COD' },
    amountPKR: { type: Number, required: true },

    riderName: { type: String, required: true },
    riderOpenOrders: { type: Number, default: 0 },

    // Map position on the 600x420 board and rider progress along the route (0 to 1)
    mapPos: { x: Number, y: Number },
    riderProgress: { type: Number, min: 0, max: 1, default: 0 },

    status: {
      type: String,
      enum: ['PENDING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'FAILED'],
      default: 'DISPATCHED',
    },
    promisedAt: { type: Date, required: true },

    // Predicted arrival range from the ML service
    eta: { low: Date, mid: Date, high: Date },
    riskPercent: { type: Number, min: 0, max: 100, default: 0, index: true },
    modelVersion: String,
    predictedAt: Date,

    reasons: [reasonSchema],
    explanation: {
      why: String,
      sources: [String],
    },
    actions: [actionSchema],

    deliveredAt: Date, // ground truth for training
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);