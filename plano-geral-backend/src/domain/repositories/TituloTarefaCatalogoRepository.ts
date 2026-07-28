import {TituloTarefaCatalogo} from '../entities/TituloTarefaCatalogo';

export type ListarTitulosTarefaCatalogoFiltro = {
  busca?: string;
  acao?: string;
  componente?: string;
  atividadePrincipal?: string;
  subatividade?: string;
  ativo?: boolean;
};

export interface TituloTarefaCatalogoRepository {
  save(titulo: TituloTarefaCatalogo): Promise<void>;
  findById(id: string): Promise<TituloTarefaCatalogo | null>;
  list(filtro?: ListarTitulosTarefaCatalogoFiltro): Promise<TituloTarefaCatalogo[]>;
}
