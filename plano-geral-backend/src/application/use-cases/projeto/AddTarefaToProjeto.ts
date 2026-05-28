import { ProjetoRepository } from "../../../domain/repositories/ProjetoRepository";
import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";

interface AddTarefaToProjetoInput {
  projetoId: string;
  tarefaId: string;
}

export class AddTarefaToProjeto {
  constructor(
    private projetoRepository: ProjetoRepository,
    private tarefaRepository: TarefaRepository
  ) {}

  async execute(input: AddTarefaToProjetoInput): Promise<void> {
    const projeto = await this.projetoRepository.findById(input.projetoId);
    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    const tarefa = await this.tarefaRepository.findById(input.tarefaId);
    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    projeto.adicionarTarefa(tarefa);
    tarefa.associarAoProjeto(projeto.id);

    await this.projetoRepository.save(projeto);
    await this.tarefaRepository.save(tarefa);
  }
}
