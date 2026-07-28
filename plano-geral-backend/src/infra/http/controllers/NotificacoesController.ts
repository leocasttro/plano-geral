import { Request, Response } from 'express';
import { NotificacaoDTO } from '../../../application/dtos/NotificacaoDTO';
import { GetNotificacoes } from '../../../application/use-cases/notificacao/GetNotificacoes';
import { GetTotalNotificacoesNaoLidas } from '../../../application/use-cases/notificacao/GetTotalNotificacoesNaoLidas';
import { MarcarNotificacaoComoLida } from '../../../application/use-cases/notificacao/MarcarNotificacaoComoLida';

type Deps = {
  getNotificacoes: GetNotificacoes;
  getTotalNaoLidas: GetTotalNotificacoesNaoLidas;
  marcarComoLida: MarcarNotificacaoComoLida;
};

export class NotificacoesController {
  constructor(private deps: Deps) {}

  async listar(req: Request, res: Response) {
    const notificacoes = await this.deps.getNotificacoes.execute({
      usuarioId: req.user.id,
    });

    return res.json(notificacoes.map(NotificacaoDTO.fromDomain));
  }

  async totalNaoLidas(req: Request, res: Response) {
    const total = await this.deps.getTotalNaoLidas.execute({
      usuarioId: req.user.id,
    });

    return res.json({ total });
  }

  async marcarComoLida(req: Request, res: Response) {
    try {
      const notificacao = await this.deps.marcarComoLida.execute({
        notificacaoId: req.params.id,
        usuarioId: req.user.id,
      });

      return res.json(NotificacaoDTO.fromDomain(notificacao));
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
