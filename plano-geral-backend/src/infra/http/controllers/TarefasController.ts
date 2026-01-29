import { Request, Response } from "express";
import { TarefaDTO } from "../../../application/dtos/TarefaDTO";
import { AtividadeDTO } from "../../../application/dtos/AtividadeDTO";
import { CreateTarefa } from "../../../application/use-cases/tarefa/CreateTarefa";
import { GetTarefaById } from "../../../application/use-cases/tarefa/GetTarefaById";
import { GetAllTarefas } from "../../../application/use-cases/tarefa/GetAllTarefas";
import { AdicionarComentario } from "../../../application/use-cases/tarefa/AdicionarComentario";
import { AlterarStatusTarefa } from "../../../application/use-cases/tarefa/AlterarStatusTarefa";
import { GetAtividadeByTarefa } from "../../../application/use-cases/tarefa/GetAtividadeByTarefa";

interface CriarTarefaBody {
  titulo: string;
  descricao?: string;
}

type Deps = {
  createTarefa: CreateTarefa;
  getById: GetTarefaById;
  getAllTarefas: GetAllTarefas;
  addComentario: AdicionarComentario;
  alterarStatus: AlterarStatusTarefa;
  getAtividadeByTarefa: GetAtividadeByTarefa;
}

export class TarefasController {
  constructor (private deps: Deps) {}

  async criar(req: Request<{}, {}, CriarTarefaBody>, res: Response) {
    const { titulo, descricao } = req.body;

    const tarefa = await this.deps.createTarefa.execute({ titulo, descricao})

    return res.status(201).json(TarefaDTO.fromDomain(tarefa));
  }

  async buscarTodas(req: Request, res: Response) {
    const tarefas = await this.deps.getAllTarefas.execute();
    return res.json(tarefas.map(TarefaDTO.fromDomain));
  }

  async buscarPorId(req: Request, res: Response) {
    const tarefa = await this.deps.getById.execute(req.params.id);
    return res.json(TarefaDTO.fromDomain(tarefa));
  }

  async adicionarComentario(req: Request, res: Response) {
    const tarefa = await this.deps.addComentario.execute({
      tarefaId: req.params.id,
      comentario: req.body.comentario,
      usuario: req.body.usuario,
    });

    return res.json(TarefaDTO.fromDomain(tarefa));
  }

  async buscarAtividades(req: Request, res: Response) {
    const atividades = await this.deps.getAtividadeByTarefa.execute({
      tarefaId: req.params.id,
    });

    return res.json(atividades.map(AtividadeDTO.fromDomain));
  }
}
