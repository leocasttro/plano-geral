import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';

export class ApagarComentario {
  constructor(private tarefaRepository: TarefaRepository) {}

  async execute(input: {
    tarefaId: string;
    atividadeId: string;
    usuarioAcao: string;
  }): Promise<void> {
    const tarefa = await this.tarefaRepository.findById(input.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    tarefa.apagarComentario(input.atividadeId, input.usuarioAcao);

    await this.tarefaRepository.save(tarefa);
  }
}
