// src/application/use-cases/tarefa/AlterarDatasTarefaUseCase.ts
import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';
import { TarefaComPrazo } from '../../../domain/entities/TarefaComPrazo';
import { Tarefa } from '../../../domain/entities/Tarefa';

interface AlterarDatasInput {
  tarefaId: string;
  dataInicio?: Date;
  dataFim?: Date;
  usuario: string;
  justificativa?: string;
}

export class AlterarDatasTarefaUseCase {
  constructor(private tarefaRepository: TarefaRepository) {}

  async execute(input: AlterarDatasInput): Promise<Tarefa> {
    const tarefa = await this.tarefaRepository.findById(input.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    if (tarefa instanceof TarefaComPrazo) {
      tarefa.alterarDatas(input.dataInicio, input.dataFim, input.usuario, input.justificativa,);
      await this.tarefaRepository.save(tarefa);
      return tarefa;
    }

    const tarefaComPrazo = tarefa.converterParaPrazo(
      input.dataInicio,
      input.dataFim,
    );

    await this.tarefaRepository.save(tarefaComPrazo);

    return tarefaComPrazo;
  }
}
