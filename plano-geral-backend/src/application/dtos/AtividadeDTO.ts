import { Atividade } from "../../domain/entities/Atividade";

export interface AtividadeDTOProps {
  id: string;
  tipo: string;
  usuario: string;
  descricao: string;
  data: Date;
}

export class AtividadeDTO {
  static fromDomain(atividade: Atividade): AtividadeDTOProps {
    return {
      id: atividade.id,
      tipo: String(atividade.tipo),
      usuario: atividade.usuario,
      descricao: atividade.descricao,
      data: atividade.data,
    }
  }
}
