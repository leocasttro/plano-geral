import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';
import { Prioridade } from '../../../domain/value-objects/Prioridade';

export class AlterarPrioridadeTarefa {
  constructor(private repo: TarefaRepository) {}

  async execute(input: { tarefaId: string; novaPrioridade: Prioridade, usuario: string }) {
    const tarefa = await this.repo.findById(input.tarefaId);
    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }
    tarefa.alterarPrioridade(input.novaPrioridade, input.usuario);

    await this.repo.save(tarefa);
    return tarefa;
  }
}
