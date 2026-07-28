import {Notificacao, TipoNotificacao} from '../../domain/entities/Notificacao';
import {NotificacaoRepository} from '../../domain/repositories/NotificacaoRepository';

export class NotificacaoService {
  constructor(private notificacaoRepository: NotificacaoRepository) {}

  async notificarUsuario(input: {
    usuarioId: string;
    tipo: TipoNotificacao;
    titulo: string;
    mensagem: string;
    link?: string | null;
    autorId: string;
  }) {
    if (input.autorId && input.autorId === input.usuarioId) return;

    await this.notificacaoRepository.save(
      Notificacao.criar({
        usuarioId: input.usuarioId,
        tipo: input.tipo,
        titulo: input.titulo,
        mensagem: input.mensagem,
        link: input.link,
      }),
    );
  }

  async notificarUsuarios(input: {
    usuariosIds: string[];
    tipo: TipoNotificacao;
    titulo: string;
    mensagem: string;
    link?: string | null;
    autorId?: string;
  }) {
    const destinatarios = [...new Set(input.usuariosIds)]
      .filter((id) => id && id !== input.autorId);

    if (!destinatarios.length) return;

    await this.notificacaoRepository.saveMany(
      destinatarios.map((usuarioId) =>
        Notificacao.criar({
          usuarioId,
          tipo: input.tipo,
          titulo: input.titulo,
          mensagem: input.mensagem,
          link: input.link,
        }),
      ),
    );
  }
}
