import { Router } from 'express';
import { register, login, refresh, oauthLogin } from '../controllers/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/oauth', oauthLogin);

export default router;
