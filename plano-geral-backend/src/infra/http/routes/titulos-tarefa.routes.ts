import { Router } from 'express';
import { makeTitulosTarefaController } from '../factories/makeTitulosTarefaController';

const router = Router();
const controller = makeTitulosTarefaController();

router.get('/', (req, res) => controller.listar(req, res));

export default router;
