import { SolicitacaoAlteracaoDatas } from '../../../domain/entities/SolicitacaoAlteracaoDatas';
import { SolicitacaoAlteracaoDatasRepository } from '../../../domain/repositories/SolicitacaoAlteracaoDatasRepository';

export class GetSolicitacaoAlteracaoDatas {
  constructor(
    private solicitacaoRepository: SolicitacaoAlteracaoDatasRepository,
  ) {}

  async execute(input: {
    solicitacaoId: string;
  }): Promise<SolicitacaoAlteracaoDatas> {
    const solicitacao = await this.solicitacaoRepository.findById(
      input.solicitacaoId,
    );

    if (!solicitacao) {
      throw new Error('Solicitação não encontrada');
    }

    return solicitacao;
  }
}
