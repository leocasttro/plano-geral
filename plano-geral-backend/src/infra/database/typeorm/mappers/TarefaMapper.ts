import { Atividade } from '../../../../domain/entities/Atividade';
import { Tarefa } from '../../../../domain/entities/Tarefa';
import { CheckListItem } from '../../../../domain/entities/ChecklistItem';
import { Prioridade } from '../../../../domain/value-objects/Prioridade';
import { StatusTarefa } from '../../../../domain/value-objects/StatusTarefa';
import { TipoAtividade } from '../../../../domain/value-objects/TipoAtividade';

import { AtividadeORM } from '../entities/AtividadeORM';
import { ChecklistItemORM } from '../entities/ChecklistItemORM';
import { TarefaORM } from '../entities/TarefaORM';

export class TarefaMapper {
  static toORM(tarefa: Tarefa): TarefaORM {
    const row = new TarefaORM();

    row.id = tarefa.id;
    row.titulo = tarefa.titulo;
    row.descricao = tarefa.descricao ?? (null as any);
    row.status = tarefa.obterStatus();
    row.prioridade = tarefa.obterPrioridade();
    row.responsavel = tarefa.obterResponsavel() ?? (null as any);

    // ✅ atividades
    row.atividades = tarefa.obterAtividades().map((a) => {
      const act = new AtividadeORM();
      act.id = a.id;
      act.tipo = a.tipo;
      act.usuario = a.usuario;
      act.descricao = a.descricao;
      act.tarefa_id = row.id;
      return act;
    });

    row.checklist = tarefa.obterChecklist().map((c) => {
      const item = new ChecklistItemORM();
      item.id = c.id;
      item.nome = c.nome;
      item.concluido = c.isConcluido();

      item.tarefa = row;
      item.tarefa_id = row.id;

      return item;
    });

    return row;
  }

  static toDomain(row: TarefaORM): Tarefa {
    const atividades = (row.atividades ?? []).map(
      (a: AtividadeORM) =>
        Atividade.reconstituir?.({
          id: a.id,
          tipo: a.tipo as TipoAtividade,
          usuario: a.usuario,
          descricao: a.descricao,
          data: a.createdAt,
        }) ?? new Atividade(a.id, a.tipo as any, a.usuario, a.descricao),
    );

    const checklist = (row.checklist ?? []).map((c: ChecklistItemORM) =>
      CheckListItem.reconstituir
        ? CheckListItem.reconstituir({
            id: c.id,
            nome: c.nome,
            concluido: c.concluido,
          } as any)
        : new CheckListItem(c.id, c.nome, c.concluido),
    );

    return Tarefa.reconstituir({
      id: row.id,
      titulo: row.titulo,
      descricao: row.descricao ?? (null as any),
      status: row.status as StatusTarefa,
      prioridade: row.prioridade as Prioridade,
      checklist,
      atividades,
    });
  }
}
