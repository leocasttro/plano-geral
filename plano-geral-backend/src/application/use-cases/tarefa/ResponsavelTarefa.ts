import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import {UserRepository} from '../../../domain/repositories/UserRepository';
import { NotificacaoService } from '../../services/NotificacaoService';

export class ResponsavelTarefa {
  constructor(
    private repo: TarefaRepository,
    private userRepository: UserRepository,
    private notificacaoService: NotificacaoService,
  ) {}

  async execute(input: {tarefaId: string; responsaveisIds: string[]; usuario: string}) {
    const tarefa = await this.repo.findById(input.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    const usuariosResponsaveis = await Promise.all(
      input.responsaveisIds.map(id => this.userRepository.findById(id))
    );

    if (usuariosResponsaveis.some(u => !u)) {
      throw new Error('Um ou mais usuários responsáveis não foram encontrados');
    }

    if (usuariosResponsaveis.some(u => !u!.ativo)) {
      throw new Error('Um ou mais usuários responsáveis estão inativos');
    }

    const usuarioAcao = await this.userRepository.findById(input.usuario);
    const nomeUsuarioAcao = usuarioAcao?.nome ?? input.usuario;

    const tituloCatalogo = tarefa.obterTituloCatalogo();
    const perfilAcao = usuarioAcao?.perfil?.toUpperCase() || '';
    const isCriador = usuarioAcao?.id === tarefa.obterCriador();
    console.log('[DEBUG ResponsavelTarefa] usuarioAcao.id:', usuarioAcao?.id, 'tarefa.criadorId:', tarefa.obterCriador(), 'isCriador:', isCriador, 'perfilAcao:', perfilAcao);

    if (tituloCatalogo?.componente?.trim().toLowerCase() === 'geoprocessamento') {
      const perfisPermitidos = ['GESTOR_GEOPROCESSAMENTO', 'ADMIN', 'MANAGER', 'GESTOR'];
      if (!perfisPermitidos.includes(perfilAcao) && !isCriador) {
        require('fs').writeFileSync('/tmp/error_log.txt', JSON.stringify({ error: 'Apenas gestores ou o criador podem reatribuir esta tarefa de geoprocessamento', usuarioAcaoId: usuarioAcao?.id, criadorId: tarefa.obterCriador(), perfil: perfilAcao }));
        throw new Error('Apenas gestores ou o criador podem reatribuir esta tarefa de geoprocessamento');
      }
    } else {
      const perfisPermitidos = ['ADMIN', 'MANAGER', 'GESTOR'];
      if (!perfisPermitidos.includes(perfilAcao) && !isCriador) {
        require('fs').writeFileSync('/tmp/error_log.txt', JSON.stringify({ error: 'Apenas gestores ou o criador podem reatribuir esta tarefa', usuarioAcaoId: usuarioAcao?.id, criadorId: tarefa.obterCriador(), perfil: perfilAcao }));
        throw new Error('Apenas gestores ou o criador podem reatribuir esta tarefa');
      }
    }

    const nomesResponsaveis = usuariosResponsaveis.map(u => u!.nome);

    tarefa.atribuirResponsaveis(
      input.responsaveisIds,
      nomeUsuarioAcao,
      nomesResponsaveis
    );

    await this.repo.save(tarefa);

    for (const responsavelId of input.responsaveisIds) {
      await this.notificacaoService.notificarUsuario({
        usuarioId: responsavelId,
        autorId: input.usuario,
        tipo: 'ATRIBUICAO_TAREFA',
        titulo: 'Nova tarefa atribuída',
        mensagem: `Você foi atribuído à tarefa "${tarefa.titulo}".`,
        link: `/tarefas/${tarefa.id}`,
      });
    }

    return {
      tarefa,
      responsaveis: usuariosResponsaveis.map(r => ({
        id: r!.id,
        nome: r!.nome,
        email: r!.email,
      })),
    };
  }
}
