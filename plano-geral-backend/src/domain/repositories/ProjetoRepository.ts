import { Projeto } from "../entities/Projeto";
import {StatusProjeto} from '../value-objects/StatusProjeto';

export interface ProjetoRepository {
  save(projeto: Projeto): Promise<void>;
  findById(id: string): Promise<Projeto | null>;
  findAll(): Promise<Projeto[]>;
  delete(id: string): Promise<void>;
  findByStatus(status: StatusProjeto): Promise<Projeto[]>;
}
