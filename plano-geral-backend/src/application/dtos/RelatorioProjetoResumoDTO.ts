import { Prioridade } from '../../domain/value-objects/Prioridade';

export type ResponsavelResumoProjetoDTO = {
  usuario: string;
  totalTarefas: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  atrasadas: number;
};

export type RelatorioProjetoResumoDTO = {
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
  porPrioridade: Record<Prioridade, number>;
  responsaveis: ResponsavelResumoProjetoDTO[];
};
