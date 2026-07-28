import {NotificacaoRepository} from '../../../domain/repositories/NotificacaoRepository';

export class GetTotalNotificacoesNaoLidas {
  constructor(private notificacaoRepository: NotificacaoRepository) {}

  async execute(input: { usuarioId: string }) {
    return this.notificacaoRepository.countNaoLidas(input.usuarioId);
  }
}
