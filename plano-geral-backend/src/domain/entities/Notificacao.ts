import { randomUUID } from 'crypto';

export type TipoNotificacao =
  | 'COMENTARIO_TAREFA'
  | 'ATRIBUICAO_TAREFA'
  | 'TAREFA_APAGADA'
  | 'TAREFA_ANDAMENTO'
  | 'SOLICITACAO_DATA'
  | 'SOLICITACAO_DATA_APROVADA'
  | 'SOLICITACAO_DATA_REPROVADA'
  | 'DISPONIBILIDADE_SEMANAL';

export class Notificacao {
  constructor(
    public readonly id: string,
    public readonly usuarioId: string,
    public readonly tipo: TipoNotificacao,
    public readonly titulo: string,
    public readonly mensagem: string,
    public readonly link: string | null,
    public lida: boolean,
    public readonly createdAt: Date,
  ) {}

  static criar(input: {
    usuarioId: string;
    tipo: TipoNotificacao;
    titulo: string;
    mensagem: string;
    link?: string | null;
  }) {
    return new Notificacao(
      randomUUID(),
      input.usuarioId,
      input.tipo,
      input.titulo,
      input.mensagem,
      input.link ?? null,
      false,
      new Date(),
    );
  }

  marcarComoLida() {
    this.lida = true;
  }

  estaLida() {
    return this.lida
  }
}
