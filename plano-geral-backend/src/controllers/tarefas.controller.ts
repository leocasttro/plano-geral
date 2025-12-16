import { Request, Response } from "express";
import { TarefaService } from "../service/tarefas.service";


export class TarefaController {
  private service = new TarefaService();

  async listar(req: Request, res: Response) {
    const tarefas = await this.service.listar();
    res.json(tarefas);
  }

  async criar(req: Request, res: Response) {
    const tarefa = await this.service.criar(req.body);
    res.status(201).json(tarefa);
  }

  async atualizar(req: Request, res: Response) {
    const { id } = req.params;
    const tarefaAtualizada = await this.service.atualizar(Number(id), req.body);
    res.json(tarefaAtualizada);
  }

  async remover(req: Request, res: Response) {
    const { id } = req.params;
    await this.service.remover(Number(id));
    res.status(204).send();
  }
}
