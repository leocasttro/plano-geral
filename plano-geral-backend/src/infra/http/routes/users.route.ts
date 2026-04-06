import { Router } from "express";
import { makeUserController } from "../factories/makeUserController";

const router = Router();
const controller = makeUserController();

router.post('/createUser', (req, res) => controller.create(req, res));
router.get('/', (req, res) => controller.list(req, res));

export default router;
