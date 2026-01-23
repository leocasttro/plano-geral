import { Router } from "express";
import { makeTarefaController } from "../factories/makeTarefaController";

const router = Router();
const controller = makeTarefaController();

router.post("/", (req, res) => controller.criar(req, res));
router.get("/:id", (req, res) => controller.buscarPorId(req, res));
router.post("/:id/comentarios", (req, res) => controller.adicionarComentario(req, res));

export default router;
