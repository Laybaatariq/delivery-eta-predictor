import mongoose from 'mongoose';

const snapshotSchema = new mongoose.Schema(
  {
    asOfLabel: String,
    onTimePct: Number,
    avgEtaErrorMin: Number,
    weather: String,
  },
  { timestamps: true }
);

export const DispatchSnapshot = mongoose.model('DispatchSnapshot', snapshotSchema);