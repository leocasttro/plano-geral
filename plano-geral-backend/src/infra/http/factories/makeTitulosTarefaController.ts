import { ListarTitulosTarefaCatalogo } from '../../../application/use-cases/titulo-tarefa/ListarTitulosTarefaCatalogo';
import { TituloTarefaCatalogoTypeORMRepository } from '../../database/typeorm/entities/repositories/TituloTarefaCatalogoTypeORMRepository';
import { TitulosTarefaController } from '../controllers/TitulosTarefaController';

export function makeTitulosTarefaController() {
  const tituloRepository = new TituloTarefaCatalogoTypeORMRepository();

  return new TitulosTarefaController({
    listarTitulos: new ListarTitulosTarefaCatalogo(tituloRepository),
  });
}
