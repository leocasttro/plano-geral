import { Prioridade } from '../../domain/value-objects/Prioridade';
import { StatusTarefa } from '../../domain/value-objects/StatusTarefa';

export type RelatorioCalendarioTarefaItemDTO = {
  id: string;
  titulo: string;
  descricao?: string;
  status: StatusTarefa;
  prioridade: Prioridade;
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
};

export type RelatorioCalendarioTarefasDTO = {
  periodo: {
    inicio: string | null;
    fim: string | null;
  };
  total: number;
  tarefas: RelatorioCalendarioTarefaItemDTO[];
};
