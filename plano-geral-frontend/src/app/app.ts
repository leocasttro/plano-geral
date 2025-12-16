import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavBar } from './shared/nav-bar/nav-bar';
import { SideBar } from './shared/side-bar/side-bar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs';
import { ModalCadastroTarefa } from './shared/modals/modal-cadastro-tarefa';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, SideBar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'crm';
  mostrarBotaoNovaTarefa = true;

  constructor(private router: Router, private modalService: NgbModal) {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.atualizarBotaoPorRota(event.urlAfterRedirects);
      });
  }

  private atualizarBotaoPorRota(url: string) {
    this.mostrarBotaoNovaTarefa = true;
  }

  onNovaTarefa() {
    console.log('Abrindo modal de nova tarefa...');
    const modalRef = this.modalService.open(ModalCadastroTarefa, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (tarefa) => {
        if (tarefa) {
          console.log('Tarefa criada:', tarefa);
        }
      },
      () => console.log('Modal fechado sem salvar')
    );
  }
}
