import {
  ListarTitulosTarefaCatalogoFiltro,
  TituloTarefaCatalogoRepository
} from '../../../domain/repositories/TituloTarefaCatalogoRepository';

export class ListarTitulosTarefaCatalogo {
  constructor(private tituloRepository: TituloTarefaCatalogoRepository) {
  }

  async execute(filtro: ListarTitulosTarefaCatalogoFiltro = {}) {
    return this.tituloRepository.list({
      ...filtro,
      ativo: filtro.ativo ?? true,
    });
  }
}
