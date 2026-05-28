import {Router} from 'express';
import {makeProjetoController} from '../factories/makeProjetoController';

const router = Router();
const controller = makeProjetoController()

router.post('/', (req, res) => controller.criar(req, res));
router.get('/', (req, res) => controller.listar(req, res));
router.get('/:id', (req, res) => controller.buscarPorId(req, res));
router.patch('/:id/status', (req, res) => controller.atualizarStatus(req, res));

export default router;
