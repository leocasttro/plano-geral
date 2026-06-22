import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import { StatusTarefa } from "../../../domain/value-objects/StatusTarefa";
import {TarefaStatusTransitionService} from '../../../domain/services/tarefa-status/TarefaStatusTransitionService';

export class AlterarStatusTarefa {
  constructor(private repo: TarefaRepository, private statusTransitionService = new TarefaStatusTransitionService()) {}

  async execute(input: {tarefaId: string; novoStatus: StatusTarefa; usuario: string}) {
    const tarefa = await this.repo.findById(input.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    this.statusTransitionService.alterarStatus(
      tarefa,
      input.novoStatus,
      input.usuario,
    );

    await this.repo.save(tarefa);
    return tarefa;
  }
}
