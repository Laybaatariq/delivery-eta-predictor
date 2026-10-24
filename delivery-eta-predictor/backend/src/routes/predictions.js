import { Router } from 'express';
import { Order } from '../models/Order.js';
import { predictForOrder } from '../services/mlClient.js';
import { serializeDetail } from '../services/serializers.js';

const router = Router();

const addMinutes = (date, min) => new Date(date.getTime() + min * 60000);

// POST /api/predictions/:ref  -> runs the model and updates the order
router.post('/:ref', async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderRef: req.params.ref.replace(/^#/, '') });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const p = await predictForOrder(order);
    const now = new Date();

    order.eta = {
      low: addMinutes(now, p.eta_low_min),
      mid: addMinutes(now, p.eta_mid_min),
      high: addMinutes(now, p.eta_high_min),
    };
    order.riskPercent = Math.round(p.delay_probability * 100);
    order.modelVersion = p.model_version;
    order.predictedAt = now;
    await order.save();

    res.json(serializeDetail(order));
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.response?.status >= 500) {
      return res.status(503).json({ error: 'ML service unavailable' });
    }
    next(err);
  }
});

export default router;