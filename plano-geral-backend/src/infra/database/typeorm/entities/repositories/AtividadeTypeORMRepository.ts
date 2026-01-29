import { Repository } from 'typeorm';
import { AtividadeRepository } from '../../../../../domain/repositories/AtividadeRepository';
import { AtividadeORM } from '../AtividadeORM';
import { AppDataSource } from '../../../data-source';
import { Atividade } from '../../../../../domain/entities/Atividade';
import { AtividadeMapper } from '../../mappers/AtvidadeMapper';

export class AtividadeTypeORMRepository implements AtividadeRepository {
  private ormRepo: Repository<AtividadeORM>;

  constructor() {
    this.ormRepo = AppDataSource.getRepository(AtividadeORM);
  }

  async save(atividade: Atividade): Promise<void> {
    const row = AtividadeMapper.toORM(atividade);
    await this.ormRepo.save(row);
  }

  async findById(id: string): Promise<Atividade | null> {
    const row = await this.ormRepo.findOne({ where: { id } });
    if (!row) return null;

    return AtividadeMapper.toDomain(row);
  }

  async list(): Promise<Atividade[]> {
    const rows = await this.ormRepo.find({
      order: { createdAt: 'DESC' },
    });

    return rows.map(AtividadeMapper.toDomain);
  }

  async listByTarefaId(tarefa_id: string): Promise<Atividade[]> {
    const rows = await this.ormRepo.find({
      where: { tarefa_id },
      order: { createdAt: 'DESC' },
    });

    return rows.map(AtividadeMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepo.delete({ id });
  }
}
