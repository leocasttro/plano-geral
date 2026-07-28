export interface NotificacaoDTO {
  id: string;
  usuarioId: string;
  tipo:
    | 'COMENTARIO_TAREFA'
    | 'ATRIBUICAO_TAREFA'
    | 'TAREFA_APAGADA'
    | 'SOLICITACAO_DATA'
    | 'SOLICITACAO_DATA_APROVADA'
    | 'SOLICITACAO_DATA_REPROVADA'
    | 'DISPONIBILIDADE_SEMANAL';
  titulo: string;
  mensagem: string;
  link: string | null;
  lida: boolean;
  createdAt: string;
}

export interface TotalNotificacoesNaoLidasDTO {
  total: number;
}
