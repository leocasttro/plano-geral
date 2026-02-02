import { Atividade } from "../../../../domain/entities/Atividade"
import { TipoAtividade } from "../../../../domain/value-objects/TipoAtividade"
import { AtividadeORM } from "../entities/AtividadeORM"

export class AtividadeMapper {
  constructor() {}

  static toDomain(row: AtividadeORM): Atividade {
    return Atividade.reconstituir({
      id: row.id,
      tipo: row.tipo as TipoAtividade,
      usuario: row.usuario,
      descricao: row.descricao,
      data: row.createdAt,
    })
  }

  static toORM(atividade: Atividade): AtividadeORM {
    const row = new AtividadeORM();

    row.id = atividade.id;
    row.tipo = atividade.tipo;
    row.usuario = atividade.usuario;
    row.descricao = atividade.descricao;

    return row;
  }
}
