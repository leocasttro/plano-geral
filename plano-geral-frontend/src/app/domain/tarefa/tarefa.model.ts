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
  status: StatusTarefa;
  prioridade: Prioridade;
  responsavel?: string;
  checklist: ChecklistItemDTO[];
  atividades: AtividadeDTO[];
}
