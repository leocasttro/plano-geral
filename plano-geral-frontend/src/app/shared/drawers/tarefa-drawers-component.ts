import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { NgbCollapseModule, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { CardData } from '../components/card-component/card-component';

export interface AtividadeDrawer {
  tipo: 'acao' | 'comentario';

  usuario: string;
  data: string;

  acao?: string;
  comentario?: string;
}

type CardDataDrawer = CardData & {
  atividades?: AtividadeDrawer[];
};

@Component({
  selector: 'app-tarefa-drawers-component',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    NgbCollapseModule,
    FontAwesomeModule,
    FormsModule,
  ],
  templateUrl: './tarefa-drawers-component.html',
  styleUrls: ['./tarefa-drawers-component.scss'],
})
export class TarefaDrawersComponent implements OnInit {
  @Input() tarefa!: CardDataDrawer;

  faMinus = faMinus;
  isChecklistCollapsed = false;
  participantes: string[] = [];

  constructor(private offcanvas: NgbOffcanvas) {}

  ngOnInit(): void {
    /** MOCK TEMPORÁRIO – ATIVIDADES */
    if (!this.tarefa.atividades || !this.tarefa.atividades.length) {
      this.tarefa.atividades = [
        {
          tipo: 'acao',
          usuario: 'João H',
          acao: 'added To Do label',
          data: '2026-01-01T10:00:00',
        },
        {
          tipo: 'acao',
          usuario: 'João H',
          acao: 'assigned @Camila',
          data: '2026-01-02T14:20:00',
        },
        {
          tipo: 'comentario',
          usuario: 'João H',
          comentario: 'Esse layout ficou muito bom!',
          data: '2026-01-02T15:05:00',
        },
      ];
    }

    /** MOCK TEMPORÁRIO – CHECKLIST */
    if (!this.tarefa.checklist || !this.tarefa.checklist.length) {
      this.tarefa.checklist = [
        {
          nome: 'Criar proposta de layout',
          status: 'Concluído',
        },
        {
          nome: 'Validar layout com o time',
          status: 'Pendente',
        },
        {
          nome: 'Ajustar feedbacks finais',
          status: 'Pendente',
        },
      ];
    }

    /** PARTICIPANTES (a partir das atividades) */
    this.participantes = [
      ...new Set(this.tarefa.atividades.map((a) => a.usuario)),
    ];
  }

  getAvatarColor(nome: string): string {
    const cores = ['#2563eb', '#059669', '#7c3aed', '#db2777'];
    return cores[nome.charCodeAt(0) % cores.length];
  }

  fechar(): void {
    this.offcanvas.dismiss();
  }
}
