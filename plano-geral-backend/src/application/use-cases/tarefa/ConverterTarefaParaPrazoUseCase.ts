// src/application/use-cases/tarefa/ConverterTarefaParaPrazo.ts
import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';
import { TarefaComPrazo } from '../../../domain/entities/TarefaComPrazo';
import { Periodo } from '../../../domain/value-objects/Periodo';

interface ConverterParaPrazoInput {
  tarefaId: string;
  dataInicio?: Date;
  dataFim?: Date;
  usuario: string;
}

export class ConverterTarefaParaPrazoUseCase {
  constructor(private tarefaRepository: TarefaRepository) {}

  async execute(input: ConverterParaPrazoInput): Promise<TarefaComPrazo> {
    // 1. Buscar a tarefa existente
    const tarefaExistente = await this.tarefaRepository.findById(input.tarefaId);

    if (!tarefaExistente) {
      throw new Error('Tarefa não encontrada');
    }

    // 2. Se já for com prazo, apenas atualiza
    if (tarefaExistente instanceof TarefaComPrazo) {
      tarefaExistente.alterarDatas(input.dataInicio, input.dataFim, input.usuario);
      await this.tarefaRepository.save(tarefaExistente);
      return tarefaExistente;
    }

    // 3. Converter para TarefaComPrazo
    const periodo = new Periodo(input.dataInicio, input.dataFim);
    const tarefaComPrazo = new TarefaComPrazo(
      tarefaExistente.id,
      tarefaExistente.titulo,
      tarefaExistente.descricao,
      periodo
    );

    // 4. Copiar os dados da tarefa original
    // Você precisará de métodos para isso ou usar reflection
    Object.assign(tarefaComPrazo, {
      status: tarefaExistente.obterStatus(),
      prioridade: tarefaExistente.obterPrioridade(),
      responsavel: tarefaExistente.obterResponsavel(),
      checklist: tarefaExistente.obterChecklist(),
      atividades: tarefaExistente.obterAtividades()
    });

    // 5. Registrar a conversão
    tarefaComPrazo.alterarDatas(input.dataInicio, input.dataFim, input.usuario);

    // 6. Salvar (vai substituir a antiga)
    await this.tarefaRepository.save(tarefaComPrazo);

    return tarefaComPrazo;
  }
}
