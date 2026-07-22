export type MetricaProjetoDTO = {
  projetoId: string;
  nome: string;
  centroCusto: string | null;
  status: string;
  totalTarefas: number;
  tarefasEmAndamento: number;
  tarefasConcluidas: number;
  tarefasComPrazo: number;
  tarefasDentroDoPrazo: number;
  tarefasForaDoPrazo: number;
  tarefasAtrasadas: number;
  percentualConclusao: number;
  percentualRespeitoPrazo: number;
  indiceAvanco: number;
  avancou: boolean;
};

export type RelatorioMetricasProjetosDTO = {
  projetos: MetricaProjetoDTO[];
};
