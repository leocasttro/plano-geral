import { SolicitacaoAlteracaoDatas } from '../entities/SolicitacaoAlteracaoDatas';

export interface SolicitacaoAlteracaoDatasRepository {
  save(solicitacao: SolicitacaoAlteracaoDatas): Promise<void>;
  findById(id: string): Promise<SolicitacaoAlteracaoDatas | null>;
  findPendenteByTarefaAndSolicitante(
    tarefaId: string,
    solicitanteId: string,
  ): Promise<SolicitacaoAlteracaoDatas | null>;
}
