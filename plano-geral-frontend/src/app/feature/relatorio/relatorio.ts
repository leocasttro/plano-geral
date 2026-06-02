import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap, take } from 'rxjs/operators';
import { RelatorioApi } from '../../domain/relatorio/relatorio.api';
import {
  RelatorioCargaUsuariosDTO,
  RelatorioDashboardDTO,
  TarefaUsuarioDetalhe,
} from '../../domain/relatorio/relatorio.model';
import { TarefaApi } from '../../domain/tarefa/tarefa.api';

type UsuarioCarga = RelatorioCargaUsuariosDTO['usuarios'][number];

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relatorio.html',
  styleUrl: './relatorio.scss',
})
export class Relatorio implements OnInit {
  dashboard: RelatorioDashboardDTO | null = null;
  cargaUsuarios: RelatorioCargaUsuariosDTO | null = null;

  usuarioSelecionado: UsuarioCarga | null = null;
  tarefasUsuario: TarefaUsuarioDetalhe[] = [];

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

  carregarTela(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      dashboard: this.relatorioApi.dashboard(),
      cargaUsuarios: this.relatorioApi.cargaUsuarios(),
    })
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: ({ dashboard, cargaUsuarios }) => {
          this.dashboard = dashboard;
          this.cargaUsuarios = cargaUsuarios;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Erro ao carregar relatórios.';
        },
      });
  }

  abrirModalDashboard(tipo: string): void {
    this.usuarioSelecionado = null;
    this.tarefasUsuario = [];
    this.loadingModal = false;
    this.modalTitulo = tipo;
    this.modalAberto = true;
    this.cdr.detectChanges();
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.usuarioSelecionado = null;
    this.tarefasUsuario = [];
    this.loadingModal = false;
    this.cdr.detectChanges();
  }

  abrirUsuario(usuario: UsuarioCarga): void {
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
                    .filter((tempo) => tempo.responsavel === usuario.usuarioId)
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

  formatarHorasBrasil(horas: number): string {
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
}
