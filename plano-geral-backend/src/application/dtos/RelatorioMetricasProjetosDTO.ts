export type MetricaProjetoDTO = {
  projetoId: string;
  nome: string;
  centroCusto: string | null;
  status: string;
  saudeProjeto: 'SAUDAVEL' | 'ATENCAO' | 'CRITICO';
  riscoAtraso: 'BAIXO' | 'MEDIO' | 'ALTO';
  totalTarefas: number;
  tarefasPendentes: number;
  tarefasEmAndamento: number;
  tarefasConcluidas: number;
  tarefasComPrazo: number;
  tarefasDentroDoPrazo: number;
  tarefasForaDoPrazo: number;
  tarefasAtrasadas: number;
  tarefasSemResponsavel: number;
  tarefasSemData: number;
  tarefasCriticasAbertas: number;
  tarefasVencemEm7Dias: number;
  tarefasParadasMaisDe7Dias: number;
  totalAlteracoesDatas: number;
  tarefasComDatasAlteradas: number;
  mediaAlteracoesPorTarefa: number;
  throughputUltimos30Dias: number;
  leadTimeMedioHoras: number | null;
  cycleTimeMedioHoras: number | null;
  tempoEsperaMedioHoras: number | null;
  tempoExecucaoMedioHoras: number | null;
  percentualTarefasAtrasadas: number;
  percentualConclusao: number;
  percentualRespeitoPrazo: number;
  indiceAvanco: number;
  avancou: boolean;
  responsaveis: {
    usuarioId: string;
    totalTarefas: number;
    pendentes: number;
    emAndamento: number;
    concluidas: number;
    atrasadas: number;
    percentualConclusao: number;
  }[];
  prioridade: {
    BAIXA: number;
    MEDIA: number;
    ALTA: number;
    CRITICA: number;
  };
  burndown: {
    data: string;
    criadas: number;
    concluidas: number;
    restantes: number;
    restanteIdeal: number;
    desvio: number;
  }[];
};

export type RelatorioMetricasProjetosDTO = {
  projetos: MetricaProjetoDTO[];
};
