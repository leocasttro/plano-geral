import { Router } from 'express';
import { TarefaController } from '../controllers/TarefasController';

const router = Router();
const controller = new TarefaController();

// Caso de uso: Criar tarefa
router.post('/', controller.criar.bind(controller));

export default router;
