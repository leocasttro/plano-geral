import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";

export class GetTarefaById {
  constructor(private repo: TarefaRepository) {}

  async execute(id: string) {
    const tarefa = await this.repo.findById(id);
    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }
    return tarefa;
  }
}
