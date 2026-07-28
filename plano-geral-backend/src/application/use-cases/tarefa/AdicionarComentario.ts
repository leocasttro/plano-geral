import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import { NotificacaoService } from "../../services/NotificacaoService";

type AdicionarComentarioInput = {
  tarefaId: string;
  comentario: string;
  usuarioId: string;
  usuarioNome: string;
};

export class AdicionarComentario {
  constructor(
    private repo: TarefaRepository,
    private notificacaoService: NotificacaoService,
  ) {}

  async execute(input: AdicionarComentarioInput) {
    const tarefa = await this.repo.findById(input.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    tarefa.adicionarComentario(input.comentario, input.usuarioNome);

    await this.repo.save(tarefa);

    const responsavelId = tarefa.obterResponsavel();

    if (responsavelId) {
      await this.notificacaoService.notificarUsuario({
        usuarioId: responsavelId,
        autorId: input.usuarioId,
        tipo: 'COMENTARIO_TAREFA',
        titulo: 'Novo comentário',
        mensagem: `${input.usuarioNome} comentou na tarefa "${tarefa.titulo}".`,
        link: `/tarefas/${tarefa.id}`,
      });
    }

    return tarefa;
  }
}
