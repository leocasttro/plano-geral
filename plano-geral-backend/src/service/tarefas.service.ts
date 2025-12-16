import { AppDataSource } from "../database/data-source";
import { Tarefa } from "../entities/tarefa.entity";

export class TarefaService {
  private repo = AppDataSource.getRepository(Tarefa);

  async listar(): Promise<Tarefa[]> {
    return this.repo.find();
  }

  async obterPorId(id: number): Promise<Tarefa | null> {
    return this.repo.findOneBy({ id });
  }

  async criar(data: Partial<Tarefa>): Promise<Tarefa> {
    const tarefa = this.repo.create(data);
    return this.repo.save(tarefa);
  }

  async atualizar(id: number, data: Partial<Tarefa>): Promise<Tarefa | null> {
    await this.repo.update(id, data);
    return this.obterPorId(id);
  }

  async remover(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
