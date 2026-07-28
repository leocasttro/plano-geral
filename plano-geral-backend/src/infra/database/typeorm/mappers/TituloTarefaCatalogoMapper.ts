import { TituloTarefaCatalogo } from '../../../../domain/entities/TituloTarefaCatalogo';
import { TituloTarefaCatalogoORM } from '../entities/TituloTarefaCatalogoORM';

export class TituloTarefaCatalogoMapper {
  static toORM(titulo: TituloTarefaCatalogo): TituloTarefaCatalogoORM {
    const row = new TituloTarefaCatalogoORM();

    row.id = titulo.id;
    row.acao = titulo.acao;
    row.componente = titulo.componente;
    row.atividadePrincipal = titulo.atividadePrincipal;
    row.subatividade = titulo.subatividade;
    row.descricao = titulo.descricao;
    row.tituloNormalizado = titulo.tituloNormalizado;
    row.ativo = titulo.ativo;

    return row;
  }

  static toDomain(row: TituloTarefaCatalogoORM): TituloTarefaCatalogo {
    return TituloTarefaCatalogo.reconstituir({
      id: row.id,
      acao: row.acao,
      componente: row.componente,
      atividadePrincipal: row.atividadePrincipal,
      subatividade: row.subatividade,
      descricao: row.descricao,
      tituloNormalizado: row.tituloNormalizado,
      ativo: row.ativo,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
