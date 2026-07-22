import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';

export class DeleteTarefa {
  constructor(private tarefaRepository: TarefaRepository) {}

  async execute(input: { tarefaId: string }): Promise<void> {
    await this.tarefaRepository.delete(input.tarefaId);
  }
}
