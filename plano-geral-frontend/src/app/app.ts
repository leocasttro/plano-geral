import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavBar } from './shared/nav-bar/nav-bar';
import { SideBar } from './shared/side-bar/side-bar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs';
import { ModalCadastroTarefa } from './shared/modals/modal-cadastro-tarefa';
import {ProjetoEventsService} from './domain/projeto/projeto-events.service';
import { ToastContainer } from './shared/toast/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, SideBar, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'crm';
  mostrarBotaoNovaTarefa = true;
  isLoginRoute = false;

  constructor(private router: Router, private modalService: NgbModal,   private projetoEvents: ProjetoEventsService) {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isLoginRoute = this.isPublicAuthRoute(event.urlAfterRedirects);
        this.atualizarBotaoPorRota(event.urlAfterRedirects);
      });
  }

  private isPublicAuthRoute(url: string): boolean {
    return url.startsWith('/login') || url.startsWith('/trocar-senha');
  }

  private atualizarBotaoPorRota(url: string) {
    this.mostrarBotaoNovaTarefa = true;
  }

  onNovaTarefa() {
    const modalRef = this.modalService.open(ModalCadastroTarefa, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (tarefa) => {
        if (tarefa) {
          return;
        }
      },
      () => undefined
    );
  }

  onNovoProjeto() {
    this.projetoEvents.abrirNovoProjeto();
  }
}
