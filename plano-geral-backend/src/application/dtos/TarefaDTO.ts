import { Atividade } from "../../domain/entities/Atividade";
import { CheckListItem } from "../../domain/entities/ChecklistItem";
import { Tarefa } from "../../domain/entities/Tarefa";
import { Prioridade } from "../../domain/value-objects/Prioridade";
import { StatusTarefa } from "../../domain/value-objects/StatusTarefa";

export interface TarefaDTOProps {
  id: string;
  titulo: string;
  descricao?: string;
  status: StatusTarefa;
  prioridade: Prioridade;
  responsavel?: string;
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
  static fromDomain(tarefa: Tarefa): TarefaDTOProps {
    return {
      id: tarefa.id,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      status: tarefa.obterStatus(),
      prioridade: tarefa['prioridade'], // acesso controlado via DTO
      responsavel: tarefa['responsavel'],
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
