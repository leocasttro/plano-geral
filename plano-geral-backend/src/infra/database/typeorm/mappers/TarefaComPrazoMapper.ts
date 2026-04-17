// src/infra/database/typeorm/mappers/TarefaComPrazoMapper.ts
import { TarefaComPrazo } from "../../../../domain/entities/TarefaComPrazo";
import { TarefaORM } from "../entities/TarefaORM";
import { TarefaMapper } from "./TarefaMapper";

export class TarefaComPrazoMapper extends TarefaMapper {
  static toORM(domain: TarefaComPrazo): TarefaORM {
    const orm = super.toORM(domain);

    const periodo = domain.getPeriodo();

    orm.dataInicio = periodo.getInicio() ?? null;
    orm.dataFim = periodo.getFim() ?? null;

    return orm;
  }
}
