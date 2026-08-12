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
  RelatorioLeadTimeDTO,
  RelatorioDisponibilidadeUsuariosDTO,
  MetricaCatalogoGrupoDTO,
} from '../../domain/relatorio/relatorio.model';
import { TarefaApi } from '../../domain/tarefa/tarefa.api';
import { ProjetoApi } from '../../domain/projeto/projeto.api';
import { ProjetoDTO } from '../../domain/projeto/projetoModel';
import { TituloTarefaApi } from '../../domain/titulo-tarefa/titulo-tarefa.api';
import { TituloTarefaCatalogoDTO } from '../../domain/titulo-tarefa/titulo-tarefa.model';
import { UsuarioApi } from '../../domain/usuario/usuario.api';
import { UsuarioDTO } from '../../domain/usuario/usuario.model';
import { FiltrosOperacionaisComponent } from '../../shared/components/filtros-operacionais/filtros-operacionais';
import { FiltrosOperacionais } from '../../shared/components/filtros-operacionais/filtros-operacionais.model';
import { ProjectStatusChartComponent } from '../../shared/dashboard/project-status-chart/project-status-chart';
import { UserPerformanceChartComponent } from '../../shared/dashboard/user-performance-chart/user-performance-chart';
import { ProjectRadarChartComponent } from '../../shared/dashboard/project-radar-chart/project-radar-chart';

type UsuarioCarga = RelatorioCargaUsuariosDTO['usuarios'][number];
type MetricaProjeto = RelatorioMetricasProjetosDTO['projetos'][number];
type MetricaTitulo = RelatorioTempoMedioPorTituloDTO['titulos'][number];
type TipoGrupoCatalogo = 'componente' | 'atividadePrincipal' | 'subatividade';
type PeriodoThroughput = '15d' | '30d' | '90d' | 'ano';

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FiltrosOperacionaisComponent,
    ProjectStatusChartComponent,
    UserPerformanceChartComponent,
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
  projetosFiltro: ProjetoDTO[] = [];
  catalogosFiltro: TituloTarefaCatalogoDTO[] = [];
  usuariosFiltro: UsuarioDTO[] = [];

  usuarioSelecionado: UsuarioCarga | null = null;
  projetoSelecionado: MetricaProjeto | null = null;
  tituloSelecionado: MetricaTitulo | null = null;
  tarefasUsuario: TarefaUsuarioDetalhe[] = [];

  periodoThroughput: PeriodoThroughput = '15d';
  filtrosRelatorio: FiltrosOperacionais = {};

  buscaTituloMetrica = '';

  loading = false;
  loadingModal = false;
  error = '';

  modalAberto = false;
  modalTitulo = '';

  leadTime: RelatorioLeadTimeDTO | null = null;
  disponibilidadeUsuarios: RelatorioDisponibilidadeUsuariosDTO | null = null;

  constructor(
    private relatorioApi: RelatorioApi,
    private tarefaApi: TarefaApi,
    private projetoApi: ProjetoApi,
    private tituloTarefaApi: TituloTarefaApi,
    private usuarioApi: UsuarioApi,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarTela();
  }

  carregarTela(exibirLoading = true): void {
    this.loading = exibirLoading;
    this.error = '';
    const filtros = this.filtrosRelatorioRequest();

    forkJoin({
      dashboard: this.relatorioApi.dashboard(this.periodoThroughput, filtros),
      cargaUsuarios: this.relatorioApi.cargaUsuarios(filtros),
      metricasProjetos: this.relatorioApi.metricasProjetos(filtros).pipe(
        catchError((err) => {
          console.error('Erro ao buscar métricas dos projetos:', err);
          return of({ projetos: [] });
        }),
      ),
      metricasTitulos: this.relatorioApi.tempoMedioPorTitulo(filtros).pipe(
        catchError((err) => {
          console.error('Erro ao buscar métricas por título:', err);
          return of({ totalTitulos: 0, componentes: [], atividadesPrincipais: [], subatividades: [], titulos: [] });
        }),
      ),
      projetosFiltro: this.projetoApi.buscarTodos().pipe(
        catchError((err) => {
          console.error('Erro ao buscar projetos para filtro:', err);
          return of([]);
        }),
      ),
      catalogosFiltro: this.tituloTarefaApi.listar().pipe(
        catchError((err) => {
          console.error('Erro ao buscar catálogo para filtro:', err);
          return of([]);
        }),
      ),
      usuariosFiltro: this.usuarioApi.buscarTodos().pipe(
        catchError((err) => {
          console.error('Erro ao buscar usuários para filtro:', err);
          return of([]);
        }),
      ),
      leadTime: this.relatorioApi.leadTime().pipe(
        catchError((err) => {
          console.error('Erro ao buscar lead time:', err);

          return of({
            geral: {
              totalTarefas: 0,
              tarefasComLeadTime: 0,
              tarefasSemLeadTime: 0,
              tempoMedioHoras: null,
              tempoMedioDias: null,
            },
            porProjeto: [],
            porResponsavel: [],
            porPeriodo: [],
          });
        }),
      ),
      disponibilidadeUsuarios: this.relatorioApi.disponibilidadeUsuarios(filtros).pipe(
        catchError((err) => {
          console.error('Erro ao buscar disponibilidade de usuários:', err);
          return of({ totalUsuarios: 0, usuarios: [] });
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
        next: ({
          dashboard,
          cargaUsuarios,
          metricasProjetos,
          metricasTitulos,
          projetosFiltro,
          catalogosFiltro,
          usuariosFiltro,
          leadTime,
          disponibilidadeUsuarios,
        }) => {
          this.dashboard = dashboard;
          this.cargaUsuarios = cargaUsuarios;
          this.metricasProjetos = metricasProjetos;
          this.metricasTitulos = metricasTitulos;
          this.projetosFiltro = projetosFiltro;
          this.catalogosFiltro = catalogosFiltro;
          this.usuariosFiltro = usuariosFiltro;
          this.leadTime = leadTime;
          this.disponibilidadeUsuarios = disponibilidadeUsuarios;
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

  atualizarFiltrosRelatorio(filtros: FiltrosOperacionais): void {
    this.filtrosRelatorio = filtros;
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

  formatarMesAno(valor?: string | null): string {
    if (!valor) {
      return 'sem período';
    }

    const match = valor.match(/^(\d{4})-(\d{2})$/);

    if (match) {
      const [, ano, mes] = match;
      return `${mes}/${ano}`;
    }

    return valor;
  }

  formatarHorasBrasil(horas?: number | null): string {
    if (!horas || horas <= 0) {
      return '0min';
    }

    const totalMinutos = Math.max(1, Math.round(horas * 60));

    if (totalMinutos < 60) {
      return `${totalMinutos}min`;
    }

    const horasInteiras = Math.floor(totalMinutos / 60);
    const minutosRestantes = totalMinutos % 60;

    if (minutosRestantes === 0) {
      return `${horasInteiras}h`;
    }

    return `${horasInteiras}h ${minutosRestantes}min`;
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

  larguraGrupoCatalogo(item: MetricaCatalogoGrupoDTO, itens: MetricaCatalogoGrupoDTO[]): number {
    const maior = Math.max(...itens.map((grupo) => grupo.totalTarefas), 1);
    return Math.max(item.totalTarefas > 0 ? 4 : 0, Math.round((item.totalTarefas / maior) * 100));
  }

  larguraTituloMetrica(item: MetricaTitulo): number {
    const maior = Math.max(...this.metricasTitulosFiltradas.map((titulo) => titulo.totalTarefas), 1);
    return Math.max(item.totalTarefas > 0 ? 4 : 0, Math.round((item.totalTarefas / maior) * 100));
  }

  tamanhoBolhaCatalogo(item: MetricaCatalogoGrupoDTO, itens: MetricaCatalogoGrupoDTO[]): number {
    const maior = Math.max(...itens.map((grupo) => grupo.totalTarefas), 1);
    const proporcao = item.totalTarefas / maior;

    return Math.round(82 + proporcao * 58);
  }

  larguraTempoCatalogo(
    item: MetricaCatalogoGrupoDTO,
    itens: MetricaCatalogoGrupoDTO[],
    tipo: TipoGrupoCatalogo,
  ): number {
    const maiorTempo = Math.max(...itens.map((grupo) => this.tempoVisualCatalogo(grupo, tipo)), 1);
    const tempo = this.tempoVisualCatalogo(item, tipo);

    return Math.max(tempo > 0 ? 6 : 0, Math.round((tempo / maiorTempo) * 100));
  }

  alturaTempoCatalogo(
    item: MetricaCatalogoGrupoDTO,
    itens: MetricaCatalogoGrupoDTO[],
    tipo: TipoGrupoCatalogo,
  ): number {
    const maiorTempo = Math.max(...itens.map((grupo) => this.tempoVisualCatalogo(grupo, tipo)), 1);
    const tempo = this.tempoVisualCatalogo(item, tipo);

    return Math.max(tempo > 0 ? 8 : 0, Math.round((tempo / maiorTempo) * 100));
  }

  gruposMaiorTempo(
    itens: MetricaCatalogoGrupoDTO[],
    tipo: TipoGrupoCatalogo,
    limite = 6,
  ): MetricaCatalogoGrupoDTO[] {
    return [...itens]
      .filter((item) => item.totalTarefas > 0 && this.tempoVisualCatalogo(item, tipo) > 0)
      .sort(
        (a, b) =>
          this.tempoVisualCatalogo(b, tipo) - this.tempoVisualCatalogo(a, tipo) ||
          b.totalTarefas - a.totalTarefas ||
          a.nome.localeCompare(b.nome),
      )
      .slice(0, limite);
  }

  totalGruposComTempo(itens: MetricaCatalogoGrupoDTO[]): number {
    return itens.filter(
      (item) => item.totalTarefas > 0 && (item.tempoMedioHoras ?? 0) > 0,
    ).length;
  }

  tempoTotalCatalogo(catalogo: RelatorioTempoMedioPorTituloDTO): number {
    return Number(
      catalogo.titulos
        .reduce(
          (total, item) => total + (this.tempoVisualTitulo(item) * item.totalTarefas),
          0,
        )
        .toFixed(2),
    );
  }

  mediaTempoCatalogo(catalogo: RelatorioTempoMedioPorTituloDTO): number {
    const totalTarefas = catalogo.titulos.reduce((total, item) => total + item.totalTarefas, 0);

    if (!totalTarefas) return 0;

    return Number((this.tempoTotalCatalogo(catalogo) / totalTarefas).toFixed(2));
  }

  totalTarefasCatalogo(catalogo: RelatorioTempoMedioPorTituloDTO): number {
    return catalogo.titulos.reduce((total, item) => total + item.totalTarefas, 0);
  }

  topComponentesCatalogo(catalogo: RelatorioTempoMedioPorTituloDTO): MetricaCatalogoGrupoDTO[] {
    return this.gruposMaiorTempo(catalogo.componentes, 'componente', 6);
  }

  topAtividadesCatalogo(catalogo: RelatorioTempoMedioPorTituloDTO): MetricaCatalogoGrupoDTO[] {
    return this.gruposMaiorTempo(catalogo.atividadesPrincipais, 'atividadePrincipal', 6);
  }

  topSubatividadesCatalogo(catalogo: RelatorioTempoMedioPorTituloDTO): MetricaCatalogoGrupoDTO[] {
    return this.gruposMaiorTempo(catalogo.subatividades, 'subatividade', 6);
  }

  distribuicaoAtividadesCatalogo(catalogo: RelatorioTempoMedioPorTituloDTO): MetricaCatalogoGrupoDTO[] {
    return [...catalogo.atividadesPrincipais]
      .filter((item) => item.totalTarefas > 0)
      .sort(
        (a, b) =>
          b.totalTarefas - a.totalTarefas ||
          (b.tempoMedioHoras ?? 0) - (a.tempoMedioHoras ?? 0) ||
          a.nome.localeCompare(b.nome),
      );
  }

  catalogoDonutStyle(catalogo: RelatorioTempoMedioPorTituloDTO): string {
    const itens = this.distribuicaoAtividadesCatalogo(catalogo);
    const total = itens.reduce((soma, item) => soma + item.totalTarefas, 0);
    const cores = [
      '#e40046',
      '#6d28d9',
      '#10b981',
      '#0d6efd',
      '#f59e0b',
      '#14b8a6',
      '#8b5cf6',
      '#f97316',
      '#475569',
      '#06b6d4',
    ];
    let atual = 0;

    if (!total) {
      return 'conic-gradient(#e5e7eb 0 360deg)';
    }

    const partes = itens.map((item, index) => {
      const inicio = atual;
      const fim = atual + (item.totalTarefas / total) * 360;
      atual = fim;
      return `${cores[index]} ${inicio}deg ${fim}deg`;
    });

    return `conic-gradient(${partes.join(', ')})`;
  }

  catalogoCorIndice(index: number): string {
    return [
      '#e40046',
      '#6d28d9',
      '#10b981',
      '#0d6efd',
      '#f59e0b',
      '#14b8a6',
      '#8b5cf6',
      '#f97316',
      '#475569',
      '#06b6d4',
    ][index % 10];
  }

  classeTempoCatalogo(
    item: MetricaCatalogoGrupoDTO,
    itens: MetricaCatalogoGrupoDTO[],
    tipo: TipoGrupoCatalogo,
  ): string {
    return this.classeTempoPorReferencia(
      this.tempoVisualCatalogo(item, tipo),
      itens.map((grupo) => this.tempoVisualCatalogo(grupo, tipo)),
    );
  }

  tamanhoBolhaTitulo(item: MetricaTitulo): number {
    const maior = Math.max(...this.metricasTitulosFiltradas.map((titulo) => titulo.totalTarefas), 1);
    const proporcao = item.totalTarefas / maior;

    return Math.round(78 + proporcao * 60);
  }

  larguraTempoTitulo(item: MetricaTitulo): number {
    const maiorTempo = Math.max(
      ...this.metricasTitulosFiltradas.map((titulo) => this.tempoVisualTitulo(titulo)),
      1,
    );
    const tempo = this.tempoVisualTitulo(item);

    return Math.max(tempo > 0 ? 6 : 0, Math.round((tempo / maiorTempo) * 100));
  }

  alturaTempoTitulo(item: MetricaTitulo): number {
    const maiorTempo = Math.max(
      ...this.metricasTitulosFiltradas.map((titulo) => this.tempoVisualTitulo(titulo)),
      1,
    );
    const tempo = this.tempoVisualTitulo(item);

    return Math.max(tempo > 0 ? 8 : 0, Math.round((tempo / maiorTempo) * 100));
  }

  classeTempoTitulo(item: MetricaTitulo): string {
    return this.classeTempoPorReferencia(
      this.tempoVisualTitulo(item),
      this.metricasTitulosFiltradas.map((titulo) => this.tempoVisualTitulo(titulo)),
    );
  }

  private classeTempoPorReferencia(tempo?: number | null, referencias: number[] = []): string {
    if (!tempo || tempo <= 0) {
      return 'empty';
    }

    const maiorTempo = Math.max(...referencias.filter((valor) => valor > 0), 1);
    const proporcao = tempo / maiorTempo;

    if (proporcao >= 0.66) {
      return 'slow';
    }

    if (proporcao >= 0.33) {
      return 'medium';
    }

    return 'fast';
  }

  larguraLeadTimeTitulo(
    horas: number | null,
    titulo: MetricaTitulo,
  ): number {
    if (!horas || horas <= 0) {
      return 0;
    }

    const maiorTempo = Math.max(
      ...titulo.tarefas
        .map((tarefa) => tarefa.duracaoHoras ?? 0)
        .filter((tempo) => tempo > 0),
      1,
    );

    return Math.max(4, Math.round((horas / maiorTempo) * 100));
  }

  larguraEtapaTitulo(
    valor: number | null,
    tarefa: MetricaTitulo['tarefas'][number],
  ): number {
    if (!valor || valor <= 0) {
      return 0;
    }

    const total =
      (tarefa.tempoEsperaHoras ?? 0) + (tarefa.tempoExecucaoHoras ?? 0);

    if (total <= 0) {
      return 0;
    }

    return Math.max(3, Math.round((valor / total) * 100));
  }

  totalEtapasTitulo(tarefa: MetricaTitulo['tarefas'][number]): number {
    return Number(
      ((tarefa.tempoEsperaHoras ?? 0) + (tarefa.tempoExecucaoHoras ?? 0)).toFixed(2),
    );
  }

  tempoExecucaoTitulo(tarefa: MetricaTitulo['tarefas'][number]): number {
    return Number(((tarefa.tempoExecucaoHoras ?? tarefa.duracaoHoras ?? 0)).toFixed(2));
  }

  tempoVisualTitulo(item: MetricaTitulo): number {
    const tempos = item.tarefas
      .map((tarefa) => this.tempoVisualTarefa(tarefa))
      .filter((tempo) => tempo > 0);

    if (tempos.length) {
      return Number((tempos.reduce((total, tempo) => total + tempo, 0) / tempos.length).toFixed(2));
    }

    return item.tempoMedioHoras ?? 0;
  }

  tempoVisualCatalogo(item: MetricaCatalogoGrupoDTO, tipo: TipoGrupoCatalogo): number {
    const nomeGrupo = this.normalizarTexto(item.nome);
    const titulos = (this.metricasTitulos?.titulos ?? []).filter(
      (titulo) => this.normalizarTexto(this.valorGrupoTitulo(titulo, tipo)) === nomeGrupo,
    );
    const tempos = titulos
      .flatMap((titulo) => titulo.tarefas.map((tarefa) => this.tempoVisualTarefa(tarefa)))
      .filter((tempo) => tempo > 0);

    if (tempos.length) {
      return Number((tempos.reduce((total, tempo) => total + tempo, 0) / tempos.length).toFixed(2));
    }

    return item.tempoMedioHoras ?? 0;
  }

  percentualTitulo(valor: number, total: number): number {
    if (!total) {
      return 0;
    }

    return Math.round((valor / total) * 100);
  }

  private tempoVisualTarefa(tarefa: MetricaTitulo['tarefas'][number]): number {
    return this.tempoExecucaoTitulo(tarefa);
  }

  private valorGrupoTitulo(titulo: MetricaTitulo, tipo: TipoGrupoCatalogo): string | null {
    if (tipo === 'componente') {
      return titulo.componente;
    }

    if (tipo === 'atividadePrincipal') {
      return titulo.atividadePrincipal;
    }

    return titulo.subatividade;
  }

  private normalizarTexto(valor?: string | null): string {
    return (valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  statusLabel(status: string): string {
    switch (String(status).toUpperCase()) {
      case 'CONCLUIDA':
        return 'Concluída';
      case 'EM_ANDAMENTO':
        return 'Em andamento';
      case 'PENDENTE':
        return 'Pendente';
      default:
        return status;
    }
  }

  statusClasse(status: string): string {
    switch (String(status).toUpperCase()) {
      case 'CONCLUIDA':
        return 'done';
      case 'EM_ANDAMENTO':
        return 'progress';
      case 'PENDENTE':
        return 'pending';
      default:
        return 'created';
    }
  }

  disponibilidadeLabel(status: string): string {
    switch (String(status).toUpperCase()) {
      case 'DISPONIVEL':
        return 'Disponível';
      case 'OCUPADO':
        return 'Ocupado';
      case 'SEM_DADOS':
        return 'Sem dados';
      default:
        return status;
    }
  }

  disponibilidadeClasse(status: string): string {
    switch (String(status).toUpperCase()) {
      case 'DISPONIVEL':
        return 'done';
      case 'OCUPADO':
        return 'progress';
      case 'SEM_DADOS':
        return 'pending';
      default:
        return 'created';
    }
  }

  saudeLabel(saude: string): string {
    switch (saude) {
      case 'SAUDAVEL':
        return 'Saudável';
      case 'ATENCAO':
        return 'Atenção';
      case 'CRITICO':
        return 'Crítico';
      default:
        return saude;
    }
  }

  riscoLabel(risco: string): string {
    switch (risco) {
      case 'BAIXO':
        return 'Risco baixo';
      case 'MEDIO':
        return 'Risco médio';
      case 'ALTO':
        return 'Risco alto';
      default:
        return risco;
    }
  }

  sinalClasse(valor: string): string {
    switch (String(valor).toUpperCase()) {
      case 'SAUDAVEL':
      case 'BAIXO':
        return 'done';
      case 'ATENCAO':
      case 'MEDIO':
        return 'pending';
      case 'CRITICO':
      case 'ALTO':
        return 'danger';
      default:
        return 'created';
    }
  }

  nomeUsuario(usuarioId: string): string {
    return this.cargaUsuarios?.usuarios.find((usuario) => usuario.usuarioId === usuarioId)?.nome ?? usuarioId;
  }

  projetosPorSaude(saude: MetricaProjeto['saudeProjeto']): MetricaProjeto[] {
    return this.projetosComTarefas
      .filter((projeto) => projeto.saudeProjeto === saude)
      .sort((a, b) =>
        this.indiceRiscoProjeto(b) - this.indiceRiscoProjeto(a) ||
        b.percentualTarefasAtrasadas - a.percentualTarefasAtrasadas ||
        b.totalTarefas - a.totalTarefas,
      );
  }

  get projetosComTarefas(): MetricaProjeto[] {
    return (this.metricasProjetos?.projetos ?? []).filter(
      (projeto) => projeto.totalTarefas > 0,
    );
  }

  get projetosRiscoGrafico(): MetricaProjeto[] {
    return [...this.projetosComTarefas]
      .sort((a, b) =>
        this.indiceRiscoProjeto(b) - this.indiceRiscoProjeto(a) ||
        b.percentualTarefasAtrasadas - a.percentualTarefasAtrasadas ||
        b.totalTarefas - a.totalTarefas,
      )
      .slice(0, 8);
  }

  totalProjetosComTarefas(): number {
    return this.projetosComTarefas.length;
  }

  maiorRestanteBurndown(projeto: MetricaProjeto): number {
    return Math.max(
      ...(projeto.burndown ?? []).flatMap((item) => [
        item.restantes,
        item.restanteIdeal,
      ]),
      1,
    );
  }

  alturaBurndown(item: MetricaProjeto['burndown'][number], projeto: MetricaProjeto): number {
    return Math.max(6, Math.round((item.restantes / this.maiorRestanteBurndown(projeto)) * 100));
  }

  alturaBurndownIdeal(item: MetricaProjeto['burndown'][number], projeto: MetricaProjeto): number {
    return Math.max(6, Math.round((item.restanteIdeal / this.maiorRestanteBurndown(projeto)) * 100));
  }

  pontosBurndownLinha(
    projeto: MetricaProjeto,
    campo: 'restantes' | 'restanteIdeal',
  ): string {
    const pontos = projeto.burndown ?? [];
    const maximo = this.maiorRestanteBurndown(projeto);

    if (!pontos.length) return '';

    return pontos
      .map((item, indice) => {
        const x = pontos.length === 1 ? 14 : 14 + (indice / (pontos.length - 1)) * 78;
        const y = 82 - ((item[campo] ?? 0) / maximo) * 64;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }

  areaDesvioBurndown(projeto: MetricaProjeto): string {
    const real = this.pontosBurndownLinha(projeto, 'restantes');
    const ideal = this.pontosBurndownLinha(projeto, 'restanteIdeal')
      .split(' ')
      .reverse()
      .join(' ');

    return `${real} ${ideal}`.trim();
  }

  pontosBurndownMarcadores(
    projeto: MetricaProjeto,
    campo: 'restantes' | 'restanteIdeal',
  ) {
    const pontos = projeto.burndown ?? [];
    const maximo = this.maiorRestanteBurndown(projeto);

    return pontos
      .filter((_, indice) => indice === 0 || indice === pontos.length - 1 || indice % 7 === 0)
      .map((item) => {
        const indice = pontos.indexOf(item);
        const x = pontos.length === 1 ? 14 : 14 + (indice / (pontos.length - 1)) * 78;
        const y = 82 - ((item[campo] ?? 0) / maximo) * 64;

        return {
          x,
          y,
          valor: item[campo],
          data: item.data,
        };
      });
  }

  burndownEixoY(projeto: MetricaProjeto) {
    const maximo = this.maiorRestanteBurndown(projeto);
    const meio = Math.round(maximo / 2);

    return [
      { label: maximo, y: 18 },
      { label: meio, y: 50 },
      { label: 0, y: 82 },
    ];
  }

  burndownEixoX(projeto: MetricaProjeto) {
    const pontos = projeto.burndown ?? [];

    if (!pontos.length) return [];

    const meio = Math.floor((pontos.length - 1) / 2);
    const indices = [...new Set([0, meio, pontos.length - 1])];

    return indices.map((indice) => ({
      x: pontos.length === 1 ? 14 : 14 + (indice / (pontos.length - 1)) * 78,
      label: this.formatarDiaMes(pontos[indice].data),
    }));
  }

  private formatarDiaMes(data: string): string {
    const [ano, mes, dia] = data.split('-').map(Number);

    if (!ano || !mes || !dia) return data;

    return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`;
  }

  burndownAtual(projeto: MetricaProjeto): MetricaProjeto['burndown'][number] | null {
    return projeto.burndown?.[projeto.burndown.length - 1] ?? null;
  }

  burndownCriadasPeriodo(projeto: MetricaProjeto): number {
    return (projeto.burndown ?? []).reduce((total, item) => total + item.criadas, 0);
  }

  burndownConcluidasPeriodo(projeto: MetricaProjeto): number {
    return (projeto.burndown ?? []).reduce((total, item) => total + item.concluidas, 0);
  }

  burndownDesvioClasse(desvio: number): string {
    if (desvio > 0) return 'danger';
    if (desvio < 0) return 'done';
    return 'neutral';
  }

  burndownDesvioDescricao(desvio: number): string {
    if (desvio > 0) return `${desvio} acima do ideal`;
    if (desvio < 0) return `${Math.abs(desvio)} abaixo do ideal`;
    return 'no ideal';
  }

  burndownInterpretacao(projeto: MetricaProjeto): string {
    const atual = this.burndownAtual(projeto);

    if (!atual) return 'Sem dados suficientes para avaliar o ritmo.';
    if (atual.restantes < atual.restanteIdeal) return 'Linha real abaixo da ideal: execução adiantada.';
    if (atual.restantes === atual.restanteIdeal) return 'Linha real próxima da ideal: execução no ritmo planejado.';
    if (atual.restantes > atual.restanteIdeal) return 'Linha real acima da ideal: existe risco de atraso.';

    return 'Sem variação relevante no período.';
  }

  posicaoAvancoProjeto(projeto: MetricaProjeto): number {
    return this.escalarParaMapa(projeto.indiceAvanco);
  }

  posicaoAtrasoProjeto(projeto: MetricaProjeto): number {
    const atraso = projeto.percentualTarefasAtrasadas;

    if (atraso <= 0 && this.indiceRiscoProjeto(projeto) > 0) {
      return 18;
    }

    return this.escalarParaMapa(atraso);
  }

  tamanhoBolhaProjeto(projeto: MetricaProjeto): number {
    return Math.max(34, Math.min(58, 30 + projeto.totalTarefas * 3));
  }

  nomeCurtoProjeto(nome: string): string {
    const clean = nome.trim();

    if (clean.length <= 18) {
      return clean;
    }

    return `${clean.slice(0, 16)}...`;
  }

  indiceRiscoProjeto(projeto: MetricaProjeto): number {
    return (
      projeto.tarefasAtrasadas * 3 +
      projeto.tarefasCriticasAbertas * 3 +
      projeto.tarefasVencemEm7Dias * 2 +
      projeto.tarefasParadasMaisDe7Dias * 2 +
      projeto.tarefasSemResponsavel +
      projeto.tarefasSemData
    );
  }

  indiceRiscoNormalizado(projeto: MetricaProjeto): number {
    return Math.min(10, this.indiceRiscoProjeto(projeto));
  }

  riscoIndiceLabel(projeto: MetricaProjeto): string {
    const indice = this.indiceRiscoNormalizado(projeto);

    if (indice >= 7) return 'Alto';
    if (indice >= 3) return 'Médio';
    return 'Baixo';
  }

  riscoIndiceClasse(projeto: MetricaProjeto): string {
    const indice = this.indiceRiscoNormalizado(projeto);

    if (indice >= 7) return 'high';
    if (indice >= 3) return 'medium';
    return 'low';
  }

  larguraRiscoProjeto(valor: number, projeto: MetricaProjeto): number {
    const base = Math.max(
      projeto.tarefasAtrasadas,
      projeto.tarefasCriticasAbertas,
      projeto.tarefasVencemEm7Dias,
      projeto.tarefasParadasMaisDe7Dias,
      projeto.tarefasSemResponsavel,
      projeto.tarefasSemData,
      1,
    );

    return Math.max(valor > 0 ? 6 : 0, Math.round((valor / base) * 100));
  }

  riscoColunasProjeto(projeto: MetricaProjeto) {
    return [
      { label: 'Atrasadas', valor: projeto.tarefasAtrasadas, classe: 'danger' },
      { label: 'Críticas', valor: projeto.tarefasCriticasAbertas, classe: 'danger' },
      { label: 'Vencem 7d', valor: projeto.tarefasVencemEm7Dias, classe: 'pending' },
      { label: 'Paradas', valor: projeto.tarefasParadasMaisDe7Dias, classe: 'progress' },
      { label: 'Sem resp.', valor: projeto.tarefasSemResponsavel, classe: 'muted' },
    ];
  }

  prioridadeColunasProjeto(projeto: MetricaProjeto) {
    return [
      { label: 'Crítica', valor: projeto.prioridade.CRITICA, classe: 'danger' },
      { label: 'Alta', valor: projeto.prioridade.ALTA, classe: 'pending' },
      { label: 'Média', valor: projeto.prioridade.MEDIA, classe: 'progress' },
      { label: 'Baixa', valor: projeto.prioridade.BAIXA, classe: 'muted' },
    ];
  }

  alturaColunaProjeto(valor: number, colunas: { valor: number }[]): number {
    const maior = Math.max(...colunas.map((item) => item.valor), 1);

    return Math.max(valor > 0 ? 8 : 0, Math.round((valor / maior) * 100));
  }

  larguraIndiceRiscoProjeto(projeto: MetricaProjeto): number {
    const maior = Math.max(
      ...this.projetosRiscoGrafico.map((item) => this.indiceRiscoProjeto(item)),
      1,
    );

    const indice = this.indiceRiscoProjeto(projeto);
    return Math.max(indice > 0 ? 6 : 2, Math.round((indice / maior) * 100));
  }

  larguraComponenteRiscoProjeto(valor: number, projeto: MetricaProjeto): number {
    const total = this.indiceRiscoProjeto(projeto);

    if (!valor || total <= 0) {
      return 0;
    }

    return Math.max(3, Math.round((valor / total) * 100));
  }

  private limitarPercentual(valor: number): number {
    return Math.max(0, Math.min(100, valor));
  }

  private escalarParaMapa(valor: number): number {
    return 8 + this.limitarPercentual(valor) * 0.84;
  }

  get projetosCriticos(): MetricaProjeto[] {
    return [...(this.metricasProjetos?.projetos ?? [])]
      .sort((a, b) => {
        const peso = (item: MetricaProjeto) =>
          item.saudeProjeto === 'CRITICO' ? 3 :
            item.saudeProjeto === 'ATENCAO' ? 2 : 1;

        return peso(b) - peso(a) ||
          b.percentualTarefasAtrasadas - a.percentualTarefasAtrasadas ||
          b.tarefasCriticasAbertas - a.tarefasCriticasAbertas;
      })
      .slice(0, 5);
  }

  get metricasTitulosFiltradas() {
    const busca = this.buscaTituloMetrica.trim().toLowerCase();
    const titulos = this.metricasTitulos?.titulos ?? [];
    const filtrados = busca
      ? titulos.filter((item) => item.titulo.toLowerCase().includes(busca))
      : titulos;

    return [...filtrados].sort(
      (a, b) =>
        this.tempoVisualTitulo(b) - this.tempoVisualTitulo(a) ||
        b.totalTarefas - a.totalTarefas ||
        a.titulo.localeCompare(b.titulo),
    );
  }

  private filtrosRelatorioRequest() {
    return {
      projetoId: this.filtrosRelatorio.projetoId || undefined,
      usuarioId: this.filtrosRelatorio.usuarioId || undefined,
      componente: this.filtrosRelatorio.componente || undefined,
      atividadePrincipal: this.filtrosRelatorio.atividadePrincipal || undefined,
      subatividade: this.filtrosRelatorio.subatividade || undefined,
      inicio: this.filtrosRelatorio.inicio || undefined,
      fim: this.filtrosRelatorio.fim || undefined,
    };
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
