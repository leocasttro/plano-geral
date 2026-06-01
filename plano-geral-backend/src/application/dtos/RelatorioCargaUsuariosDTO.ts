export type CargaUsuarioDTO = {
  usuarioId: string;
  nome: string;
  email: string;
  totalTarefas: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  atrasadas: number;
  projetos: number;
};

export type RelatorioCargaUsuariosDTO = {
  totalUsuarios: number;
  usuarios: CargaUsuarioDTO[];
};
