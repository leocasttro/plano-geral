import { GetNotificacoes } from '../../../application/use-cases/notificacao/GetNotificacoes';
import { GetTotalNotificacoesNaoLidas } from '../../../application/use-cases/notificacao/GetTotalNotificacoesNaoLidas';
import { MarcarNotificacaoComoLida } from '../../../application/use-cases/notificacao/MarcarNotificacaoComoLida';
import { NotificacaoTypeORMRepository } from '../../database/typeorm/entities/repositories/NotificacaoTypeORMRepository';
import { NotificacoesController } from '../controllers/NotificacoesController';

export function makeNotificacoesController() {
  const notificacaoRepository = new NotificacaoTypeORMRepository();

  return new NotificacoesController({
    getNotificacoes: new GetNotificacoes(notificacaoRepository),
    getTotalNaoLidas: new GetTotalNotificacoesNaoLidas(notificacaoRepository),
    marcarComoLida: new MarcarNotificacaoComoLida(notificacaoRepository),
  });
}
