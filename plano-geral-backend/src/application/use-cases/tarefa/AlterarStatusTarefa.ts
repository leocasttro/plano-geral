import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import { StatusTarefa } from "../../../domain/value-objects/StatusTarefa";

export class AlterarStatusTarefa {
  constructor(private repo: TarefaRepository) {}

  async execute(input: {tarefaId: string; novoStatus: StatusTarefa; usuario: string}) {
    const tarefa = await this.repo.findById(input.tarefaId);
    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    if (input.novoStatus === StatusTarefa.EM_ANDAMENTO) {
      tarefa.iniciar(input.usuario);
    }

    if (input.novoStatus === StatusTarefa.CONCLUIDA) {
      tarefa.concluir(input.usuario);
    }

    await this.repo.save(tarefa);
    return tarefa;
  }
}
