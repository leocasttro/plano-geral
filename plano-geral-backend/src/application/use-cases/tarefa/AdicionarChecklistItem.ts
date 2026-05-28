import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";

export class AdicionarChecklistItem {
  constructor(private tarefarepo: TarefaRepository) {}

  async execute(input: { tarefaId: string; nome: string}) {
    const tarefa = await this.tarefarepo.findById(input.tarefaId);

    if (!tarefa) throw new Error('Tarefa não encontrada');

    tarefa.adicionarCheckListItem(input.nome);

    await this.tarefarepo.save(tarefa);
    return tarefa;
  }
}
