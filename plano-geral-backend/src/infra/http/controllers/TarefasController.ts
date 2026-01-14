import { Request, Response } from 'express';
import { TarefaDTO } from '../../../application/dtos/TarefaDTO';
import { CreateTarefa } from '../../../application/use-cases/CreateTarefa';
import { InMemoryTarefaRepository } from '../../database/InMemoryTarefaRepository';

interface CriarTarefaBody {
  titulo: string;
  descricao?: string;
}

export class TarefaController {
  private repo = new InMemoryTarefaRepository();
  private createTarefa = new CreateTarefa(this.repo);

  async criar(
    req: Request<{}, {}, CriarTarefaBody>,
    res: Response
  ) {
    const { titulo, descricao } = req.body;

    const tarefa = await this.createTarefa.execute({
      titulo,
      descricao,
    });

    return res.status(201).json(
      TarefaDTO.fromDomain(tarefa)
    );
  }
}
