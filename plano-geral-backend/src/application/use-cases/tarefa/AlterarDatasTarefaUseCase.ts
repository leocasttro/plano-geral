// src/application/use-cases/tarefa/AlterarDatasTarefaUseCase.ts
import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';
import { TarefaComPrazo } from '../../../domain/entities/TarefaComPrazo';
import { Tarefa } from '../../../domain/entities/Tarefa';

interface AlterarDatasInput {
  tarefaId: string;
  dataInicio?: Date;
  dataFim?: Date;
  usuario: string;
}

export class AlterarDatasTarefaUseCase {
  constructor(private tarefaRepository: TarefaRepository) {}

  async execute(input: AlterarDatasInput): Promise<Tarefa> {
    const tarefa = await this.tarefaRepository.findById(input.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    // Se já é TarefaComPrazo, altera as datas
    if (tarefa instanceof TarefaComPrazo) {
      tarefa.alterarDatas(input.dataInicio, input.dataFim, input.usuario);
      await this.tarefaRepository.save(tarefa);
      return tarefa;
    }

    // Criar TarefaComPrazo com os mesmos dados
    const tarefaComPrazo = tarefa.converterParaPrazo(
      input.dataInicio,
      input.dataFim,
    );

    tarefaComPrazo.alterarDatas(
      input.dataInicio,
      input.dataFim,
      input.usuario,
    );

    await this.tarefaRepository.save(tarefaComPrazo);

    return tarefaComPrazo;
  }
}
