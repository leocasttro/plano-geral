import {
  faBell,
  faMagnifyingGlass,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { interval, of, Subscription } from 'rxjs';
import { catchError, filter, startWith, switchMap } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { KanbanSearchService } from '../services/kanban-search.service';
import { NotificacaoApi } from '../../domain/notificacao/notificacao.api';
import { NotificacaoDTO } from '../../domain/notificacao/notificacao.model';

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
  ) {}

  ngOnInit() {
    this.routerSubscription = this.router.events.pipe(filter(
      event => event instanceof NavigationEnd
    )).subscribe(() => {
      this.atualizarTitulo()
    });

    this.atualizarTitulo();
    this.iniciarPollingNotificacoes();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe()
    }

    this.notificacoesSubscription?.unsubscribe();
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
  }

  marcarComoLida(notificacao: NotificacaoDTO): void {
    if (notificacao.lida) {
      return;
    }

    this.notificacaoApi.marcarComoLida(notificacao.id).subscribe({
      next: (atualizada) => {
        this.notificacoes = this.notificacoes.map((item) =>
          item.id === atualizada.id ? atualizada : item,
        );

        this.atualizarTotalNaoLidas();
      },
      error: (err) => {
        console.error('Erro ao marcar notificação como lida:', err);
      },
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
    this.notificacoesSubscription = interval(60000)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.notificacaoApi.listar().pipe(
            catchError((err) => {
              console.error('Erro ao carregar notificações:', err);
              return of([]);
            }),
          ),
        ),
      )
      .subscribe((notificacoes) => {
        this.notificacoes = notificacoes;
        this.atualizarTotalNaoLidas();
      });
  }

  private atualizarTotalNaoLidas(): void {
    this.totalNaoLidas = this.notificacoes.filter((item) => !item.lida).length;
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
