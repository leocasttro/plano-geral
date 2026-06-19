import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ProjetoApi} from '../../domain/projeto/projeto.api';
import { ProjetoDTO } from '../../domain/projeto/projetoModel';

@Component({
  selector: 'app-modal-cadastro-tarefa',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModalModule],
  templateUrl: './modal-cadastro-tarefa.html',
  styleUrls: ['./modal-cadastro-tarefa.scss'],
})
export class ModalCadastroTarefa implements OnInit{
  titulo = '';
  descricao = '';
  projetoId = '';

  projetos: ProjetoDTO[] = [];
  carregandoProjetos = false;
  erroProjetos = '';

  constructor(public activeModal: NgbActiveModal, private projetoApi: ProjetoApi) {}

  ngOnInit() {
    this.carregarProjetos();
  }

  carregarProjetos(): void {
    this.carregandoProjetos = true;

    this.projetoApi.buscarTodos().subscribe({
      next: (projetos) => {
        this.projetos = projetos;
        this.projetoId = this.projetos[0]?.id ?? '';
        this.carregandoProjetos = false;
      }, error: (err) => {
        this.erroProjetos = 'Erro ao carregar projetos';
        this.carregandoProjetos = false;
      },
    });
  }

  salvar() {
    if (!this.titulo.trim()) return;

    this.activeModal.close({
      titulo: this.titulo,
      descricao: this.descricao,
      projetoId: this.projetoId,
    });
  }
}
