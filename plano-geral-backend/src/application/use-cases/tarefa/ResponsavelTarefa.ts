import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import {UserRepository} from '../../../domain/repositories/UserRepository';
import { NotificacaoService } from '../../services/NotificacaoService';

export class ResponsavelTarefa {
  constructor(
    private repo: TarefaRepository,
    private userRepository: UserRepository,
    private notificacaoService: NotificacaoService,
  ) {}

  async execute(input: {tarefaId: string; responsavelId: string; usuario: string}) {
    const tarefa = await this.repo.findById(input.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    const responsavel = await this.userRepository.findById(input.responsavelId);

    if (!responsavel) {
      throw new Error('Usuário responsável não encontrado');
    }

    if (!responsavel.ativo) {
      throw new Error('Usuário responsável está inativo');
    }

    const usuarioAcao = await this.userRepository.findById(input.usuario);
    const nomeUsuarioAcao = usuarioAcao?.nome ?? input.usuario;

    tarefa.atribuirResponsavel(
      input.responsavelId,
      nomeUsuarioAcao,
      responsavel.nome,
    );

    await this.repo.save(tarefa);

    await this.notificacaoService.notificarUsuario({
      usuarioId: input.responsavelId,
      autorId: input.usuario,
      tipo: 'ATRIBUICAO_TAREFA',
      titulo: 'Nova tarefa atribuída',
      mensagem: `Você foi atribuído à tarefa "${tarefa.titulo}".`,
      link: `/tarefas/${tarefa.id}`,
    });

    return {
      tarefa,
      responsavel: {
        id: responsavel.id,
        nome: responsavel.nome,
        email: responsavel.email,
      },
    };
  }
}
