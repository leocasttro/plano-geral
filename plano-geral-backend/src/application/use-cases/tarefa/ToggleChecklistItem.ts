import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";

export class ToggleChecklistItem {
  constructor(private tarefaRepo: TarefaRepository) {}

  async execute(input: { tarefaId: string; checklistItemId: string}) {
    const tarefa = await this.tarefaRepo.findById(input.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    tarefa.toggleChecklistItem(input.checklistItemId);

    await this.tarefaRepo.save(tarefa);
    return tarefa;
  }
}
  