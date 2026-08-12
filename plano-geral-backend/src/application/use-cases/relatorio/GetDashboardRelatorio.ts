import {ProjetoRepository} from '../../../domain/repositories/ProjetoRepository';
import {TarefaRepository} from '../../../domain/repositories/TarefaRepository';
import {UserRepository} from '../../../domain/repositories/UserRepository';
import {TarefaComPrazo} from '../../../domain/entities/TarefaComPrazo';
import {StatusTarefa} from '../../../domain/value-objects/StatusTarefa';
import {TipoAtividade} from '../../../domain/value-objects/TipoAtividade';
import {StatusProjeto} from '../../../domain/value-objects/StatusProjeto';
import {RelatorioDashboardDTO} from '../../dtos/RelatorioDashboardDTO';
import {CalcularFluxoCumulativoService} from '../../services/CalcularFluxoCumulativoService';
import {
  criarResolverCatalogoRelatorio,
  filtrarTarefasRelatorio,
  RelatorioFiltros,
} from './RelatorioFiltros';
import { TituloTarefaCatalogoRepository } from '../../../domain/repositories/TituloTarefaCatalogoRepository';

export type PeriodoThroughput = '15d' | '30d' | '90d' | 'ano';

export class GetDashboardRelatorio {
  constructor(
    private projetoRepository: ProjetoRepository,
    private tarefaRepository: TarefaRepository,
    private userRepository: UserRepository,
    private calcularFluxoCumulativoService: CalcularFluxoCumulativoService,
    private tituloTarefaCatalogoRepository?: TituloTarefaCatalogoRepository,
  ) {}

  async execute(
    periodo: PeriodoThroughput = '15d',
    filtros: RelatorioFiltros = {},
  ): Promise<RelatorioDashboardDTO> {
    const [todosProjetos, todasTarefas, usuarios, usuariosAtivos, catalogos] = await Promise.all([
      this.projetoRepository.findAll(),
      this.tarefaRepository.list(),
      this.userRepository.findAll(),
      this.userRepository.findAllActive(),
      this.tituloTarefaCatalogoRepository?.list({ ativo: true }) ?? Promise.resolve([]),
    ]);

    const tarefas = filtrarTarefasRelatorio(
      todasTarefas,
      filtros,
      criarResolverCatalogoRelatorio(catalogos),
    );
    const projetosIdsComTarefas = new Set(tarefas.map((tarefa) => tarefa.obterProjetoId()));
    const projetos = filtros.projetoId
      ? todosProjetos.filter((projeto) => projeto.id === filtros.projetoId)
      : filtros.usuarioId ||
        filtros.componente ||
        filtros.atividadePrincipal ||
        filtros.subatividade ||
        filtros.inicio ||
        filtros.fim
        ? todosProjetos.filter((projeto) => projetosIdsComTarefas.has(projeto.id))
        : todosProjetos;

    const periodoFiltro = filtros.inicio || filtros.fim
      ? {
          inicio: filtros.inicio ?? new Date(-8640000000000000),
          fim: filtros.fim ?? new Date(8640000000000000),
          label: this.formatarPeriodoPersonalizado(filtros.inicio, filtros.fim),
        }
      : this.calcularPeriodoThroughput(periodo);

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 15);

    const tarefasAtrasadas = tarefas.filter((tarefa) => {
      if (!(tarefa instanceof TarefaComPrazo)) return false;
      if (tarefa.obterStatus() === StatusTarefa.CONCLUIDA) return false;

      return tarefa.estaAtrasada();
    }).length;

    const tarefasCriadasUltimos15Dias = tarefas.filter((tarefa) =>
      tarefa.obterAtividades().some((atividade) => {
        return (
          atividade.tipo === TipoAtividade.CRIACAO && atividade.data >= dataLimite
        );
      }),
    ).length;

    const tarefasConcluidasUltimos15Dias = tarefas.filter((tarefa) =>
      tarefa.obterAtividades().some((atividade) => {
        return (
          atividade.tipo === TipoAtividade.ALTERACAO_STATUS &&
          atividade.descricao.toLowerCase().includes('conclu') &&
          atividade.data >= dataLimite
        );
      }),
    ).length;

    const tarefasCriadasPeriodo = tarefas.filter((tarefa) =>
      tarefa.obterAtividades().some((atividade) => {
        return (
          atividade.tipo === TipoAtividade.CRIACAO &&
          atividade.data >= periodoFiltro.inicio &&
          atividade.data <= periodoFiltro.fim
        );
      }),
    ).length;

    const tarefasConcluidasPeriodo = tarefas.filter((tarefa) =>
      tarefa.obterAtividades().some((atividade) => {
        return (
          atividade.tipo === TipoAtividade.ALTERACAO_STATUS &&
          atividade.descricao.toLowerCase().includes('conclu') &&
          atividade.data >= periodoFiltro.inicio &&
          atividade.data <= periodoFiltro.fim
        );
      }),
    ).length;

    return {
      projetos: {
        total: projetos.length,
        ativos: projetos.filter(
          (projeto) => projeto.obterStatus() === StatusProjeto.ATIVO,
        ).length,
        pausados: projetos.filter(
          (projeto) => projeto.obterStatus() === StatusProjeto.PAUSADO,
        ).length,
        concluidos: projetos.filter(
          (projeto) => projeto.obterStatus() === StatusProjeto.CONCLUIDO,
        ).length,
        cancelados: projetos.filter(
          (projeto) => projeto.obterStatus() === StatusProjeto.CANCELADO,
        ).length,
      },
      tarefas: {
        total: tarefas.length,
        pendentes: tarefas.filter(
          (tarefa) => tarefa.obterStatus() === StatusTarefa.PENDENTE,
        ).length,
        emAndamento: tarefas.filter(
          (tarefa) => tarefa.obterStatus() === StatusTarefa.EM_ANDAMENTO,
        ).length,
        concluidas: tarefas.filter(
          (tarefa) => tarefa.obterStatus() === StatusTarefa.CONCLUIDA,
        ).length,
        atrasadas: tarefasAtrasadas,
      },
      usuarios: {
        total: usuarios.length,
        ativos: usuariosAtivos.length,
      },
      produtividade: {
        tarefasCriadasUltimos15Dias,
        tarefasConcluidasUltimos15Dias,
        periodo,
        periodoLabel: periodoFiltro.label,
        tarefasCriadasPeriodo,
        tarefasConcluidasPeriodo,
      },
      fluxoCumulativo: this.calcularFluxoCumulativoService.execute(tarefas),
    };
  }

  private calcularPeriodoThroughput(periodo: PeriodoThroughput): {
    inicio: Date;
    fim: Date;
    label: string;
  } {
    const fim = new Date();
    const inicio = new Date();

    if (periodo === 'ano') {
      inicio.setMonth(0, 1);
      inicio.setHours(0, 0, 0, 0);

      return {
        inicio,
        fim,
        label: 'Ano atual',
      };
    }

    const diasPorPeriodo = {
      '15d': 15,
      '30d': 30,
      '90d': 90,
    };

    const dias = diasPorPeriodo[periodo];

    inicio.setDate(inicio.getDate() - dias);
    inicio.setHours(0, 0, 0, 0);

    return {
      inicio,
      fim,
      label: `Últimos ${dias} dias`,
    };
  }

  private formatarPeriodoPersonalizado(inicio?: Date, fim?: Date): string {
    const formatar = (data: Date) => data.toISOString().slice(0, 10).split('-').reverse().join('/');

    if (inicio && fim) {
      return `${formatar(inicio)} até ${formatar(fim)}`;
    }

    if (inicio) {
      return `A partir de ${formatar(inicio)}`;
    }

    if (fim) {
      return `Até ${formatar(fim)}`;
    }

    return 'Período completo';
  }
}
