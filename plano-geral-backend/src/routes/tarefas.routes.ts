import { Router } from "express";
import { TarefaController } from "../controllers/tarefas.controller";

const router = Router();
const controller = new TarefaController();

router.get("/", controller.listar.bind(controller));
router.post("/", controller.criar.bind(controller));
router.put("/:id", controller.atualizar.bind(controller));
router.delete("/:id", controller.remover.bind(controller));

export default router;
