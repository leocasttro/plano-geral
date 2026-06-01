export type StatusTarefa =
  | 'PENDENTE'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDO';

export type Prioridade =
  | 'BAIXA'
  | 'NORMAL'
  | 'ALTA'
  | 'CRITICA';

export interface ChecklistItemDTO {
  id: string;
  nome: string;
  concluido: boolean;
}

export interface AtividadeDTO {
  id: string;
  tipo: string;
  usuario: string;
  descricao: string;
  data: string;
}

export interface TarefaDTO {
  id: string;
  titulo: string;
  descricao?: string;
  dataInicio?: string | null;
  dataFim?: string | null;
  status: StatusTarefa;
  prioridade: Prioridade;
  responsavelId?: string | null;
  responsavel?: ResponsavelTarefaDTO | null;
  checklist: ChecklistItemDTO[];
  atividades: AtividadeDTO[];
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil?: string;
  ativo: boolean;
}

export interface ResponsavelTarefaDTO {
  id: string;
  nome: string;
  email: string;
}
