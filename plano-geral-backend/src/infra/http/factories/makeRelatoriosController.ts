import { GetTempoTarefaPorResponsavel } from '../../../application/use-cases/relatorio/GetTempoTarefaPorResponsavel';
import { TarefaTypeORMRepository } from '../../database/typeorm/entities/repositories/TarefaTypeORMRepository';
import { RelatoriosController } from '../controllers/RelatoriosController';
import {GetAlteracoesDatasTarefa} from '../../../application/use-cases/relatorio/GetAlteracoesDatasTarefa';
import {GetResumoProjeto} from '../../../application/use-cases/relatorio/GetResumoProjeto';
import {ProjetoTypeORMRepository} from '../../database/typeorm/entities/repositories/ProjetoTypeORMRepository';
import {GetCargaUsuarios} from '../../../application/use-cases/relatorio/GetCargaUsuarios';
import {UserTypeORMRepository} from '../../database/typeorm/entities/repositories/UserTypeORMRepository';
import {GetDashboardRelatorio} from '../../../application/use-cases/relatorio/GetDashboardRelatorio';

export function makeRelatoriosController() {
  const tarefaRepository = new TarefaTypeORMRepository();
  const projetoRepository = new ProjetoTypeORMRepository();
  const userRepository = new UserTypeORMRepository();

  return new RelatoriosController({
    getTempoTarefaPorResponsavel: new GetTempoTarefaPorResponsavel(tarefaRepository),
    getAlteracoesDatasTarefa: new GetAlteracoesDatasTarefa(tarefaRepository),
    getResumoProjeto: new GetResumoProjeto(projetoRepository),
    getCargaUsuarios: new GetCargaUsuarios(tarefaRepository, userRepository),
    getDashboardRelatorio: new GetDashboardRelatorio(projetoRepository, tarefaRepository, userRepository),
  });
}
