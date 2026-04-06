import {
  faBell,
  faMagnifyingGlass,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar {
  @Input() mostrarBotaoNovaTarefa: boolean = true;
  @Output() novaTarefa = new EventEmitter<void>();

  faSearch = faMagnifyingGlass;
  faNotification = faBell;
  faPlus = faPlus;

  titulo: string = 'Atividades';
  subtitulo: string = 'Gerencie suas atividades';

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
  };

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.routerSubscription = this.router.events.pipe(filter(
      event => event instanceof NavigationEnd
    )).subscribe(() => {
      this.atualizarTitulo()
    })
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe()
    }
  }
  onNovaTarefaClick() {
    this.novaTarefa.emit();
  }

  private atualizarTitulo() {
    const url = this.router.url;

    const urlBase = '/' + url.split('/')[1];

    if (this.routeConfig[urlBase]) {
      this.titulo = this.routeConfig[urlBase].titulo;
      this.subtitulo = this.routeConfig[urlBase].subtitulo;
    } else {
      this.extrairTituloDaRota();
    }
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
