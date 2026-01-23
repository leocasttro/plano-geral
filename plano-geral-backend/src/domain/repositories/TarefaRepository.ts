import { Tarefa } from "../entities/Tarefa";

export interface TarefaRepository {
  save(tarefa: Tarefa): Promise<void>;
  findById(id: string): Promise<Tarefa | null>;
  list(): Promise<Tarefa[]>;
  delete(id: string): Promise<void>;
}
