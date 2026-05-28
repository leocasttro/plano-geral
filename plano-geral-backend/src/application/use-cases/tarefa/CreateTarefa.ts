import { Tarefa } from "../../../domain/entities/Tarefa";
import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import {ProjetoRepository} from '../../../domain/repositories/ProjetoRepository';

export class CreateTarefa {
  constructor(private readonly repo: TarefaRepository, private readonly projetoRepo: ProjetoRepository) {}

  async execute(input: { titulo: string; descricao?: string; projetoId: string }) {

    const projeto = await this.projetoRepo.findById(input.projetoId);

    if (!projeto) {
      throw new Error("Projeto não encontrado")
    }

    const tarefa = new Tarefa(
      crypto.randomUUID(),
      input.titulo,
      input.descricao,
      input.projetoId
    );

    await this.repo.save(tarefa);

    return tarefa;
  }
}
