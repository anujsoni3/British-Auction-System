import { Router } from 'express';
import { loginController, signupController, logoutController, getCurrentUserController } from './controller.js';
import { requireAuth } from './middleware.js';

const router = Router();

router.post('/login', loginController);
router.post('/signup', signupController);
router.post('/logout', logoutController);
router.get('/me', requireAuth, getCurrentUserController);

export default router;
