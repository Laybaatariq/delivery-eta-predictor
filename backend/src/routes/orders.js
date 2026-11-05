import { Router } from 'express';
import { Order } from '../models/Order.js';
import { serializeDetail } from '../services/serializers.js';
import { validateNewOrder } from '../services/validateOrder.js';
import { ingestOrder, syncRiderLoad } from '../services/ingestOrder.js';
import { randomIncomingOrder } from '../services/orderGenerator.js';
import { RIDERS } from '../config/riders.js';

const router = Router();

const cleanRef = (ref) => ref.replace(/^#/, '');

// GET /api/orders/:ref
router.get('/:ref', async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderRef: cleanRef(req.params.ref) });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(serializeDetail(order));
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/:ref/actions/:index
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

// POST /api/orders/:ref/reassign   body: { riderName }
router.post('/:ref/reassign', async (req, res, next) => {
  try {
    const riderName = String(req.body.riderName ?? '').trim();
    if (!RIDERS.includes(riderName)) {
      return res.status(400).json({ error: 'Rider list mein nahi hai' });
    }

    const order = await Order.findOne({ orderRef: cleanRef(req.params.ref) });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const previous = order.riderName;
    order.riderName = riderName;
    await order.save();

    await syncRiderLoad(previous);
    await syncRiderLoad(riderName);

    res.json(serializeDetail(await Order.findById(order._id)));
  } catch (err) {
    next(err);
  }
});

// POST /api/orders   (external system ke liye ingestion)
router.post('/', async (req, res, next) => {
  try {
    const { value, error } = validateNewOrder(req.body);
    if (error) return res.status(400).json({ error });

    if (await Order.exists({ orderRef: value.orderRef })) {
      return res.status(409).json({ error: `Order ${value.orderRef} already exists` });
    }

    const order = await ingestOrder(value);
    res.status(201).json(serializeDetail(order));
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/simulate   (dashboard button, koi input nahi)
router.post('/simulate', async (req, res, next) => {
  try {
    const { value, error } = validateNewOrder(randomIncomingOrder());
    if (error) return res.status(500).json({ error: `Simulator ne invalid order banaya: ${error}` });

    if (await Order.exists({ orderRef: value.orderRef })) {
      return res.status(409).json({ error: 'Duplicate simulated ref, dobara try karo' });
    }

    const order = await ingestOrder(value);
    res.status(201).json(serializeDetail(order));
  } catch (err) {
    next(err);
  }
});

export default router;