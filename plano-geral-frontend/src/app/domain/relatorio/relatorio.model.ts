export interface RelatorioDashboardDTO {
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
  fluxoCumulativo: {
    data: string;
    pendentes: number;
    emAndamento: number;
    concluidas: number;
  }[];
}

export interface RelatorioCargaUsuariosDTO {
  totalUsuarios: number;
  usuarios: {
    usuarioId: string;
    nome: string;
    email: string;
    totalTarefas: number;
    pendentes: number;
    emAndamento: number;
    concluidas: number;
    atrasadas: number;
    projetos: number;
  }[];
}

export interface RelatorioProjetoResumoDTO {
  projetoId: string;
  nome: string;
  descricao?: string;
  status: string;
  progresso: number;
  totalTarefas: number;
  tarefasPendentes: number;
  tarefasEmAndamento: number;
  tarefasConcluidas: number;
  tarefasAtrasadas: number;
  porPrioridade: {
    BAIXA: number;
    MEDIA: number;
    ALTA: number;
    CRITICA: number;
  };
  responsaveis: {
    usuario: string;
    totalTarefas: number;
    pendentes: number;
    emAndamento: number;
    concluidas: number;
    atrasadas: number;
  }[];
}

export interface RelatorioMetricasProjetosDTO {
  projetos: {
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
  }[];
}

export interface RelatorioCalendarioTarefasDTO {
  periodo: {
    inicio: string | null;
    fim: string | null;
  };
  total: number;
  tarefas: TarefaCalendarioDTO[];
}

export interface TarefaCalendarioDTO {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: string;
  responsavelId: string | null;
  projetoId: string | null;
  projeto: {
    id: string;
    nome: string;
  } | null;
  dataInicio: string;
  dataFim: string;
  diasDuracao: number;
  atrasada: boolean;
}

export interface RelatorioAlteracoesDatasDTO {
  tarefaId: string;
  titulo: string;
  dataInicialAtual: string | null;
  dataFimAtual: string | null;
  totalAlteracoes: number;
  alteracoes: {
    id: string;
    usuario: string;
    descricao: string;
    dataAlteracao: string;
  }[];
}

export interface TempoTarefaResponsavelDTO {
  responsavel: string;
  inicio: string;
  fim: string;
  duracaoHoras: number;
}

export interface TarefaUsuarioDetalhe {
  id: string;
  titulo: string;
  status: string;
  prioridade: string;
  dataInicio?: string | null;
  dataFim?: string | null;
  dataInicioFormatada: string;
  dataFimFormatada: string;
  totalAlteracoesDatas: number;
  tempoComUsuarioHoras: number;
  tempoComUsuarioFormatado: string;
}

export interface RelatorioTempoConclusaoPorTituloDTO {
  titulo: string;
  totalTarefas: number;
  totalConcluidas: number;
  tempoMedioHoras: number | null;
  tempoMedioDias: number | null;
  tarefas: {
    tarefaId: string;
    titulo: string;
    status: string;
    criadaEm: string | null;
    concluidaEm: string | null;
    duracaoHoras: number | null;
    duracaoDias: number | null;
  }[];
}

export interface RelatorioTempoMedioPorTituloDTO {
  totalTitulos: number;
  titulos: MetricaTituloTarefaDTO[];
}

export interface MetricaTituloTarefaDTO {
  titulo: string;
  totalTarefas: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  tarefasComTempoCalculado: number;
  tempoMedioHoras: number | null;
  percentualConclusao: number;
  tarefas: {
    tarefaId: string;
    status: string;
    prioridade: string;
    projetoNome: string | null;
    criadaEm: string | null;
    concluidaEm: string | null;
    duracaoHoras: number | null;
    dataInicio: string | null;
    dataFim: string | null;
  }[];
}
