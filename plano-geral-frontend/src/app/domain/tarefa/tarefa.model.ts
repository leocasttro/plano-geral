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
  tituloCatalogoId?: string | null;
  componenteCatalogo?: string | null;
  descricao?: string;
  dataInicio?: string | null;
  dataFim?: string | null;
  status: StatusTarefa;
  prioridade: Prioridade;
  criadorId?: string | null;
  responsaveisIds: string[];
  responsaveis: ResponsavelTarefaDTO[];

  projetoId?: string | null;
  projeto?: ProjetoResumoDTO | null;

  checklist: ChecklistItemDTO[];
  atividades: AtividadeDTO[];

  isMacroTarefa: boolean;
  tarefaPaiId?: string | null;
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

export interface ProjetoResumoDTO {
  id: string;
  nome: string;
  centroCusto?: string | null;
}
