import {Router} from 'express';
import {makeProjetoController} from '../factories/makeProjetoController';
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { ensureGestorOuAdmin } from '../middlewares/ensureGestorOuAdmin';

const router = Router();
const controller = makeProjetoController()

router.use(ensureAuthenticated);

router.post('/', ensureGestorOuAdmin, (req, res) => controller.criar(req, res));
router.get('/', (req, res) => controller.listar(req, res));
router.get('/:id', (req, res) => controller.buscarPorId(req, res));
router.patch('/:id/status', ensureGestorOuAdmin, (req, res) => controller.atualizarStatus(req, res));
router.post('/bulk', ensureGestorOuAdmin, (req, res) => controller.criarVarios(req, res));

export default router;
