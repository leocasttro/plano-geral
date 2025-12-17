import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { TarefaService } from '../services/tarefa.service';

@Component({
  selector: 'app-modal-cadastro-tarefa',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModalModule],
  templateUrl: './modal-cadastro-tarefa.html',
  styleUrls: ['./modal-cadastro-tarefa.scss']
})
export class ModalCadastroTarefa {
  tarefa = {
    titulo: '',
    descricao: '',
    status: '',
    responsavel: '',
    urlImagem: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png',
    prioridade: 'normal',
    badgeClasseCor: 'bg-info',
    badgeTexto: 'Normal',
    checklist: [] as { nome: string; concluido: boolean }[],
  };

  constructor(public activeModal: NgbActiveModal, private tarefaService: TarefaService) {}


  adicionarItemChecklist() {
    this.tarefa.checklist.push({ nome: '', concluido: false });
  }

  removerItemChecklist(index: number) {
    this.tarefa.checklist.splice(index, 1);
  }

  atualizarPrioridade() {
    switch (this.tarefa.prioridade) {
      case 'alta':
        this.tarefa.badgeClasseCor = 'bg-danger';
        this.tarefa.badgeTexto = 'Alta';
        break;
      case 'atencao':
        this.tarefa.badgeClasseCor = 'bg-warning text-dark';
        this.tarefa.badgeTexto = 'Atenção';
        break;
      case 'normal':
        this.tarefa.badgeClasseCor = 'bg-info';
        this.tarefa.badgeTexto = 'Normal';
        break;
      case 'concluido':
        this.tarefa.badgeClasseCor = 'bg-success';
        this.tarefa.badgeTexto = 'Concluído';
        break;
    }
  }

  salvar() {
    this.tarefaService.criarTarefa(this.tarefa).subscribe({
      next: (novaTarefa) => {
        this.activeModal.close(novaTarefa);
      },
      error: (err) => console.error('Erro ao criar tarefa:', err)
    });
  }
}
