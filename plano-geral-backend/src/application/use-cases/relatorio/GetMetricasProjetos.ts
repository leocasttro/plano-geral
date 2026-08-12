import {ProjetoRepository} from '../../../domain/repositories/ProjetoRepository';
import {RelatorioMetricasProjetosDTO} from '../../dtos/RelatorioMetricasProjetosDTO';
import {StatusTarefa} from '../../../domain/value-objects/StatusTarefa';
import {TarefaComPrazo} from '../../../domain/entities/TarefaComPrazo';
import {Tarefa} from '../../../domain/entities/Tarefa';
import {TipoAtividade} from '../../../domain/value-objects/TipoAtividade';
import {
  criarResolverCatalogoRelatorio,
  filtrarTarefasRelatorio,
  RelatorioFiltros,
} from './RelatorioFiltros';
import { TituloTarefaCatalogoRepository } from '../../../domain/repositories/TituloTarefaCatalogoRepository';
import { BusinessHoursService } from '../../services/BusinessHoursService';

export class GetMetricasProjetos {
  constructor(
    private projetoRepository: ProjetoRepository,
    private tituloTarefaCatalogoRepository?: TituloTarefaCatalogoRepository,
  ) {}

  async execute(filtros: RelatorioFiltros = {}): Promise<RelatorioMetricasProjetosDTO> {
    const [projetos, catalogos] = await Promise.all([
      this.projetoRepository.findAll(),
      this.tituloTarefaCatalogoRepository?.list({ ativo: true }) ?? Promise.resolve([]),
    ]);
    const projetosFiltrados = filtros.projetoId
      ? projetos.filter((projeto) => projeto.id === filtros.projetoId)
      : projetos;
    const resolverCatalogo = criarResolverCatalogoRelatorio(catalogos);

    return {
      projetos: projetosFiltrados
        .map((projeto) => {
        const tarefas = filtrarTarefasRelatorio(
          projeto.obterTarefas(),
          { ...filtros, projetoId: undefined },
          resolverCatalogo,
        );
        const totalTarefas = tarefas.length;
        const tarefasPendentes = this.contarPorStatus(tarefas, StatusTarefa.PENDENTE);
        const tarefasEmAndamento = this.contarPorStatus(tarefas, StatusTarefa.EM_ANDAMENTO);
        const tarefasConcluidas = this.contarPorStatus(tarefas, StatusTarefa.CONCLUIDA);
        const tarefasSemResponsavel = tarefas.filter((tarefa) => !tarefa.obterResponsavel()).length;
        const tarefasCriticasAbertas = tarefas.filter(
          (tarefa) =>
            tarefa.obterPrioridade() === 'CRITICA' &&
            tarefa.obterStatus() !== StatusTarefa.CONCLUIDA,
        ).length;

        const tarefasComPrazo = tarefas.filter(
          (tarefa) => tarefa instanceof TarefaComPrazo && !!tarefa.getPeriodo().getFim(),
        ) as TarefaComPrazo[];

        const tarefasSemData = tarefas.filter(
          (tarefa) =>
            !(tarefa instanceof TarefaComPrazo) ||
            (!tarefa.getPeriodo().getInicioOptional() && !tarefa.getPeriodo().getFimOptional()),
        ).length;

        const tarefasForaDoPrazo = tarefasComPrazo.filter((tarefa) =>
          this.estaForaDoPrazo(tarefa),
        ).length;

        const tarefasAtrasadas = tarefasComPrazo.filter(
          (tarefa) =>
            tarefa.obterStatus() !== StatusTarefa.CONCLUIDA && tarefa.estaAtrasada(),
        ).length;

        const tarefasDentroDoPrazo = tarefasComPrazo.length - tarefasForaDoPrazo;
        const tarefasVencemEm7Dias = tarefasComPrazo.filter((tarefa) => {
          if (tarefa.obterStatus() === StatusTarefa.CONCLUIDA) return false;

          const dias = tarefa.diasRestantes();
          return dias !== null && dias >= 0 && dias <= 7;
        }).length;

        const totalAlteracoesDatas = tarefas.reduce(
          (total, tarefa) => total + this.contarAlteracoesDatas(tarefa),
          0,
        );
        const tarefasComDatasAlteradas = tarefas.filter(
          (tarefa) => this.contarAlteracoesDatas(tarefa) > 0,
        ).length;
        const throughputUltimos30Dias = tarefas.filter((tarefa) =>
          this.dataConclusao(tarefa) && this.dataConclusao(tarefa)! >= this.diasAtras(30),
        ).length;
        const tarefasParadasMaisDe7Dias = tarefas.filter((tarefa) =>
          tarefa.obterStatus() === StatusTarefa.EM_ANDAMENTO &&
          this.ultimaAtividade(tarefa) < this.diasAtras(7),
        ).length;

        const tempos = this.calcularTempos(tarefas);
        const percentualConclusao = this.percentual(tarefasConcluidas, totalTarefas);
        const percentualTarefasAtrasadas = this.percentual(tarefasAtrasadas, totalTarefas);
        const percentualRespeitoPrazo = this.percentual(tarefasDentroDoPrazo, tarefasComPrazo.length);
        const indiceAvanco = this.percentual(tarefasConcluidas + tarefasEmAndamento * 0.5, totalTarefas);

        return {
          projetoId: projeto.id,
          nome: projeto.nome,
          centroCusto: projeto.obterCentroCusto(),
          status: projeto.obterStatus(),
          saudeProjeto: this.classificarSaude({
            percentualConclusao,
            percentualTarefasAtrasadas,
            tarefasSemResponsavel,
            tarefasSemData,
            tarefasCriticasAbertas,
            tarefasParadasMaisDe7Dias,
          }),
          riscoAtraso: this.classificarRisco({
            percentualTarefasAtrasadas,
            tarefasCriticasAbertas,
            tarefasVencemEm7Dias,
            tarefasParadasMaisDe7Dias,
          }),
          totalTarefas,
          tarefasPendentes,
          tarefasEmAndamento,
          tarefasConcluidas,
          tarefasComPrazo: tarefasComPrazo.length,
          tarefasDentroDoPrazo,
          tarefasForaDoPrazo,
          tarefasAtrasadas,
          tarefasSemResponsavel,
          tarefasSemData,
          tarefasCriticasAbertas,
          tarefasVencemEm7Dias,
          tarefasParadasMaisDe7Dias,
          totalAlteracoesDatas,
          tarefasComDatasAlteradas,
          mediaAlteracoesPorTarefa: totalTarefas
            ? Number((totalAlteracoesDatas / totalTarefas).toFixed(2))
            : 0,
          throughputUltimos30Dias,
          leadTimeMedioHoras: tempos.leadTimeMedioHoras,
          cycleTimeMedioHoras: tempos.cycleTimeMedioHoras,
          tempoEsperaMedioHoras: tempos.tempoEsperaMedioHoras,
          tempoExecucaoMedioHoras: tempos.tempoExecucaoMedioHoras,
          percentualTarefasAtrasadas,
          percentualConclusao,
          percentualRespeitoPrazo,
          indiceAvanco,
          avancou: tarefasEmAndamento + tarefasConcluidas > 0,
          responsaveis: this.resumirResponsaveis(tarefas),
          prioridade: this.resumirPrioridade(tarefas),
          burndown: this.calcularBurndown(tarefas),
        };
      }),
    };
  }

  private contarPorStatus(tarefas: Tarefa[], status: StatusTarefa): number {
    return tarefas.filter((tarefa) => tarefa.obterStatus() === status).length;
  }

  private estaForaDoPrazo(tarefa: TarefaComPrazo): boolean {
    const dataFim = tarefa.getPeriodo().getFim();

    if (!dataFim) return false;

    if (tarefa.obterStatus() !== StatusTarefa.CONCLUIDA) {
      return tarefa.estaAtrasada();
    }

    const dataConclusao = tarefa
      .obterAtividades()
      .filter(
        (atividade) =>
          atividade.tipo === TipoAtividade.ALTERACAO_STATUS &&
          atividade.descricao.toLowerCase().includes('conclu'),
      )
      .map((atividade) => atividade.data)
      .sort((a, b) => b.getTime() - a.getTime())[0];

    if (!dataConclusao) return false;

    return dataConclusao > dataFim;
  }

  private percentual(parte: number, total: number): number {
    if (total === 0) return 0;

    return Number(((parte / total) * 100).toFixed(2));
  }

  private contarAlteracoesDatas(tarefa: Tarefa): number {
    return tarefa.obterAtividades().filter((atividade) => atividade.tipo === TipoAtividade.ALTERACAO_DATAS).length;
  }

  private dataCriacao(tarefa: Tarefa): Date | null {
    return this.primeiraAtividade(tarefa, TipoAtividade.CRIACAO);
  }

  private dataInicio(tarefa: Tarefa): Date | null {
    return this.primeiraAtividade(tarefa, TipoAtividade.ALTERACAO_STATUS, 'inici');
  }

  private dataConclusao(tarefa: Tarefa): Date | null {
    return this.primeiraAtividade(tarefa, TipoAtividade.ALTERACAO_STATUS, 'conclu');
  }

  private primeiraAtividade(tarefa: Tarefa, tipo: TipoAtividade, texto?: string): Date | null {
    const atividade = tarefa
      .obterAtividades()
      .filter((item) => item.tipo === tipo)
      .filter((item) => !texto || item.descricao.toLowerCase().includes(texto))
      .sort((a, b) => a.data.getTime() - b.data.getTime())[0];

    return atividade?.data ?? null;
  }

  private ultimaAtividade(tarefa: Tarefa): Date {
    return tarefa
      .obterAtividades()
      .map((atividade) => atividade.data)
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? new Date(0);
  }

  private diasAtras(dias: number): Date {
    const data = new Date();
    data.setDate(data.getDate() - dias);
    return data;
  }

  private calcularTempos(tarefas: Tarefa[]) {
    const leadTimes: number[] = [];
    const cycleTimes: number[] = [];
    const temposEspera: number[] = [];
    const temposExecucao: number[] = [];

    tarefas.forEach((tarefa) => {
      const inicio = this.dataInicio(tarefa);
      const conclusao = this.dataConclusao(tarefa);

      if (inicio && conclusao) leadTimes.push(this.horasEntre(inicio, conclusao));
      if (inicio && conclusao) cycleTimes.push(this.horasEntre(inicio, conclusao));
      const criacao = this.dataCriacao(tarefa);
      if (criacao && inicio) temposEspera.push(this.horasEntre(criacao, inicio));
      if (inicio && conclusao) temposExecucao.push(this.horasEntre(inicio, conclusao));
    });

    return {
      leadTimeMedioHoras: this.media(leadTimes),
      cycleTimeMedioHoras: this.media(cycleTimes),
      tempoEsperaMedioHoras: this.media(temposEspera),
      tempoExecucaoMedioHoras: this.media(temposExecucao),
    };
  }

  private horasEntre(inicio: Date, fim: Date): number {
    return BusinessHoursService.calcularHoras(inicio, fim);
  }

  private media(valores: number[]): number | null {
    if (!valores.length) return null;
    return Number((valores.reduce((total, valor) => total + valor, 0) / valores.length).toFixed(2));
  }

  private classificarSaude(input: {
    percentualConclusao: number;
    percentualTarefasAtrasadas: number;
    tarefasSemResponsavel: number;
    tarefasSemData: number;
    tarefasCriticasAbertas: number;
    tarefasParadasMaisDe7Dias: number;
  }): 'SAUDAVEL' | 'ATENCAO' | 'CRITICO' {
    let pontos = 0;
    if (input.percentualTarefasAtrasadas >= 25) pontos += 3;
    else if (input.percentualTarefasAtrasadas >= 10) pontos += 1;
    if (input.tarefasCriticasAbertas > 0) pontos += 2;
    if (input.tarefasParadasMaisDe7Dias > 0) pontos += 2;
    if (input.tarefasSemResponsavel > 0) pontos += 1;
    if (input.tarefasSemData > 0) pontos += 1;
    if (input.percentualConclusao >= 80) pontos -= 1;

    if (pontos >= 5) return 'CRITICO';
    if (pontos >= 2) return 'ATENCAO';
    return 'SAUDAVEL';
  }

  private classificarRisco(input: {
    percentualTarefasAtrasadas: number;
    tarefasCriticasAbertas: number;
    tarefasVencemEm7Dias: number;
    tarefasParadasMaisDe7Dias: number;
  }): 'BAIXO' | 'MEDIO' | 'ALTO' {
    let pontos = 0;
    if (input.percentualTarefasAtrasadas >= 20) pontos += 3;
    else if (input.percentualTarefasAtrasadas >= 8) pontos += 1;
    if (input.tarefasCriticasAbertas > 0) pontos += 2;
    if (input.tarefasVencemEm7Dias >= 3) pontos += 2;
    else if (input.tarefasVencemEm7Dias > 0) pontos += 1;
    if (input.tarefasParadasMaisDe7Dias > 0) pontos += 1;

    if (pontos >= 5) return 'ALTO';
    if (pontos >= 2) return 'MEDIO';
    return 'BAIXO';
  }

  private resumirResponsaveis(tarefas: Tarefa[]) {
    const mapa = new Map<string, {
      usuarioId: string;
      totalTarefas: number;
      pendentes: number;
      emAndamento: number;
      concluidas: number;
      atrasadas: number;
      percentualConclusao: number;
    }>();

    tarefas.forEach((tarefa) => {
      const usuarioId = tarefa.obterResponsavel();
      if (!usuarioId) return;

      const item = mapa.get(usuarioId) ?? {
        usuarioId,
        totalTarefas: 0,
        pendentes: 0,
        emAndamento: 0,
        concluidas: 0,
        atrasadas: 0,
        percentualConclusao: 0,
      };

      item.totalTarefas += 1;
      if (tarefa.obterStatus() === StatusTarefa.PENDENTE) item.pendentes += 1;
      if (tarefa.obterStatus() === StatusTarefa.EM_ANDAMENTO) item.emAndamento += 1;
      if (tarefa.obterStatus() === StatusTarefa.CONCLUIDA) item.concluidas += 1;
      if (tarefa instanceof TarefaComPrazo && tarefa.obterStatus() !== StatusTarefa.CONCLUIDA && tarefa.estaAtrasada()) item.atrasadas += 1;
      item.percentualConclusao = this.percentual(item.concluidas, item.totalTarefas);

      mapa.set(usuarioId, item);
    });

    return Array.from(mapa.values()).sort((a, b) => b.totalTarefas - a.totalTarefas);
  }

  private resumirPrioridade(tarefas: Tarefa[]) {
    return tarefas.reduce(
      (total, tarefa) => {
        total[tarefa.obterPrioridade()] += 1;
        return total;
      },
      { BAIXA: 0, MEDIA: 0, ALTA: 0, CRITICA: 0 },
    );
  }

  private calcularBurndown(tarefas: Tarefa[]) {
    const hoje = new Date();
    const inicio = this.diasAtras(29);
    inicio.setHours(0, 0, 0, 0);
    const totalDias = 30;

    const pontosBase = Array.from({ length: totalDias }, (_, indice) => {
      const data = new Date(inicio);
      data.setDate(inicio.getDate() + indice);
      return data;
    });

    const trabalhoInicial = this.contarRestantesAteFimDoDia(
      tarefas,
      pontosBase[0],
      hoje,
    );

    return pontosBase.map((data, indice) => {
      const dataLabel = data.toISOString().slice(0, 10);

      const criadas = tarefas.filter((tarefa) => {
        const criadaEm = this.dataCriacao(tarefa);
        return criadaEm && this.mesmoDia(criadaEm, data);
      }).length;
      const concluidas = tarefas.filter((tarefa) => {
        const concluidaEm = this.dataConclusao(tarefa);
        return concluidaEm && this.mesmoDia(concluidaEm, data);
      }).length;
      const restantes = this.contarRestantesAteFimDoDia(tarefas, data, hoje);
      const restanteIdeal = this.calcularRestanteIdeal(
        trabalhoInicial,
        indice,
        totalDias,
      );

      return {
        data: dataLabel,
        criadas,
        concluidas,
        restantes,
        restanteIdeal,
        desvio: restantes - restanteIdeal,
      };
    });
  }

  private contarRestantesAteFimDoDia(
    tarefas: Tarefa[],
    data: Date,
    hoje: Date,
  ): number {
    const fimDoDia = new Date(data);
    fimDoDia.setHours(23, 59, 59, 999);

    return tarefas.filter((tarefa) => {
      const criadaEm = this.dataCriacao(tarefa) ?? hoje;
      const concluidaEm = this.dataConclusao(tarefa);

      if (!concluidaEm && tarefa.obterStatus() === StatusTarefa.CONCLUIDA) {
        return false;
      }

      return criadaEm <= fimDoDia && (!concluidaEm || concluidaEm > fimDoDia);
    }).length;
  }

  private calcularRestanteIdeal(
    trabalhoInicial: number,
    indice: number,
    totalDias: number,
  ): number {
    if (trabalhoInicial === 0) return 0;

    const progressoEsperado = indice / Math.max(totalDias - 1, 1);
    return Math.max(0, Math.round(trabalhoInicial * (1 - progressoEsperado)));
  }

  private mesmoDia(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }
}
