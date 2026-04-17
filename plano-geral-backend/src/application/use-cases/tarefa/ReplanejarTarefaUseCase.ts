import { TarefaComPrazo } from '../../../domain/entities/TarefaComPrazo';
import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';
import { Periodo } from '../../../domain/value-objects/Periodo';

export class ReplanejarTarefaUseCase {
  constructor(private tarefaRepository: TarefaRepository) {}

  async execute(
    id: string,
    novaDataInicio: Date,
    novaDataFim: Date,
  ): Promise<void> {
    const tarefa = await this.tarefaRepository.findById(id);

    if (!(tarefa instanceof TarefaComPrazo)) {
      throw new Error('Tarefa não suporta replanejamento');
    }

    const novoPeriodo = new Periodo(novaDataInicio, novaDataFim);
  }
}
