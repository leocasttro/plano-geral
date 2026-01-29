import { Atividade } from "../entities/Atividade";

export interface AtividadeRepository {
  save(atividade: Atividade): Promise<void>;
  findById(id: string): Promise<Atividade | null>;
  list(): Promise<Atividade[]>;
  listByTarefaId(tarefaId: string): Promise<Atividade[]>
  delete(id: string): Promise<void>;
}
