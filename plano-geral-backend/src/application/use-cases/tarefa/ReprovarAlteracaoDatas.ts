import { SolicitacaoAlteracaoDatasRepository } from '../../../domain/repositories/SolicitacaoAlteracaoDatasRepository';
import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';
import { NotificacaoService } from '../../services/NotificacaoService';

export class ReprovarAlteracaoDatas {
  constructor(
    private tarefaRepository: TarefaRepository,
    private solicitacaoRepository: SolicitacaoAlteracaoDatasRepository,
    private notificacaoService: NotificacaoService,
  ) {}

  async execute(input: {
    solicitacaoId: string;
    aprovadorId: string;
    aprovadorNome: string;
  }): Promise<void> {
    const solicitacao = await this.solicitacaoRepository.findById(input.solicitacaoId);

    if (!solicitacao) {
      throw new Error('Solicitação não encontrada');
    }

    const tarefa = await this.tarefaRepository.findById(solicitacao.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    solicitacao.reprovar(input.aprovadorId, input.aprovadorNome);
    await this.solicitacaoRepository.save(solicitacao);

    await this.notificacaoService.notificarUsuario({
      usuarioId: solicitacao.solicitanteId,
      autorId: input.aprovadorId,
      tipo: 'SOLICITACAO_DATA_REPROVADA',
      titulo: 'Alteração de datas reprovada',
      mensagem: `Sua solicitação de alteração de datas na tarefa "${tarefa.titulo}" foi reprovada.`,
      link: `/tarefas/${tarefa.id}`,
    });
  }
}
