import { Tarefa } from "../../domain/entities/Tarefa";
import { TarefaRepository } from "../../domain/repositories/TarefaRepository";

export class InMemoryTarefaRepository implements TarefaRepository {
  private tarefas = new Map<string, Tarefa>();

  async save(tarefa: Tarefa): Promise<void> {
    this.tarefas.set(tarefa.id, tarefa);
  }

  async findById(id: string): Promise<Tarefa | null> {
    return this.tarefas.get(id) ?? null;
  }
}
