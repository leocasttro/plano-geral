import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";

export class ResponsavelTarefa {
  constructor(private repo: TarefaRepository) {}

  async execute(input: {tarefaId: string; responsavel: string; usuario: string}) {
    const tarefa = await this.repo.findById(input.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    tarefa.atribuirResponsavel(input.responsavel, input.usuario);
    
    await this.repo.save(tarefa);
    return tarefa;
  }
}
