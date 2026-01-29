import { Tarefa } from '../../domain/entities/Tarefa';
import { TarefaRepository } from '../../domain/repositories/TarefaRepository';

export class GetAllTarefas {
  constructor(private repo: TarefaRepository) {}

  async execute(): Promise<Tarefa[]> {
    const tarefas = await this.repo.list();

    if (!tarefas) {
      throw new Error('Tarefas não encontrada');
    }

    return tarefas;
  }
}
