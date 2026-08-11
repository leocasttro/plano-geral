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

export interface RelatorioPessoalDTO {
  usuarioId: string;
  resumo: {
    totalTarefas: number;
    pendentes: number;
    emAndamento: number;
    concluidas: number;
    atrasadas: number;
    percentualConclusao: number;
  };
  tarefas: {
    id: string;
    titulo: string;
    status: string;
    prioridade: string;
    projetoNome: string | null;
    dataInicio: string | null;
    dataFim: string | null;
    atrasada: boolean;
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
  responsavelNome: string | null;
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
  componentes: MetricaCatalogoGrupoDTO[];
  atividadesPrincipais: MetricaCatalogoGrupoDTO[];
  subatividades: MetricaCatalogoGrupoDTO[];
  titulos: MetricaTituloTarefaDTO[];
}

export interface MetricaCatalogoGrupoDTO {
  nome: string;
  totalTarefas: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  percentualConclusao: number;
  tempoMedioHoras: number | null;
}

export interface MetricaTituloTarefaDTO {
  titulo: string;
  componente: string | null;
  atividadePrincipal: string | null;
  subatividade: string | null;
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
    iniciadaEm: string | null;
    concluidaEm: string | null;
    duracaoHoras: number | null;
    tempoEsperaHoras: number | null;
    tempoExecucaoHoras: number | null;
    dataInicio: string | null;
    dataFim: string | null;
  }[];
}

export interface LeadTimeResumoDTO {
  totalTarefas: number;
  tarefasComLeadTime: number;
  tarefasSemLeadTime: number;
  tempoMedioHoras: number | null;
  tempoMedioDias: number | null;
}

export interface RelatorioLeadTimeDTO {
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
}

export interface DisponibilidadeUsuarioDTO {
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
  statusDisponibilidade: 'DISPONIVEL' | 'OCUPADO' | 'SEM_DADOS';
}

export interface RelatorioDisponibilidadeUsuariosDTO {
  totalUsuarios: number;
  usuarios: DisponibilidadeUsuarioDTO[];
}
