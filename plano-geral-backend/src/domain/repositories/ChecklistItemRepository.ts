import { CheckListItem } from "../entities/ChecklistItem";

export interface ChecklistItemRepository {
  listByTarefaId(tarefaId: string): Promise<CheckListItem[]>;
  findById(id: string): Promise<{ item: CheckListItem; tarefaId: string} | null>;
  save(item: CheckListItem, tarefaId: string): Promise<void>;
  delete(id: string): Promise<void>;
}
