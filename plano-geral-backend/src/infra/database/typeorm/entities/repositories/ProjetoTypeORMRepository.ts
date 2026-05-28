import { Repository } from "typeorm";
import { ProjetoRepository } from "../../../../../domain/repositories/ProjetoRepository";
import { ProjetoORM } from "../ProjetoORM";
import { AppDataSource } from "../../../data-source";
import { Projeto } from "../../../../../domain/entities/Projeto";
import { ProjetoMapper } from "../../mappers/ProjetoMapper";

export class ProjetoTypeORMRepository implements ProjetoRepository {
  private ormRepo: Repository<ProjetoORM>;

  constructor() {
    this.ormRepo = AppDataSource.getRepository(ProjetoORM);
  }

  async save(projeto: Projeto): Promise<void> {
    const row = ProjetoMapper.toORM(projeto);
    await this.ormRepo.save(row)
  }

  async findById(id: string): Promise<Projeto | null> {
    const row = await this.ormRepo.findOne({
      where: { id },
      relations: {
        tarefas: true
      }
    });

    if (!row) return null;
    return ProjetoMapper.toDomain(row);
  }

  async findAll(): Promise<any> {
    const rows = await this.ormRepo.find({
      relations: { tarefas: true },
      order: { createdAt: 'DESC' }
    });
    return rows.map(ProjetoMapper.toDomain)
  }

  async delete(id: string): Promise<void> {
    await this.ormRepo.delete({ id });
  }

  async findByStatus(status: string): Promise<Projeto[]> {
    const rows = await this.ormRepo.find({
      where: { status },
      relations: { tarefas: true },
    });

    return rows.map(ProjetoMapper.toDomain);
  }
}
