import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";

export class AdicionarComentario {
  constructor(private repo: TarefaRepository) {}

  async execute(input: { tarefaId: string; comentario: string; usuario: string }) {
    const tarefa = await this.repo.findById(input.tarefaId);
    if (!tarefa) throw new Error('Tarefa não encontrada');

    tarefa.adicionarComentario(input.comentario, input.usuario);

    await this.repo.save(tarefa);
    return tarefa;
  }
}
