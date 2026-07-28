import {TituloTarefaCatalogo} from '../../domain/entities/TituloTarefaCatalogo';

export type TituloTarefaCatalogoDTOProps = {
  id: string;
  acao: string | null;
  componente: string | null;
  atividadePrincipal: string | null;
  subatividade: string | null;
  descricao: string | null;
  tituloExibicao: string;
  ativo: boolean;
};

export class TituloTarefaCatalogoDTO {
  static fromDomain(
    titulo: TituloTarefaCatalogo,
  ): TituloTarefaCatalogoDTOProps {
    return {
      id: titulo.id,
      acao: titulo.acao,
      componente: titulo.componente,
      atividadePrincipal: titulo.atividadePrincipal,
      subatividade: titulo.subatividade,
      descricao: titulo.descricao,
      tituloExibicao: titulo.obterTituloExibicao(),
      ativo: titulo.ativo,
    }
  }
}
