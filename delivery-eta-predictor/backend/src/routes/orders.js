import { Router } from 'express';
import { Order } from '../models/Order.js';
import { serializeDetail } from '../services/serializers.js';

const router = Router();

// Accepts "PK-4821" or "#PK-4821" (the # must be URL-encoded as %23 in browsers)
const cleanRef = (ref) => ref.replace(/^#/, '');

// GET /api/orders/:ref  -> full detail for the right panel
router.get('/:ref', async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderRef: cleanRef(req.params.ref) });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(serializeDetail(order));
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/:ref/actions/:index  -> dispatcher pressed an action button
router.post('/:ref/actions/:index', async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderRef: cleanRef(req.params.ref) });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const i = Number(req.params.index);
    if (!Number.isInteger(i) || i < 0 || i >= order.actions.length) {
      return res.status(404).json({ error: 'Action not found' });
    }

    order.actions[i].requested = true;
    order.actions[i].requestedAt = new Date();
    await order.save();

    res.json(serializeDetail(order));
  } catch (err) {
    next(err);
  }
});

// POST /api/orders  -> create an order (used by ingestion, not the dashboard)
router.post('/', async (req, res, next) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(serializeDetail(order));
  } catch (err) {
    next(err);
  }
});

export default router;
