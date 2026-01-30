import { Router } from "express";
import { makeTarefaController } from "../factories/makeTarefaController";

const router = Router();
const controller = makeTarefaController();

router.post("/", (req, res) => controller.criar(req, res));
router.get("/", (req, res) => controller.buscarTodas(req, res));
router.get("/:id", (req, res) => controller.buscarPorId(req, res));
router.post("/:id/comentarios", (req, res) => controller.adicionarComentario(req, res));
router.get("/:id/atividades", (req, res) => controller.buscarAtividades(req, res));
router.post('/:id/checklist', (req, res) => controller.AdicionarChecklistLitem(req, res));
router.patch('/:id/checklist/:itemId/toggle', (req, res) => controller.toggleChecklistItem(req, res));

export default router;
