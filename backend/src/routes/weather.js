import { Router } from 'express';
import { getAreaWeather } from '../services/weatherClient.js';

const router = Router();

// GET /api/weather
router.get('/', async (req, res, next) => {
  try {
    res.json(await getAreaWeather());
  } catch (err) {
    next(err);
  }
});

export default router;