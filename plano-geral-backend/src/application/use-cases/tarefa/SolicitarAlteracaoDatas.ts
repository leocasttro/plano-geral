import { SolicitacaoAlteracaoDatas } from '../../../domain/entities/SolicitacaoAlteracaoDatas';
import { SolicitacaoAlteracaoDatasRepository } from '../../../domain/repositories/SolicitacaoAlteracaoDatasRepository';
import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { NotificacaoService } from '../../services/NotificacaoService';

export class SolicitarAlteracaoDatas {
  constructor(
    private tarefaRepository: TarefaRepository,
    private userRepository: UserRepository,
    private solicitacaoRepository: SolicitacaoAlteracaoDatasRepository,
    private notificacaoService: NotificacaoService,
  ) {}

  async execute(input: {
    tarefaId: string;
    dataInicio?: Date;
    dataFim?: Date;
    justificativa: string;
    solicitanteId: string;
    solicitanteNome: string;
  }): Promise<SolicitacaoAlteracaoDatas> {
    const tarefa = await this.tarefaRepository.findById(input.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    if (!input.dataInicio && !input.dataFim) {
      throw new Error('Forneça pelo menos uma data');
    }

    if (!input.justificativa?.trim()) {
      throw new Error('Justificativa é obrigatória para solicitar alteração de datas');
    }

    const solicitacaoPendente =
      await this.solicitacaoRepository.findPendenteByTarefaAndSolicitante(
        tarefa.id,
        input.solicitanteId,
      );

    if (solicitacaoPendente) {
      throw new Error(
        'Você já possui uma solicitação de alteração de datas pendente para esta tarefa',
      );
    }

    const solicitacao = SolicitacaoAlteracaoDatas.criar({
      tarefaId: tarefa.id,
      solicitanteId: input.solicitanteId,
      solicitanteNome: input.solicitanteNome,
      dataInicio: input.dataInicio,
      dataFim: input.dataFim,
      justificativa: input.justificativa.trim(),
    });

    await this.solicitacaoRepository.save(solicitacao);

    const aprovadores = (await this.userRepository.findAllActive()).filter((usuario) =>
      ['ADMIN', 'MANAGER', 'GESTOR'].includes(String(usuario.perfil).toUpperCase()),
    );

    await this.notificacaoService.notificarUsuarios({
      usuariosIds: aprovadores.map((usuario) => usuario.id),
      autorId: input.solicitanteId,
      tipo: 'SOLICITACAO_DATA',
      titulo: 'Solicitação de alteração de datas',
      mensagem: `${input.solicitanteNome} solicitou alteração de datas na tarefa "${tarefa.titulo}".`,
      link: `/tarefas/${tarefa.id}/solicitacoes-datas/${solicitacao.id}`,
    });

    return solicitacao;
  }
}
