import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import { NotificacaoService } from "../../services/NotificacaoService";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { GestorProjetoNotificacaoService } from "../../services/GestorProjetoNotificacaoService";

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
    private userRepository?: UserRepository,
    private gestorProjetoNotificacaoService?: GestorProjetoNotificacaoService,
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

    if (await this.deveNotificarGestor(input.usuarioId, responsavelId)) {
      await this.gestorProjetoNotificacaoService?.notificarComentarioRelevante({
        tarefa,
        comentario: input.comentario,
        usuarioId: input.usuarioId,
        usuarioNome: input.usuarioNome,
      }).catch((error) => {
        console.error('Falha ao notificar gestor sobre comentário:', error);
      });
    }

    return tarefa;
  }

  private async deveNotificarGestor(
    usuarioId: string,
    responsavelId?: string,
  ): Promise<boolean> {
    if (responsavelId && responsavelId === usuarioId) {
      return true;
    }

    if (!this.userRepository) return false;

    const usuario = await this.userRepository.findById(usuarioId);
    const perfil = String(usuario?.perfil ?? '').toUpperCase();

    return ['ADMIN', 'MANAGER', 'GESTOR'].includes(perfil);
  }
}
