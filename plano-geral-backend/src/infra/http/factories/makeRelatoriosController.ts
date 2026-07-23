import { GetTempoTarefaPorResponsavel } from '../../../application/use-cases/relatorio/GetTempoTarefaPorResponsavel';
import { TarefaTypeORMRepository } from '../../database/typeorm/entities/repositories/TarefaTypeORMRepository';
import { RelatoriosController } from '../controllers/RelatoriosController';
import {GetAlteracoesDatasTarefa} from '../../../application/use-cases/relatorio/GetAlteracoesDatasTarefa';
import {GetResumoProjeto} from '../../../application/use-cases/relatorio/GetResumoProjeto';
import {ProjetoTypeORMRepository} from '../../database/typeorm/entities/repositories/ProjetoTypeORMRepository';
import {GetCargaUsuarios} from '../../../application/use-cases/relatorio/GetCargaUsuarios';
import {UserTypeORMRepository} from '../../database/typeorm/entities/repositories/UserTypeORMRepository';
import {GetDashboardRelatorio} from '../../../application/use-cases/relatorio/GetDashboardRelatorio';
import {CalcularFluxoCumulativoService} from '../../../application/services/CalcularFluxoCumulativoService';
import { GetMetricasProjetos } from "../../../application/use-cases/relatorio/GetMetricasProjetos";
import { GetCalendarioTarefas } from '../../../application/use-cases/relatorio/GetCalendarioTarefas';
import { GetTempoConclusaoPorTitulo } from '../../../application/use-cases/relatorio/GetTempoConclusaoPorTitulo';
import { GetTempoMedioPorTitulo } from '../../../application/use-cases/relatorio/GetTempoMedioPorTitulo';
import { GetLeadTimeRelatorio } from '../../../application/use-cases/GetLeadTimeRelatorio';

export function makeRelatoriosController() {
  const tarefaRepository = new TarefaTypeORMRepository();
  const projetoRepository = new ProjetoTypeORMRepository();
  const userRepository = new UserTypeORMRepository();
  const calcularFluxoCumulativoService = new CalcularFluxoCumulativoService();

  return new RelatoriosController({
    getTempoTarefaPorResponsavel: new GetTempoTarefaPorResponsavel(tarefaRepository),
    getAlteracoesDatasTarefa: new GetAlteracoesDatasTarefa(tarefaRepository),
    getResumoProjeto: new GetResumoProjeto(projetoRepository),
    getCargaUsuarios: new GetCargaUsuarios(tarefaRepository, userRepository),
    getDashboardRelatorio: new GetDashboardRelatorio(projetoRepository, tarefaRepository,
      userRepository, calcularFluxoCumulativoService),
    getMetricasProjetos: new GetMetricasProjetos(projetoRepository),
    getCalendarioTarefas: new GetCalendarioTarefas(tarefaRepository),
    getTempoConclusaoPorTitulo: new GetTempoConclusaoPorTitulo(tarefaRepository),
    getTempoMedioPorTitulo: new GetTempoMedioPorTitulo(tarefaRepository),
    getLeadTimeRelatorio: new GetLeadTimeRelatorio(tarefaRepository, userRepository),
  });
}
