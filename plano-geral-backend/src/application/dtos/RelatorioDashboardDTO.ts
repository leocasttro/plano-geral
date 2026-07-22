export type RelatorioDashboardDTO = {
  projetos: {
    total: number;
    ativos: number;
    pausados: number;
    concluidos: number;
    cancelados: number;
  };
  tarefas: {
    total: number;
    pendentes: number;
    emAndamento: number;
    concluidas: number;
    atrasadas: number;
  };
  usuarios: {
    total: number;
    ativos: number;
  };
  produtividade: {
    tarefasCriadasUltimos15Dias: number;
    tarefasConcluidasUltimos15Dias: number;

    periodo: '15d' | '30d' | '90d' | 'ano';
    periodoLabel: string;
    tarefasCriadasPeriodo: number;
    tarefasConcluidasPeriodo: number;
  };
  fluxoCumulativo: FluxoCumulativoDiaDTO[]
};

export type FluxoCumulativoDiaDTO = {
  data: string;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
};
