import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, NgClass, SlicePipe, UpperCasePipe } from '@angular/common';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';

/* ================= MODELS ================= */

export interface ChecklistItem {
  id: string;
  nome: string;
  concluido: boolean;
}

export interface CardData {
  id?: string;
  titulo: string;
  descricao: string;

  /* UI only */
  badgeTexto: string;
  badgeClasseCor: string;
  urlImagem: string;

  /* Datas */
  dataCriacao: Date;

  responsavel?: string;
  status?: string;
  checklist: ChecklistItem[];

  /* Metadados simples */
  tags?: string[];
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
    SlicePipe,      // ← Adicione aqui
    UpperCasePipe,   // ← Adicione aqui
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
    console.log(this.data);
    this.collapseId = `cardID-${this.data.id}`;
  }

  onChecklistItemClick(item: ChecklistItem): void {
    this.checklistItemselected.emit(item);
  }

  onTituloClick(): void {
    this.tituloClick.emit(this.data);
  }

  getCorAvatar(nome: string | ''): string {
    const cores = [
      '#4361ee',
      '#3a0ca3',
      '#7209b7',
      '#f72585',
      '#4cc9f0',
      '#4895ef',
      '#560bad',
      '#b5179e',
      '#f8961e',
      '#f3722c',
      '#f94144',
      '#90be6d',
      '#43aa8b',
      '#4d908e',
      '#577590',
      '#9c89b8',
    ];

    let hash = 0;
    for (let i = 0; i < nome.length; i++) {
      hash = nome.charCodeAt(i) + ((hash << 5) - hash);
    }

    return cores[Math.abs(hash) % cores.length];
  }
}
