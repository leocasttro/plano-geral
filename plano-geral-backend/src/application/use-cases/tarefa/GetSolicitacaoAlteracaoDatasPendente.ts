import { SolicitacaoAlteracaoDatas } from '../../../domain/entities/SolicitacaoAlteracaoDatas';
import { SolicitacaoAlteracaoDatasRepository } from '../../../domain/repositories/SolicitacaoAlteracaoDatasRepository';

export class GetSolicitacaoAlteracaoDatasPendente {
  constructor(
    private solicitacaoRepository: SolicitacaoAlteracaoDatasRepository,
  ) {}

  async execute(input: {
    tarefaId: string;
    solicitanteId: string;
  }): Promise<SolicitacaoAlteracaoDatas | null> {
    return this.solicitacaoRepository.findPendenteByTarefaAndSolicitante(
      input.tarefaId,
      input.solicitanteId,
    );
  }
}
