import { Router } from 'express';
import { getDashboardMetrics, getLiveMarketFeed } from '../controllers/dashboard';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Secure all dashboard endpoints
router.use(authenticateJWT);

router.get('/metrics', getDashboardMetrics);
router.get('/market-feed', getLiveMarketFeed);

export default router;
