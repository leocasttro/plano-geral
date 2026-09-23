import { Atividade } from '../../domain/entities/Atividade';
import { CheckListItem } from '../../domain/entities/ChecklistItem';
import { Tarefa } from '../../domain/entities/Tarefa';
import { TarefaComPrazo } from '../../domain/entities/TarefaComPrazo';
import { Prioridade } from '../../domain/value-objects/Prioridade';
import { StatusTarefa } from '../../domain/value-objects/StatusTarefa';

type ResponsavelDTO = {
  id: string;
  nome: string;
  email: string;
};

type ProjetoResumoDTO = {
  id: string;
  nome: string;
  centroCusto?: string | null;
};

export interface TarefaDTOProps {
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
  responsaveis: ResponsavelDTO[];
  projetoId: string | null;
  projeto?: ProjetoResumoDTO | null;
  checklist: {
    id: string;
    nome: string;
    concluido: boolean;
  }[];
  atividades: {
    id: string;
    tipo: string;
    usuario: string;
    descricao: string;
    data: Date;
  }[];
  isMacroTarefa: boolean;
  tarefaPaiId?: string | null;
}

function formatDateOnly(data: Date | null): string | null {
  if (!data) return null;

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

export class TarefaDTO {
  static fromDomain(
    tarefa: Tarefa,
    responsaveis: ResponsavelDTO[] = [],
  ): TarefaDTOProps {
    let dataInicio: Date | null = null;
    let dataFim: Date | null = null;

    if (tarefa instanceof TarefaComPrazo) {
      dataInicio = tarefa.getPeriodo().getInicio();
      dataFim = tarefa.getPeriodo().getFim();
    }

    const responsaveisIds = tarefa.obterResponsaveis();

    return {
      id: tarefa.id,
      titulo: tarefa.titulo,
      tituloCatalogoId: tarefa.obterTituloCatalogoId(),
      componenteCatalogo: tarefa.obterTituloCatalogo()?.componente ?? null,
      descricao: tarefa.descricao,
      dataInicio: formatDateOnly(dataInicio),
      dataFim: formatDateOnly(dataFim),
      status: tarefa.obterStatus(),
      prioridade: tarefa.obterPrioridade(),
      criadorId: tarefa.obterCriador() ?? null,
      responsaveisIds,
      responsaveis: responsaveis,
      projetoId: tarefa.obterProjetoId(),
      projeto: tarefa.obterProjeto(),
      checklist: tarefa.obterChecklist().map((item: CheckListItem) => ({
        id: item.id,
        nome: item.nome,
        concluido: item.isConcluido(),
      })),
      atividades: tarefa.obterAtividades().map((atividade: Atividade) => ({
        id: atividade.id,
        tipo: atividade.tipo,
        usuario: atividade.usuario,
        descricao: atividade.descricao,
        data: atividade.data,
      })),
      isMacroTarefa: tarefa.obterIsMacroTarefa(),
      tarefaPaiId: tarefa.obterTarefaPaiId(),
    };
  }
}
