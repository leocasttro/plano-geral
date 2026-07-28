import {
  SolicitacaoAlteracaoDatas,
  StatusSolicitacaoAlteracaoDatas,
} from '../../../../domain/entities/SolicitacaoAlteracaoDatas';
import { SolicitacaoAlteracaoDatasORM } from '../entities/SolicitacaoAlteracaoDatasORM';

export class SolicitacaoAlteracaoDatasMapper {
  static toORM(domain: SolicitacaoAlteracaoDatas): SolicitacaoAlteracaoDatasORM {
    const orm = new SolicitacaoAlteracaoDatasORM();

    orm.id = domain.id;
    orm.tarefaId = domain.tarefaId;
    orm.solicitanteId = domain.solicitanteId;
    orm.solicitanteNome = domain.solicitanteNome;
    orm.dataInicio = domain.dataInicio;
    orm.dataFim = domain.dataFim;
    orm.justificativa = domain.justificativa;
    orm.status = domain.obterStatus();
    orm.aprovadorId = domain.aprovadorId;
    orm.aprovadorNome = domain.aprovadorNome;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;

    return orm;
  }

  static toDomain(orm: SolicitacaoAlteracaoDatasORM): SolicitacaoAlteracaoDatas {
    return new SolicitacaoAlteracaoDatas(
      orm.id,
      orm.tarefaId,
      orm.solicitanteId,
      orm.solicitanteNome,
      parseDateOnly(orm.dataInicio),
      parseDateOnly(orm.dataFim),
      orm.justificativa,
      orm.status as StatusSolicitacaoAlteracaoDatas,
      orm.aprovadorId,
      orm.aprovadorNome,
      orm.createdAt,
      orm.updatedAt,
    );
  }
}

function parseDateOnly(value: Date | string | null): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const [ano, mes, dia] = value.split('T')[0].split('-').map(Number);

  if (!ano || !mes || !dia) {
    return null;
  }

  return new Date(ano, mes - 1, dia);
}
