import {
  faBell,
  faMagnifyingGlass,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  effect,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { forkJoin, interval, of, Subscription } from 'rxjs';
import { catchError, filter, map, startWith, switchMap } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { KanbanSearchService } from '../services/kanban-search.service';
import { NotificacaoApi } from '../../domain/notificacao/notificacao.api';
import { NotificacaoDTO } from '../../domain/notificacao/notificacao.model';
import { TarefaDrawerNavigationService } from '../services/tarefa-drawer-navigation.service';
import { AuthService } from '../../domain/auth/auth.service';

@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar {
  @Input() mostrarBotaoNovaTarefa: boolean = true;
  @Output() novaTarefa = new EventEmitter<void>();
  @Output() novoProjeto = new EventEmitter<void>();

  isProjetosRoute = false;
  isKanbanRoute = false;

  faSearch = faMagnifyingGlass;
  faNotification = faBell;
  faPlus = faPlus;

  titulo: string = 'Atividades';
  subtitulo: string = 'Gerencie suas atividades';

  notificacoes: NotificacaoDTO[] = [];
  totalNaoLidas = 0;
  mostrarNotificacoes = false;

  private notificacoesSubscription?: Subscription;

  private routerSubscription!: Subscription;

  private routeConfig: {
    [key: string]: { titulo: string; subtitulo: string };
  } = {
    '/planoGeral': {
      titulo: 'Atividades',
      subtitulo: 'Gerencie suas atividades',
    },
    '/projetos': {
      titulo: 'Projetos',
      subtitulo: 'Gerencie os projetos e seus ocupantes',
    },
    '/calendario': {
      titulo: 'Calendário',
      subtitulo: 'Visualize início, fim e duração das tarefas',
    },
    '/relatorios': {
      titulo: 'Relatórios',
      subtitulo: 'Acompanhe indicadores dos projetos, tarefas e usuários',
    },
    '/meu-relatorio': {
      titulo: 'Meu relatório',
      subtitulo: 'Acompanhe suas tarefas e seu desempenho',
    },
    '/configuracoes': {
      titulo: 'Configurações',
      subtitulo: 'Gerencie usuários, perfis e permissões',
    },
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private kanbanSearch: KanbanSearchService,
    private notificacaoApi: NotificacaoApi,
    private tarefaDrawerNavigation: TarefaDrawerNavigationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    effect(() => {
      const usuario = this.authService.usuario();

      if (usuario) {
        this.sincronizarContadorNotificacoes();
        this.iniciarPollingNotificacoes();
        return;
      }

      this.pararPollingNotificacoes();
      this.notificacoes = [];
      this.totalNaoLidas = 0;
      this.cdr.markForCheck();
    });
  }

  ngOnInit() {
    this.routerSubscription = this.router.events.pipe(filter(
      event => event instanceof NavigationEnd
    )).subscribe(() => {
      this.atualizarTitulo()
    });

    this.atualizarTitulo();

    if (this.authService.usuario()) {
      this.sincronizarContadorNotificacoes();
      this.iniciarPollingNotificacoes();
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe()
    }

    this.pararPollingNotificacoes();
  }
  onNovaTarefaClick() {
    this.novaTarefa.emit();
  }

  private atualizarTitulo() {
    const url = this.router.url;

    const urlBase = '/' + url.split('/')[1];

    this.isProjetosRoute = urlBase === '/projetos';
    this.isKanbanRoute = urlBase === '/planoGeral';

    if (this.routeConfig[urlBase]) {
      this.titulo = this.routeConfig[urlBase].titulo;
      this.subtitulo = this.routeConfig[urlBase].subtitulo;
    } else {
      this.extrairTituloDaRota();
    }
  }

  onNovoProjetoClick() {
    this.novoProjeto.emit();
  }

  onSearchClick() {
    if (this.isKanbanRoute) {
      this.kanbanSearch.abrirPesquisa();
    }
  }

  toggleNotificacoes(): void {
    this.mostrarNotificacoes = !this.mostrarNotificacoes;

    if (this.mostrarNotificacoes) {
      this.carregarNotificacoes();
    }
  }

  abrirNotificacao(notificacao: NotificacaoDTO): void {
    this.mostrarNotificacoes = false;

    if (!notificacao.lida) {
      this.marcarComoLida(notificacao);
    }

    const tarefaId = this.extrairTarefaIdDaNotificacao(notificacao);

    if (!tarefaId) {
      return;
    }

    const solicitacaoId = this.extrairSolicitacaoIdDaNotificacao(notificacao);

    this.router.navigate(['/planoGeral']).then(() => {
      setTimeout(() =>
        this.tarefaDrawerNavigation.abrirTarefa(tarefaId, solicitacaoId),
      );
    });
  }

  marcarComoLida(notificacao: NotificacaoDTO): void {
    this.notificacaoApi.marcarComoLida(notificacao.id).subscribe({
      next: (atualizada) => {
        this.notificacoes = this.notificacoes.map((item) =>
          item.id === atualizada.id ? atualizada : item,
        );

        this.atualizarTotalNaoLidas();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao marcar notificação como lida:', err);
      },
    });
  }

  limparNotificacoes(): void {
    const naoLidas = this.notificacoes.filter((item) => !item.lida);

    if (!naoLidas.length) {
      return;
    }

    forkJoin(
      naoLidas.map((notificacao) =>
        this.notificacaoApi.marcarComoLida(notificacao.id).pipe(
          catchError((err) => {
            console.error('Erro ao limpar notificação:', err);
            return of(null);
          }),
        ),
      ),
    ).subscribe((atualizadas) => {
      const atualizadasMap = new Map(
        atualizadas
          .filter((item): item is NotificacaoDTO => !!item)
          .map((item) => [item.id, item]),
      );

      this.notificacoes = this.notificacoes.map((item) =>
        atualizadasMap.get(item.id) ?? item,
      );

      this.atualizarTotalNaoLidas();
      this.cdr.detectChanges();
    });
  }

  formatarDataNotificacao(data: string): string {
    const date = new Date(data);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleString('pt-BR');
  }

  private iniciarPollingNotificacoes(): void {
    if (this.notificacoesSubscription) {
      return;
    }

    this.notificacoesSubscription = interval(15000)
      .pipe(
        startWith(0),
        switchMap(() => this.buscarTotalNaoLidas()),
      )
      .subscribe((total) => {
        this.totalNaoLidas = total;
        this.cdr.detectChanges();
      });
  }

  private pararPollingNotificacoes(): void {
    this.notificacoesSubscription?.unsubscribe();
    this.notificacoesSubscription = undefined;
  }

  private carregarNotificacoes(): void {
    this.buscarNotificacoes().subscribe((notificacoes) => {
      this.notificacoes = notificacoes;
      this.atualizarTotalNaoLidas();
      this.cdr.detectChanges();
    });
  }

  private buscarNotificacoes() {
    return this.notificacaoApi.listar().pipe(
      catchError((err) => {
        console.error('Erro ao carregar notificações:', err);
        return of([]);
      }),
    );
  }

  private sincronizarContadorNotificacoes(): void {
    this.buscarTotalNaoLidas().subscribe((total) => {
      this.totalNaoLidas = total;
      this.cdr.detectChanges();
    });
  }

  private buscarTotalNaoLidas() {
    return this.notificacaoApi.totalNaoLidas().pipe(
      map((resultado) => resultado.total),
      catchError((err) => {
        console.error('Erro ao carregar total de notificações:', err);
        return of(0);
      }),
    );
  }

  private atualizarTotalNaoLidas(): void {
    this.totalNaoLidas = this.notificacoes.filter((item) => !item.lida).length;
  }

  private extrairTarefaIdDaNotificacao(notificacao: NotificacaoDTO): string | null {
    if (!notificacao.link) {
      return null;
    }

    const match = notificacao.link.match(/\/tarefas\/([^/?#]+)/);

    return match?.[1] ?? null;
  }

  private extrairSolicitacaoIdDaNotificacao(notificacao: NotificacaoDTO): string | null {
    if (!notificacao.link) {
      return null;
    }

    const match = notificacao.link.match(/\/solicitacoes-datas\/([^/?#]+)/);

    return match?.[1] ?? null;
  }

  private extrairTituloDaRota() {
    let route = this.activatedRoute.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const routeData = route.snapshot.data;
    if (routeData['titulo']) {
      this.titulo = routeData['titulo'];
      this.subtitulo = routeData['subtitulo'] || '';
    } else {
      const urlSegment  = this.router.url.split('/');
      const lastSegment =  urlSegment[urlSegment.length - 1];
      this.titulo = lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) : 'Atividades';
      this.subtitulo = '';
    }
  }
}
