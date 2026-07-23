export type LeadTimeResumoDTO = {
  totalTarefas: number;
  tarefasComLeadTime: number;
  tarefasSemLeadTime: number;
  tempoMedioHoras: number | null;
  tempoMedioDias: number | null;
};

export type RelatorioLeadTimeDTO = {
  geral: LeadTimeResumoDTO;
  porProjeto: Array<LeadTimeResumoDTO & {
    projetoId: string | null;
    projetoNome: string;
  }>;

  porResponsavel: Array<LeadTimeResumoDTO & {
    responsavelId: string | null;
    responsavelNome: string;
  }>;

  porPeriodo: Array<LeadTimeResumoDTO & {
    periodo: string;
    periodoLabel: string;
  }>;
};
