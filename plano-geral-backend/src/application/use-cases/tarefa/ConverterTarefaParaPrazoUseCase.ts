// src/application/use-cases/tarefa/ConverterTarefaParaPrazo.ts
import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';
import { TarefaComPrazo } from '../../../domain/entities/TarefaComPrazo';

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

    // 3. Converter para TarefaComPrazo preservando os dados da tarefa original
    const tarefaComPrazo = tarefaExistente.converterParaPrazo(
      input.dataInicio,
      input.dataFim,
    );

    // 4. Registrar a conversão
    tarefaComPrazo.alterarDatas(input.dataInicio, input.dataFim, input.usuario);

    // 5. Salvar (vai substituir a antiga)
    await this.tarefaRepository.save(tarefaComPrazo);

    return tarefaComPrazo;
  }
}
