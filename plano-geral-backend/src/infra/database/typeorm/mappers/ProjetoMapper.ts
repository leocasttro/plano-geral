import { Projeto } from '../../../../domain/entities/Projeto';
import { ProjetoORM } from '../entities/ProjetoORM';
import { TarefaMapper } from './TarefaMapper';

export class ProjetoMapper {
  static toORM(projeto: Projeto): ProjetoORM {
    const row = new ProjetoORM();

    row.id = projeto.id;
    row.nome = projeto.nome;
    row.descricao = projeto.descricao ?? (null as any);
    row.status = projeto.obterStatus();
    row.tarefas = projeto
      .obterTarefas()
      .map((tarefa) => TarefaMapper.toORM(tarefa));
    row.centroCusto = projeto.obterCentroCusto();
    row.coordenadorId = projeto.obterCoordenadorId();
    row.createdAt = projeto.obterCreatedAt();
    row.updatedAt = projeto.obterUpdatedAt();

    return row;
  }

  static toDomain(row: ProjetoORM): Projeto {
    const tarefas = (row.tarefas ?? []).map((tarefaORM) =>
      TarefaMapper.toDomain(tarefaORM),
    );

    const projeto = Projeto.reconstituir({
      id: row.id,
      nome: row.nome,
      descricao: row.descricao ?? undefined,
      status: row.status as any,
      tarefas: tarefas,
      centroCusto: row.centroCusto,
      coordenadorId: row.coordenadorId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });

    return projeto;
  }
}
