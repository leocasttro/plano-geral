import { Repository } from "typeorm";
import { TarefaRepository } from "../../../../../domain/repositories/TarefaRepository";
import { TarefaORM } from "../TarefaORM";
import { AppDataSource } from "../../../data-source";
import { Tarefa } from "../../../../../domain/entities/Tarefa";
import { TarefaMapper } from "../../mappers/TarefaMapper";
import { AtividadeORM } from "../AtividadeORM";
import { ChecklistItemORM } from "../ChecklistItemORM";

export class TarefaTypeORMRepository implements TarefaRepository {
  private ormRepo: Repository<TarefaORM>;

  constructor() {
    this.ormRepo = AppDataSource.getRepository(TarefaORM);
  }

  async save(tarefa: Tarefa): Promise<void> {
    const row = TarefaMapper.toORM(tarefa);

    // Fetch existing to find removed items
    const existing = await this.ormRepo.findOne({
      where: { id: tarefa.id },
      relations: { atividades: true, checklist: true }
    });

    if (existing) {
      // Find removed atividades
      const removedAtividades = existing.atividades.filter(
        (ea) => !row.atividades.some((ra) => ra.id === ea.id)
      );
      if (removedAtividades.length > 0) {
        await AppDataSource.getRepository(AtividadeORM).remove(removedAtividades);
      }

      // Find removed checklist
      const removedChecklist = existing.checklist.filter(
        (ec) => !row.checklist.some((rc) => rc.id === ec.id)
      );
      if (removedChecklist.length > 0) {
        await AppDataSource.getRepository(ChecklistItemORM).remove(removedChecklist);
      }
    }

    await this.ormRepo.save(row);
  }

  async findById(id: string): Promise<Tarefa | null> {
    const row = await this.ormRepo.findOne({ where: { id }, relations: { atividades: true, checklist: true,  projeto: true, tituloCatalogo: true }, });
    if (!row) return null;
    return TarefaMapper.toDomain(row);
  }

  async list(): Promise<Tarefa[]> {
    const rows = await this.ormRepo.find({
      relations: { atividades: true, checklist: true,  projeto: true, tituloCatalogo: true },
      order: { createdAt: 'DESC' },
    });
    return rows.map(TarefaMapper.toDomain)
  }

  async delete(id: string): Promise<void> {
    await this.ormRepo.delete({ id });
  }
}
