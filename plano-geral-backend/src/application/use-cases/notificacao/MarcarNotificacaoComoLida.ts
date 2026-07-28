import {NotificacaoRepository} from '../../../domain/repositories/NotificacaoRepository';

export class MarcarNotificacaoComoLida {
  constructor(private notificacaoRepository: NotificacaoRepository) {}

  async execute(input: { notificacaoId: string, usuarioId: string }) {
    const notificacao = await this.notificacaoRepository.findById(input.notificacaoId);

    if (!notificacao) {
      throw new Error('Notificação não encontrada');
    }

    if (notificacao.usuarioId !== input.usuarioId) {
      throw new Error('Você não pode alterar esta notificacao');
    }

    notificacao.marcarComoLida();

    await this.notificacaoRepository.save(notificacao);

    return notificacao;
  }
}
