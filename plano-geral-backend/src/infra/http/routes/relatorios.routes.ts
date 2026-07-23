import { Router } from 'express';
import { makeRelatoriosController } from '../factories/makeRelatoriosController';
import { ensureAdmin } from '../middlewares/ensureAdmin';

const router = Router();
const controller = makeRelatoriosController();

router.get(
  '/tarefas/:tarefaId/tempo-responsavel',
  ensureAdmin,
  (req, res) =>
    controller.tempoTarefaPorResponsavel(req, res));
router.get('/tarefas/:tarefaId/alteracoes-datas', ensureAdmin,
  (req, res) =>
    controller.alteracoesDatasTarefa(req, res));
router.get('/projetos/:projetoId/resumo', ensureAdmin,
  (req, res) =>
    controller.resumoProjeto(req, res));
router.get('/usuarios/carga', ensureAdmin,
  (req, res) =>
    controller.cargaUsuarios(req, res));
router.get('/dashboard', ensureAdmin,
  (req, res) =>
    controller.dashboard(req, res));
router.get('/projetos/metricas', ensureAdmin,
  (req, res) =>
    controller.metricasProjetos(req, res));
router.get('/tarefas/tempo-medio-titulos', ensureAdmin,
  (req, res) =>
    controller.tempoMedioPorTitulo(req, res));
router.get('/calendario', ensureAdmin,
  (req, res) =>
    controller.calendarioTarefas(req, res));
router.get('/tarefas/tempo-conclusao', ensureAdmin,
  (req, res) =>
    controller.tempoConclusaoPorTitulo(req, res));
router.get('/lead-time', ensureAdmin, (req, res) =>
  controller.leadTime(req, res),
);
export default router;
