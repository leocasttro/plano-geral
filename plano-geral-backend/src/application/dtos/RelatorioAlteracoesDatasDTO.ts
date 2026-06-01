export type AlteracaoDatasDTO = {
  id: string;
  usuario: string;
  descricao: string;
  dataAlteracao: Date;
};

export type RelatorioAlteracoesDatasDTO = {
  tarefaId: string;
  titulo: string;
  dataInicialAtual: Date | null;
  dataFimAtual: Date | null;
  totalAlteracoes: number;
  alteracoes: AlteracaoDatasDTO[];
};
