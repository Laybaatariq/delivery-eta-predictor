import { Router } from 'express';
import { Order } from '../models/Order.js';
import { getRoadRoute } from '../services/routeClient.js';

const router = Router();

// GET /api/routes/:ref
router.get('/:ref', async (req, res) => {
  try {
    const order = await Order.findOne({ orderRef: req.params.ref.replace(/^#/, '') });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.json(await getRoadRoute(order.orderRef, order.area));
  } catch {
    res.status(502).json({ error: 'Road route unavailable' });
  }
});

export default router;