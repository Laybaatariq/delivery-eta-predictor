import mongoose from 'mongoose';

const { Schema } = mongoose;

const reasonSchema = new Schema(
  {
    label: { type: String, required: true },
    impact: { type: Number, required: true },
  },
  { _id: false }
);

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
    orderRef: { type: String, required: true, unique: true, index: true, trim: true, maxlength: 20 },
    area: { type: String, required: true },
    city: { type: String, default: 'Karachi' },

    distanceKm: { type: Number, required: true, min: 0, max: 50 },
    weightKg: { type: Number, default: 1, min: 0 },
    paymentType: { type: String, enum: ['COD', 'PREPAID'], default: 'COD' },
    amountPKR: { type: Number, required: true, min: 0, max: 1000000 },

    riderName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    riderOpenOrders: { type: Number, default: 0, min: 0 },

    mapPos: { x: Number, y: Number },
    riderProgress: { type: Number, min: 0, max: 1, default: 0 },

    status: {
      type: String,
      enum: ['PENDING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'FAILED'],
      default: 'DISPATCHED',
    },
    promisedAt: { type: Date, required: true },

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

    deliveredAt: Date,
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);