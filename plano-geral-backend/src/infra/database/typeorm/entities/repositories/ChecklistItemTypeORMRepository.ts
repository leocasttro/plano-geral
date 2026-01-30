import { Repository } from "typeorm";
import { ChecklistItemRepository } from "../../../../../domain/repositories/ChecklistItemRepository";
import { ChecklistItemORM } from "../ChecklistItemORM";
import { AppDataSource } from "../../../data-source";
import { CheckListItem } from "../../../../../domain/entities/ChecklistItem";
import { ChecklistItemMapper } from "../../mappers/ChecklistItemMapper";

export class ChecklistItemTypeORMRepository implements ChecklistItemRepository {
  private ormRepo: Repository<ChecklistItemORM>;

  constructor() {
    this.ormRepo = AppDataSource.getRepository(ChecklistItemORM);
  }

  async listByTarefaId(tarefaId: string): Promise<CheckListItem[]> {
    const rows = await this.ormRepo.find({
      where: { tarefa_id: tarefaId },
      order: { createdAt: 'DESC' },
    })
    return rows.map(ChecklistItemMapper.toDomain);
  }

  async findById(id: string): Promise<{ item: CheckListItem; tarefaId: string } | null> {
    const row = await this.ormRepo.findOne({ where: { id } });
    if (!row) return null;

    return {
      item: ChecklistItemMapper.toDomain(row),
      tarefaId: row.tarefa_id,
    };
  }

  async save(item: CheckListItem, tarefaId: string): Promise<void> {
    const row = ChecklistItemMapper.toORM(item, tarefaId);
    await this.ormRepo.save(row);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepo.delete({ id });
  }
}
