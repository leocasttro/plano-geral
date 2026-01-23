import { Request, Response } from "express";
import { TarefaDTO } from "../../../application/dtos/TarefaDTO";
import { AdicionarComentario } from "../../../application/use-cases/AdicionarComentario";
import { AlterarStatusTarefa } from "../../../application/use-cases/AlterarStatusTarefa";
import { CreateTarefa } from "../../../application/use-cases/CreateTarefa";
import { GetTarefaById } from "../../../application/use-cases/GetTarefaById";
import { TarefaORM } from "../../database/typeorm/entities/TarefaORM";

interface CriarTarefaBody {
  titulo: string;
  descricao?: string;
}

type Deps = {
  createTarefa: CreateTarefa;
  getById: GetTarefaById;
  addComentario: AdicionarComentario;
  alterarStatus: AlterarStatusTarefa;
}

export class TarefasController {
  constructor (private deps: Deps) {}

  async criar(req: Request<{}, {}, CriarTarefaBody>, res: Response) {
    const { titulo, descricao } = req.body;

    const tarefa = await this.deps.createTarefa.execute({ titulo, descricao})

    return res.status(201).json(TarefaDTO.fromDomain(tarefa));
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
}
