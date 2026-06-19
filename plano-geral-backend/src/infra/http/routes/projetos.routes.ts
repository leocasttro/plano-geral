import {Router} from 'express';
import {makeProjetoController} from '../factories/makeProjetoController';
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const router = Router();
const controller = makeProjetoController()

router.use(ensureAuthenticated);

router.post('/', (req, res) => controller.criar(req, res));
router.get('/', (req, res) => controller.listar(req, res));
router.get('/:id', (req, res) => controller.buscarPorId(req, res));
router.patch('/:id/status', (req, res) => controller.atualizarStatus(req, res));
router.post('/bulk', (req, res) => controller.criarVarios(req, res));

export default router;
