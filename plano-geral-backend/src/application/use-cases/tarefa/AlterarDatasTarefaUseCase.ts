// src/application/use-cases/tarefa/AlterarDatasTarefaUseCase.ts
import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';
import { TarefaComPrazo } from '../../../domain/entities/TarefaComPrazo';
import { Tarefa } from '../../../domain/entities/Tarefa';
import { Periodo } from '../../../domain/value-objects/Periodo';

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

    // Se não é, cria um período e converte (apenas isso!)
    const periodo = new Periodo(input.dataInicio, input.dataFim);

    // Criar TarefaComPrazo com os mesmos dados
    const tarefaComPrazo = new TarefaComPrazo(
      tarefa.id,
      tarefa.titulo,
      tarefa.descricao,
      periodo
    );

    // Copiar status, prioridade, etc (usando os getters)
    Object.assign(tarefaComPrazo, {
      status: tarefa.obterStatus(),
      prioridade: tarefa.obterPrioridade(),
      responsavel: tarefa.obterResponsavel(),
      checklist: tarefa.obterChecklist(),
      atividades: tarefa.obterAtividades()
    });

    await this.tarefaRepository.save(tarefaComPrazo);

    return tarefaComPrazo;
  }
}
