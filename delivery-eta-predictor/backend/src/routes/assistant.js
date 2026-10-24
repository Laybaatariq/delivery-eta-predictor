import { Router } from 'express';
import { Order } from '../models/Order.js';
import { answerQuestion } from '../services/assistant.js';

const router = Router();

// POST /api/assistant/ask  { question, selectedRef }
router.post('/ask', async (req, res, next) => {
  try {
    const { question = '', selectedRef } = req.body;
    if (!question.trim()) return res.status(400).json({ error: 'Question is required' });

    const orders = await Order.find().sort({ riskPercent: -1 });
    const selected = selectedRef
      ? orders.find((o) => o.orderRef === selectedRef.replace(/^#/, ''))
      : orders[0];

    res.json({ answer: answerQuestion(question, orders, selected) });
  } catch (err) {
    next(err);
  }
});

export default router;