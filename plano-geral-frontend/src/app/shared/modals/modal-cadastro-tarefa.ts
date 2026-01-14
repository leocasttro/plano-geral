import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-cadastro-tarefa',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModalModule],
  templateUrl: './modal-cadastro-tarefa.html',
  styleUrls: ['./modal-cadastro-tarefa.scss'],
})
export class ModalCadastroTarefa {
  titulo = '';
  descricao = '';

  constructor(public activeModal: NgbActiveModal) {}

  salvar() {
    if (!this.titulo.trim()) return;

    this.activeModal.close({
      titulo: this.titulo,
      descricao: this.descricao,
    });
  }
}
