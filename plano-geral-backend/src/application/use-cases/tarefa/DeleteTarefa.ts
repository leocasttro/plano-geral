import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';
import { NotificacaoService } from '../../services/NotificacaoService';

export class DeleteTarefa {
  constructor(
    private tarefaRepository: TarefaRepository,
    private notificacaoService: NotificacaoService,
  ) {}

  async execute(input: { tarefaId: string; usuarioId: string }): Promise<void> {
    const tarefa = await this.tarefaRepository.findById(input.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    const responsavelId = tarefa.obterResponsavel();

    await this.tarefaRepository.delete(input.tarefaId);

    if (responsavelId) {
      await this.notificacaoService.notificarUsuario({
        usuarioId: responsavelId,
        autorId: input.usuarioId,
        tipo: 'TAREFA_APAGADA',
        titulo: 'Tarefa apagada',
        mensagem: `A tarefa "${tarefa.titulo}" foi apagada.`,
        link: null,
      });
    }
  }
}
