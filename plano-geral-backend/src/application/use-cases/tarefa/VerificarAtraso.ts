import { TarefaComPrazo } from '../../../domain/entities/TarefaComPrazo';
import { TarefaRepository } from './../../../domain/repositories/TarefaRepository';

export class VerificarAtraso {
  constructor(private tarefaRepository: TarefaRepository) {}

  async execute(id: string): Promise<any> {
    const tarefa = await this.tarefaRepository.findById(id);

    if (!(tarefa instanceof TarefaComPrazo)) {
      return { atrasada: false, mensagem: 'Tarefa sem prazo definido!'};
    }

    return {
      atrasada: tarefa.estaAtrasada(),
      dias: tarefa.diasParaVencer()
    }
  }
}
