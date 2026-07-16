import { Router } from 'express';
import { createStrategy, getStrategies, getStrategy, updateStrategy, compareStrategies } from '../controllers/strategies';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Guard strategy endpoints
router.use(authenticateJWT);

router.post('/', createStrategy);
router.get('/', getStrategies);
router.post('/compare', compareStrategies);
router.get('/:id', getStrategy);
router.put('/:id', updateStrategy);

export default router;
