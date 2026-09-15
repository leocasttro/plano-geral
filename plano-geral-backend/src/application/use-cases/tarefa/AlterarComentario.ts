import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';

export class AlterarComentario {
  constructor(private tarefaRepository: TarefaRepository) {}

  async execute(input: {
    tarefaId: string;
    atividadeId: string;
    novoComentario: string;
    usuarioAcao: string;
  }): Promise<void> {
    const tarefa = await this.tarefaRepository.findById(input.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    tarefa.alterarComentario(input.atividadeId, input.novoComentario, input.usuarioAcao);

    await this.tarefaRepository.save(tarefa);
  }
}
