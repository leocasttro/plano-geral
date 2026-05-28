import {Router} from 'express';
import {makeAuthController} from '../factories/makeAuthController';

const router = Router()
const controller = makeAuthController();

router.post('/login', (req, res) => controller.login(req, res));

export default router;
