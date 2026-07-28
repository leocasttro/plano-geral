import { Notificacao } from '../../domain/entities/Notificacao';

export type NotificacaoDTOProps = {
  id: string;
  usuarioId: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  link: string | null;
  lida: boolean;
  createdAt: Date;
};

export class NotificacaoDTO {
  static fromDomain(notificacao: Notificacao): NotificacaoDTOProps {
    return {
      id: notificacao.id,
      usuarioId: notificacao.usuarioId,
      tipo: notificacao.tipo,
      titulo: notificacao.titulo,
      mensagem: notificacao.mensagem,
      link: notificacao.link,
      lida: notificacao.estaLida(),
      createdAt: notificacao.createdAt,
    };
  }
}
