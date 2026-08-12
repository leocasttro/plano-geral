import {Router} from 'express';
import {makeAuthController} from '../factories/makeAuthController';
import { loginRateLimiter } from '../middlewares/loginRateLimiter';

const router = Router()
const controller = makeAuthController();

router.post('/login', loginRateLimiter, (req, res) => controller.login(req, res));
router.post('/confirm-password-change', (req, res) => controller.confirmPasswordChange(req, res));

export default router;
