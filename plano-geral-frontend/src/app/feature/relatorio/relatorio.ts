import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap, take } from 'rxjs/operators';
import { RelatorioApi } from '../../domain/relatorio/relatorio.api';
import {
  RelatorioCargaUsuariosDTO,
  RelatorioDashboardDTO,
  RelatorioMetricasProjetosDTO,
  RelatorioTempoMedioPorTituloDTO,
  TarefaUsuarioDetalhe,
} from '../../domain/relatorio/relatorio.model';
import { TarefaApi } from '../../domain/tarefa/tarefa.api';
import { ProductivityChartComponent } from '../../shared/dashboard/productivity-chart/productivity-chart';
import { ProjectStatusChartComponent } from '../../shared/dashboard/project-status-chart/project-status-chart';
import { StatusMixChartComponent } from '../../shared/dashboard/status-mix-chart/status-mix-chart';
import { UserPerformanceChartComponent } from '../../shared/dashboard/user-performance-chart/user-performance-chart';
import { CumulativeFlowChartComponent } from '../../shared/dashboard/cumulative-flow-chart/cumulative-flow-chart';
import { ProjectRadarChartComponent } from '../../shared/dashboard/project-radar-chart/project-radar-chart';

type UsuarioCarga = RelatorioCargaUsuariosDTO['usuarios'][number];
type MetricaProjeto = RelatorioMetricasProjetosDTO['projetos'][number];
type MetricaTitulo = RelatorioTempoMedioPorTituloDTO['titulos'][number];
type PeriodoThroughput = '15d' | '30d' | '90d' | 'ano';

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductivityChartComponent,
    ProjectStatusChartComponent,
    StatusMixChartComponent,
    UserPerformanceChartComponent,
    CumulativeFlowChartComponent,
    ProjectRadarChartComponent,
  ],
  templateUrl: './relatorio.html',
  styleUrl: './relatorio.scss',
  animations: [
    trigger('reportFade', [
      transition('* => *', [
        animate(
          '360ms cubic-bezier(0.22, 1, 0.36, 1)',
          keyframes([
            style({
              opacity: 0.55,
              transform: 'translateY(6px)',
              filter: 'blur(2px)',
              offset: 0,
            }),
            style({
              opacity: 0.85,
              transform: 'translateY(2px)',
              filter: 'blur(0.5px)',
              offset: 0.55,
            }),
            style({
              opacity: 1,
              transform: 'translateY(0)',
              filter: 'blur(0)',
              offset: 1,
            }),
          ]),
        ),
      ]),
    ]),
  ],
})

export class Relatorio implements OnInit {
  dashboard: RelatorioDashboardDTO | null = null;
  cargaUsuarios: RelatorioCargaUsuariosDTO | null = null;
  metricasProjetos: RelatorioMetricasProjetosDTO | null = null;
  metricasTitulos: RelatorioTempoMedioPorTituloDTO | null = null;

  usuarioSelecionado: UsuarioCarga | null = null;
  projetoSelecionado: MetricaProjeto | null = null;
  tituloSelecionado: MetricaTitulo | null = null;
  tarefasUsuario: TarefaUsuarioDetalhe[] = [];

  periodoThroughput: PeriodoThroughput = '15d';

  buscaTituloMetrica = '';

  loading = false;
  loadingModal = false;
  error = '';

  modalAberto = false;
  modalTitulo = '';

  constructor(
    private relatorioApi: RelatorioApi,
    private tarefaApi: TarefaApi,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarTela();
  }

  carregarTela(exibirLoading = true): void {
    this.loading = exibirLoading;
    this.error = '';

    forkJoin({
      dashboard: this.relatorioApi.dashboard(this.periodoThroughput),
      cargaUsuarios: this.relatorioApi.cargaUsuarios(),
      metricasProjetos: this.relatorioApi.metricasProjetos().pipe(
        catchError((err) => {
          console.error('Erro ao buscar métricas dos projetos:', err);
          return of({ projetos: [] });
        }),
      ),
      metricasTitulos: this.relatorioApi.tempoMedioPorTitulo().pipe(
        catchError((err) => {
          console.error('Erro ao buscar métricas por título:', err);
          return of({ totalTitulos: 0, titulos: [] });
        }),
      ),
    })
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: ({ dashboard, cargaUsuarios, metricasProjetos, metricasTitulos }) => {
          this.dashboard = dashboard;
          this.cargaUsuarios = cargaUsuarios;
          this.metricasProjetos = metricasProjetos;
          this.metricasTitulos = metricasTitulos;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Erro ao carregar relatórios.';
        },
      });
  }

  alterarPeriodoThroughput(periodo: PeriodoThroughput): void {
    if (this.periodoThroughput === periodo) {
      return;
    }

    this.periodoThroughput = periodo;
    this.carregarTela(false);
  }

  abrirModalDashboard(tipo: string): void {
    this.usuarioSelecionado = null;
    this.projetoSelecionado = null;
    this.tituloSelecionado = null;
    this.tarefasUsuario = [];
    this.loadingModal = false;
    this.modalTitulo = tipo;
    this.modalAberto = true;
    this.cdr.detectChanges();
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.usuarioSelecionado = null;
    this.projetoSelecionado = null;
    this.tituloSelecionado = null;
    this.tarefasUsuario = [];
    this.loadingModal = false;
    this.cdr.detectChanges();
  }

  abrirProjetoMetricas(projeto: MetricaProjeto): void {
    this.usuarioSelecionado = null;
    this.projetoSelecionado = projeto;
    this.tituloSelecionado = null;
    this.tarefasUsuario = [];
    this.loadingModal = false;
    this.modalTitulo = `Métricas de ${projeto.nome}`;
    this.modalAberto = true;
    this.cdr.detectChanges();
  }

  abrirUsuario(usuario: UsuarioCarga): void {
    this.projetoSelecionado = null;
    this.tituloSelecionado = null;
    this.usuarioSelecionado = usuario;
    this.modalTitulo = `Métricas de ${usuario.nome}`;
    this.modalAberto = true;
    this.loadingModal = true;
    this.tarefasUsuario = [];
    this.cdr.detectChanges();

    this.tarefaApi
      .buscarTodos()
      .pipe(
        take(1),
        catchError((err) => {
          console.error('Erro ao buscar tarefas:', err);
          return of([]);
        }),
        map((tarefas) =>
          tarefas.filter((tarefa) => {
            const responsavelId =
              tarefa.responsavelId ?? tarefa.responsavel?.id ?? null;

            return responsavelId === usuario.usuarioId;
          }),
        ),
        switchMap((tarefas) => {
          if (!tarefas.length) {
            return of([]);
          }

          return forkJoin(
            tarefas.map((tarefa) =>
              forkJoin({
                alteracoes: this.relatorioApi
                  .alteracoesDatasTarefa(tarefa.id)
                  .pipe(
                    take(1),
                    catchError((err) => {
                      console.error('Erro ao buscar alterações:', err);
                      return of(null);
                    }),
                  ),
                tempos: this.relatorioApi
                  .tempoTarefaPorResponsavel(tarefa.id)
                  .pipe(
                    take(1),
                    catchError((err) => {
                      console.error('Erro ao buscar tempo:', err);
                      return of([]);
                    }),
                  ),
              }).pipe(
                map(({ alteracoes, tempos }) => {
                  const tempoDoUsuario = tempos
                    .filter(
                      (tempo) =>
                        tempo.responsavel === usuario.usuarioId ||
                        tempo.responsavel === usuario.nome
                    )
                    .reduce((total, tempo) => total + tempo.duracaoHoras, 0);

                  const tempoComUsuarioHoras = Number(tempoDoUsuario.toFixed(2));

                  return {
                    id: tarefa.id,
                    titulo: tarefa.titulo,
                    status: tarefa.status,
                    prioridade: tarefa.prioridade,
                    dataInicio: tarefa.dataInicio,
                    dataFim: tarefa.dataFim,
                    dataInicioFormatada: this.formatarDataBrasil(tarefa.dataInicio),
                    dataFimFormatada: this.formatarDataBrasil(tarefa.dataFim),
                    totalAlteracoesDatas: alteracoes?.totalAlteracoes ?? 0,
                    tempoComUsuarioHoras,
                    tempoComUsuarioFormatado: this.formatarHorasBrasil(tempoComUsuarioHoras),
                  };
                }),
              ),
            ),
          );
        }),
        finalize(() => {
          this.loadingModal = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (tarefasDetalhe) => {
          this.tarefasUsuario = tarefasDetalhe;
        },
        error: (err) => {
          console.error('Erro ao montar detalhes do usuário:', err);
          this.tarefasUsuario = [];
        },
      });
  }

  abrirTituloMetricas(titulo: MetricaTitulo): void {
    this.usuarioSelecionado = null;
    this.projetoSelecionado = null;
    this.tituloSelecionado = titulo;
    this.tarefasUsuario = [];
    this.loadingModal = false;
    this.modalTitulo = `Métricas de ${titulo.titulo}`;
    this.modalAberto = true;
    this.cdr.detectChanges();
  }

  formatarDataBrasil(data?: string | null): string {
    if (!data) {
      return 'sem data';
    }

    const date = new Date(data);

    if (Number.isNaN(date.getTime())) {
      return 'sem data';
    }

    return date.toLocaleDateString('pt-BR', {
      timeZone: 'UTC',
    });
  }

  formatarHorasBrasil(horas?: number | null): string {
    if (!horas || horas <= 0) {
      return '0h';
    }

    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);

    if (horasInteiras === 0) {
      return `${minutos}min`;
    }

    if (minutos === 0) {
      return `${horasInteiras}h`;
    }

    return `${horasInteiras}h ${minutos}min`;
  }

  iniciais(valor?: string | null): string {
    return (valor ?? '').trim().slice(0, 2).toUpperCase();
  }

  codigoCurto(valor?: string | null): string {
    return (valor ?? '').trim().slice(0, 8).toUpperCase();
  }

  larguraTempoMedio(horas?: number | null): number {
    if (!horas || horas <= 0) {
      return 0;
    }

    return Math.min(horas, 100);
  }

  get metricasTitulosFiltradas() {
    const busca = this.buscaTituloMetrica.trim().toLowerCase();
    const titulos = this.metricasTitulos?.titulos ?? [];

    if (!busca) {
      return titulos;
    }

    return titulos.filter((item) =>
      item.titulo.toLowerCase().includes(busca),
    );
  }

  totalHorasUsuario(): number {
    return Number(
      this.tarefasUsuario
        .reduce((total, tarefa) => total + tarefa.tempoComUsuarioHoras, 0)
        .toFixed(2),
    );
  }

  totalAlteracoesUsuario(): number {
    return this.tarefasUsuario.reduce(
      (total, tarefa) => total + tarefa.totalAlteracoesDatas,
      0,
    );
  }

  percentualNoPrazoUsuario(): number {
    if (!this.usuarioSelecionado?.totalTarefas) {
      return 0;
    }

    const noPrazo =
      this.usuarioSelecionado.totalTarefas - this.usuarioSelecionado.atrasadas;

    return Math.max(
      0,
      Math.round((noPrazo / this.usuarioSelecionado.totalTarefas) * 100),
    );
  }

}
