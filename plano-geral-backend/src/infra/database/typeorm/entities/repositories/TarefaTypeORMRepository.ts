import { Repository } from "typeorm";
import { TarefaRepository } from "../../../../../domain/repositories/TarefaRepository";
import { TarefaORM } from "../TarefaORM";
import { AppDataSource } from "../../../data-source";
import { Tarefa } from "../../../../../domain/entities/Tarefa";
import { TarefaMapper } from "../../mappers/TarefaMapper";

export class TarefaTypeORMRepository implements TarefaRepository {
  private ormRepo: Repository<TarefaORM>;

  constructor() {
    this.ormRepo = AppDataSource.getRepository(TarefaORM);
  }

  async save(tarefa: Tarefa): Promise<void> {
    const row = TarefaMapper.toORM(tarefa);
    await this.ormRepo.save(row);
  }

  async findById(id: string): Promise<Tarefa | null> {
    const row = await this.ormRepo.findOne({ where: { id } });
    if (!row) return null;
    return TarefaMapper.toDomain(row);
  }

  async list(): Promise<Tarefa[]> {
    const rows = await this.ormRepo.find({
      order: { createdAt: 'DESC' },
    });

    return rows.map(TarefaMapper.toDomain)
  }

  async delete(id: string): Promise<void> {
    await this.ormRepo.delete({ id });
  }
}
