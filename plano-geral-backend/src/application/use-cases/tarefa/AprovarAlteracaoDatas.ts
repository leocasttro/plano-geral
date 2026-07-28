import { Tarefa } from '../../../domain/entities/Tarefa';
import { TarefaComPrazo } from '../../../domain/entities/TarefaComPrazo';
import { SolicitacaoAlteracaoDatasRepository } from '../../../domain/repositories/SolicitacaoAlteracaoDatasRepository';
import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';
import { NotificacaoService } from '../../services/NotificacaoService';

export class AprovarAlteracaoDatas {
  constructor(
    private tarefaRepository: TarefaRepository,
    private solicitacaoRepository: SolicitacaoAlteracaoDatasRepository,
    private notificacaoService: NotificacaoService,
  ) {}

  async execute(input: {
    solicitacaoId: string;
    aprovadorId: string;
    aprovadorNome: string;
  }): Promise<Tarefa> {
    const solicitacao = await this.solicitacaoRepository.findById(input.solicitacaoId);

    if (!solicitacao) {
      throw new Error('Solicitação não encontrada');
    }

    const tarefa = await this.tarefaRepository.findById(solicitacao.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    const tarefaAtualizada = tarefa instanceof TarefaComPrazo
      ? tarefa
      : tarefa.converterParaPrazo(
        solicitacao.dataInicio ?? undefined,
        solicitacao.dataFim ?? undefined,
      );

    if (tarefaAtualizada instanceof TarefaComPrazo) {
      tarefaAtualizada.alterarDatas(
        solicitacao.dataInicio ?? undefined,
        solicitacao.dataFim ?? undefined,
        input.aprovadorNome,
        solicitacao.justificativa,
      );
    }

    solicitacao.aprovar(input.aprovadorId, input.aprovadorNome);

    await this.tarefaRepository.save(tarefaAtualizada);
    await this.solicitacaoRepository.save(solicitacao);

    await this.notificacaoService.notificarUsuario({
      usuarioId: solicitacao.solicitanteId,
      autorId: input.aprovadorId,
      tipo: 'SOLICITACAO_DATA_APROVADA',
      titulo: 'Alteração de datas aprovada',
      mensagem: `Sua solicitação de alteração de datas na tarefa "${tarefa.titulo}" foi aprovada.`,
      link: `/tarefas/${tarefa.id}`,
    });

    return tarefaAtualizada;
  }
}
