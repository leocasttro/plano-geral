import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';

/* ================= MODELS ================= */

export interface Atividade {
  usuario: string;
  data: string; // ou Date
}

export interface ChecklistItem {
  nome: string;
  status: 'Pendente' | 'Concluído';
}

export interface CardData {
  id?: string;
  titulo: string;
  descricao: string;
  badgeTexto: string;
  badgeClasseCor: string;
  urlImagem: string;
  dataCriacao: Date;
  status?: string;

  checklist: ChecklistItem[];

  atividades?: Atividade[];
  tags?: string[];
  responsavel?: string;
  dataInicio?: string;
  dataFim?: string;
}

/* ================= COMPONENT ================= */

@Component({
  selector: 'app-card-component',
  standalone: true,
  imports: [
    NgClass,
    NgbCollapseModule,
    FontAwesomeModule,
    FormsModule,
    DatePipe,
  ],
  templateUrl: './card-component.html',
  styleUrls: ['./card-component.scss'],
})
export class CardComponent {
  @Input() data!: CardData;

  @Output() checklistItemselected = new EventEmitter<ChecklistItem>();
  @Output() tituloClick = new EventEmitter<CardData>();

  faMinus = faMinus;
  isCollapsed = true;
  collapseId!: string;

  ngOnInit(): void {
    this.collapseId = 'cardID-' + this.data.id;
  }

  onChecklistItemClick(item: ChecklistItem): void {
    this.checklistItemselected.emit(item);
  }

  gerarIdUnico(titulo: string): string {
    return 'cardID-' + titulo.replace(/\s+/g, '');
  }

  onTituloClick(): void {
    this.tituloClick.emit(this.data);
  }
}
