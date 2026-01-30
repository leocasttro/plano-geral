import { CheckListItem } from "../../../../domain/entities/ChecklistItem";
import { ChecklistItemORM } from "../entities/ChecklistItemORM";

export class ChecklistItemMapper {
  static toDomain(row: ChecklistItemORM): CheckListItem {
    return CheckListItem.reconstituir ? CheckListItem.reconstituir({
      id: row.id,
      nome: row.nome,
      concluido: row.concluido,
    } as any) : new CheckListItem(row.id, row.nome, row.concluido);
  }


  static toORM(item: CheckListItem, tarefaId: string): ChecklistItemORM {
    const row = new ChecklistItemORM();
    row.id = item.id;
    row.tarefa_id = tarefaId;
    row.nome = item.nome;
    row.concluido = item.isConcluido();
    return row;
  }
}
