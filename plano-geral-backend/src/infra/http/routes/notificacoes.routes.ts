import { Router } from 'express';
import { makeNotificacoesController } from '../factories/makeNotificacoesController';

const router = Router();
const controller = makeNotificacoesController();

router.get('/', (req, res) => controller.listar(req, res));

router.get('/nao-lidas/total', (req, res) =>
  controller.totalNaoLidas(req, res),
);

router.patch('/:id/lida', (req, res) =>
  controller.marcarComoLida(req, res),
);

export default router;
