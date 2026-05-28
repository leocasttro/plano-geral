import { Projeto } from "../entities/Projeto";

export interface ProjetoRepository {
  save(projeto: Projeto): Promise<void>;
  findById(id: string): Promise<Projeto | null>;
  findAll(): Promise<Projeto[]>;
  delete(id: string): Promise<void>;
  findByStatus(status: string): Promise<Projeto[]>;
}
