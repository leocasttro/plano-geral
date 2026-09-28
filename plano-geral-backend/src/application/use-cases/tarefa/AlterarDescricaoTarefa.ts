import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";

export class AlterarDescricaoTarefa {
  constructor(private repo: TarefaRepository) {}

  async execute(input: { tarefaId: string; descricao: string; usuarioId: string; perfil: string}) {
    const tarefa = await this.repo.findById(input.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    const criador = tarefa.obterCriador();

    if (criador !== input.usuarioId && input.perfil !== 'ADMIN') {
      throw new Error('Apenas o criado pode alterar a descrição.')
    }

    tarefa.descricao = input.descricao;
    await this.repo.save(tarefa);
    return tarefa;
  }
}
