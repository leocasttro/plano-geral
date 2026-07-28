import { Repository } from 'typeorm';
import { SolicitacaoAlteracaoDatasRepository } from '../../../../../domain/repositories/SolicitacaoAlteracaoDatasRepository';
import { SolicitacaoAlteracaoDatas } from '../../../../../domain/entities/SolicitacaoAlteracaoDatas';
import { AppDataSource } from '../../../data-source';
import { SolicitacaoAlteracaoDatasORM } from '../SolicitacaoAlteracaoDatasORM';
import { SolicitacaoAlteracaoDatasMapper } from '../../mappers/SolicitacaoAlteracaoDatasMapper';

export class SolicitacaoAlteracaoDatasTypeORMRepository
  implements SolicitacaoAlteracaoDatasRepository {
  private repository: Repository<SolicitacaoAlteracaoDatasORM>;

  constructor() {
    this.repository = AppDataSource.getRepository(SolicitacaoAlteracaoDatasORM);
  }

  async save(solicitacao: SolicitacaoAlteracaoDatas): Promise<void> {
    await this.repository.save(SolicitacaoAlteracaoDatasMapper.toORM(solicitacao));
  }

  async findById(id: string): Promise<SolicitacaoAlteracaoDatas | null> {
    const row = await this.repository.findOne({ where: { id } });
    return row ? SolicitacaoAlteracaoDatasMapper.toDomain(row) : null;
  }

  async findPendenteByTarefaAndSolicitante(
    tarefaId: string,
    solicitanteId: string,
  ): Promise<SolicitacaoAlteracaoDatas | null> {
    const row = await this.repository.findOne({
      where: {
        tarefaId,
        solicitanteId,
        status: 'PENDENTE',
      },
    });

    return row ? SolicitacaoAlteracaoDatasMapper.toDomain(row) : null;
  }
}
