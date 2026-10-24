import { Router } from 'express';
import { Order } from '../models/Order.js';
import { DispatchSnapshot } from '../models/DispatchSnapshot.js';
import { BOARD } from '../config/board.js';
import { serializeListItem } from '../services/serializers.js';

const router = Router();

// GET /api/dashboard/board
router.get('/board', async (req, res, next) => {
  try {
    const [orders, snap] = await Promise.all([
      Order.find().sort({ riskPercent: -1 }),
      DispatchSnapshot.findOne().sort({ createdAt: -1 }),
    ]);

    const atRisk = orders.filter((o) => o.riskPercent >= 50).length;

    res.json({
      subtitle: `${BOARD.hub.name}. Sample data as of ${snap?.asOfLabel ?? 'now'}.`,
      hub: BOARD.hub,
      canvas: BOARD.canvas,
      kpis: {
        onTimePct: snap?.onTimePct ?? null,
        ordersAtRisk: `${atRisk} of ${orders.length}`,
        avgEtaErrorMin: snap?.avgEtaErrorMin ?? null,
      },
      weather: snap?.weather ?? '',
      orders: orders.map(serializeListItem),
    });
  } catch (err) {
    next(err);
  }
});

export default router;