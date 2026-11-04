import { Router } from 'express';
import { Order } from '../models/Order.js';
import { serializeDetail } from '../services/serializers.js';
import { BOARD } from '../config/board.js';

const router = Router();

// Accepts "PK-4821" or "#PK-4821"
const cleanRef = (ref) => ref.replace(/^#/, '');

// Naye order ko map par random jagah dete hain, board ke andar
const randomMapPos = () => ({
  x: 200 + Math.round(Math.random() * 320),
  y: 80 + Math.round(Math.random() * 260),
});

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
    const riderName = (req.body.riderName || '').trim();
    if (!riderName) return res.status(400).json({ error: 'riderName is required' });

    const order = await Order.findOne({ orderRef: cleanRef(req.params.ref) });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.riderName = riderName;
    await order.save();
    res.json(serializeDetail(order));
  } catch (err) {
    next(err);
  }
});

// POST /api/orders   body: { orderRef, area, distanceKm, paymentType, amountPKR, riderName, promisedAt }
router.post('/', async (req, res, next) => {
  try {
    const { orderRef, area, distanceKm, paymentType, amountPKR, riderName, promisedAt } = req.body;

    const exists = await Order.exists({ orderRef });
    if (exists) return res.status(409).json({ error: `Order ${orderRef} already exists` });

    const order = await Order.create({
      orderRef,
      area,
      city: 'Karachi',
      distanceKm,
      paymentType,
      amountPKR,
      riderName,
      promisedAt,
      riderOpenOrders: 0,
      mapPos: randomMapPos(),
      riderProgress: 0,
      status: 'DISPATCHED',
      riskPercent: 0,
    });

    res.status(201).json(serializeDetail(order));
  } catch (err) {
    next(err);
  }
});

export default router;