import { Tarefa } from "../../../domain/entities/Tarefa";
import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";

export class CreateTarefa {
  constructor(private readonly repo: TarefaRepository) {}

  async execute(input: {titulo: string, descricao?: string}) {
    const tarefa = new Tarefa(
      crypto.randomUUID(),
      input.titulo,
      input.descricao
    );

    await this.repo.save(tarefa);

    return tarefa;
  }
}
