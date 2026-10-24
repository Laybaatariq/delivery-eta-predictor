import mongoose from 'mongoose';

const snapshotSchema = new mongoose.Schema(
  {
    asOfLabel: String,        // "5:42 PM"
    onTimePct: Number,        // 87
    avgEtaErrorMin: Number,   // 26
    weather: String,
  },
  { timestamps: true }
);

export const DispatchSnapshot = mongoose.model('DispatchSnapshot', snapshotSchema);