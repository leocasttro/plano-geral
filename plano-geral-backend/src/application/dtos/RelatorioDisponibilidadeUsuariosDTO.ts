export type StatusDisponibilidade =
  | 'DISPONIVEL'
  | 'OCUPADO'
  | 'SEM_DADOS';

export type DisponibilidadeUsuarioDTO = {
  usuarioId: string;
  nome: string;
  email: string;
  tarefasAbertas: number;
  tarefasComData: number;
  tarefasSemData: number;
  tarefasAtrasadas: number;
  ocupadoAte: string | null;
  disponivelEm: string;
  proximaTarefaProgramada: {
    tarefaId: string;
    titulo: string;
    dataInicio: string;
    dataFim: string;
  } | null;
  statusDisponibilidade: StatusDisponibilidade;
};

export type RelatorioDisponibilidadeUsuariosDTO = {
  totalUsuarios: number;
  usuarios: DisponibilidadeUsuarioDTO[];
};
