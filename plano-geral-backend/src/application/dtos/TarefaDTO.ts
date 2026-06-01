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

export interface TarefaDTOProps {
  id: string;
  titulo: string;
  descricao?: string;
  dataInicio?: Date | null;
  dataFim?: Date | null;
  status: StatusTarefa;
  prioridade: Prioridade;
  responsavelId?: string | null;
  responsavel?: ResponsavelDTO | null;
  projetoId: string | null;
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
}

export class TarefaDTO {
  static fromDomain(
    tarefa: Tarefa,
    responsavel?: ResponsavelDTO | null,
  ): TarefaDTOProps {
    let dataInicio: Date | null = null;
    let dataFim: Date | null = null;

    if (tarefa instanceof TarefaComPrazo) {
      dataInicio = tarefa.getPeriodo().getInicio();
      dataFim = tarefa.getPeriodo().getFim();
    }

    const responsavelId = tarefa.obterResponsavel() ?? null;

    return {
      id: tarefa.id,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      dataInicio,
      dataFim,
      status: tarefa.obterStatus(),
      prioridade: tarefa.obterPrioridade(),
      responsavelId,
      responsavel: responsavel ?? null,
      projetoId: tarefa.obterProjetoId(),
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
    };
  }
}
