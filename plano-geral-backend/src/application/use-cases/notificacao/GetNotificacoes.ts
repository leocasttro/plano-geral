import {NotificacaoRepository} from '../../../domain/repositories/NotificacaoRepository';

export class GetNotificacoes {
  constructor(private notificacaoRepository: NotificacaoRepository) {}

  async execute(input: { usuarioId: string }) {
    return this.notificacaoRepository.findByUsuario(input.usuarioId);
  }
}
