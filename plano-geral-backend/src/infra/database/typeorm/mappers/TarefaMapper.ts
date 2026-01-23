import { Tarefa } from "../../../../domain/entities/Tarefa";
import { Prioridade } from "../../../../domain/value-objects/Prioridade";
import { StatusTarefa } from "../../../../domain/value-objects/StatusTarefa";
import { TarefaORM } from "../entities/TarefaORM";

export class TarefaMapper {

  constructor() {

  }

  static toORM(tarefa: Tarefa): TarefaORM {
    const row = new TarefaORM();

    row.id = tarefa.id;
    row.titulo = tarefa.titulo;
    row.descricao = tarefa.descricao ?? null as any;
    row.status = tarefa.obterStatus();
    row.prioridade = tarefa.obterPrioridade();
    row.responsavel = tarefa.obterResponsavel() ?? null as any;

    return row;
  }

  static toDomain(row: TarefaORM): Tarefa {
    return Tarefa.reconstituir({
      id: row.id,
      titulo: row.titulo,
      descricao: row.descricao ?? null as any,
      status: row.status as StatusTarefa,
      prioridade: row.prioridade as Prioridade,
      checklist: [],
      atividades: [],
    });
  }
}
