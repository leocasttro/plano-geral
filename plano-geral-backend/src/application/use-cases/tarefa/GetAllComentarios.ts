import { Atividade } from "../../../domain/entities/Atividade";
import { AtividadeRepository } from "../../../domain/repositories/AtividadeRepository";


export class GetAllAtividades {
  constructor(private repo: AtividadeRepository) {}

  async execute(): Promise<Atividade[]> {
    const atividades = await this.repo.list();

    if (!atividades) {
      throw new Error('Atividades não encontradas')
    }

    return atividades;
  }
}
