import { Atividade } from '../../domain/entities/Atividade';
import { AtividadeRepository } from '../../domain/repositories/AtividadeRepository';

export class GetAtividadeByTarefa {
  constructor(private repo: AtividadeRepository) {}

  async execute(params: { tarefaId: string }): Promise<Atividade[]> {
    return this.repo.listByTarefaId(params.tarefaId);
  }
}
