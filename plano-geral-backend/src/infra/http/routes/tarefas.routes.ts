import { Router } from "express";
import { makeTarefaController } from "../factories/makeTarefaController";
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const router = Router();
const controller = makeTarefaController();

router.use(ensureAuthenticated);

router.post("/", ensureAuthenticated, (req, res) => controller.criar(req, res));
router.get("/", (req, res) => controller.buscarTodas(req, res));
router.post('/solicitacoes-datas/:solicitacaoId/aprovar', (req, res) =>
  controller.aprovarAlteracaoDatas(req, res),
);
router.post('/solicitacoes-datas/:solicitacaoId/reprovar', (req, res) =>
  controller.reprovarAlteracaoDatas(req, res),
);
router.get('/solicitacoes-datas/:solicitacaoId', (req, res) =>
  controller.buscarSolicitacaoAlteracaoDatas(req, res),
);
router.get("/:id", (req, res) => controller.buscarPorId(req, res));
router.get('/:id/solicitacoes-datas/pendente', (req, res) =>
  controller.buscarSolicitacaoAlteracaoDatasPendente(req, res),
);
router.post("/:id/comentarios", (req, res) => controller.adicionarComentario(req, res));
router.get("/:id/atividades", (req, res) => controller.buscarAtividades(req, res));
router.post('/:id/checklist', (req, res) => controller.AdicionarChecklistLitem(req, res));
router.patch('/:id/checklist/:itemId/toggle', (req, res) => controller.toggleChecklistItem(req, res));
router.patch('/:id/prioridade', (req, res) => controller.alterarPrioridade(req, res));
router.post('/:id/status', (req, res) => controller.alterarStatus(req, res));
router.post('/:id/atribuirResponsavel', (req, res) => controller.atribuirResponsavel(req, res));
router.post('/:id/solicitacoes-datas', (req, res) =>
  controller.solicitarAlteracaoDatas(req, res),
);
router.patch('/:id/datas', (req, res) => controller.alterarDatas(req, res));
router.delete('/:id', (req, res) => controller.excluir(req, res));

export default router;
