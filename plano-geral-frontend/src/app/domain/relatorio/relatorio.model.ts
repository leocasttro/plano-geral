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
  };
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
  totalAlteracoesDatas: number;
  tempoComUsuarioHoras: number;
}
