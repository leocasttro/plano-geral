import {
  Notificacao,
  TipoNotificacao,
} from '../../../../domain/entities/Notificacao';
import { NotificacaoORM } from '../entities/NotificacaoORM';

export class NotificacaoMapper {
  static toORM(domain: Notificacao): NotificacaoORM {
    const orm = new NotificacaoORM();

    orm.id = domain.id;
    orm.usuarioId = domain.usuarioId;
    orm.tipo = domain.tipo;
    orm.titulo = domain.titulo;
    orm.mensagem = domain.mensagem;
    orm.link = domain.link;
    orm.lida = domain.estaLida();
    orm.createdAt = domain.createdAt;

    return orm;
  }

  static toDomain(orm: NotificacaoORM): Notificacao {
    return new Notificacao(
      orm.id,
      orm.usuarioId,
      orm.tipo as TipoNotificacao,
      orm.titulo,
      orm.mensagem,
      orm.link,
      orm.lida,
      orm.createdAt,
    );
  }
}
