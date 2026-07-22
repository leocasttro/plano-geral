import { Router } from "express";
import { makeUserController } from "../factories/makeUserController";
import { ensureAdmin } from '../middlewares/ensureAdmin';

const router = Router();
const controller = makeUserController();

router.get('/admin/all', ensureAdmin, (req, res) => controller.listAdmin(req, res));
router.post('/createUser', ensureAdmin, (req, res) => controller.create(req, res));
router.patch('/:id/perfil', ensureAdmin, (req, res) => controller.alterarPerfil(req, res));
router.patch('/:id/status', ensureAdmin, (req, res) => controller.alterarStatus(req, res));
router.get('/', (req, res) => controller.list(req, res));

export default router;
