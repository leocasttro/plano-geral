import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  DatePipe,
  NgClass,
  SlicePipe,
  UpperCasePipe,
  CommonModule,
} from '@angular/common';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMinus, faExclamation } from '@fortawesome/free-solid-svg-icons';
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

  responsavelId?: string | null;
  responsavel?: {
    id: string;
    nome: string;
    email: string;
  } | null;
  status?: string;
  tituloCatalogoId?: string | null;
  criadorId?: string | null;

  projetoId?: string | null;
  projeto?: {
    id: string;
    nome: string;
    centroCusto?: string | null;
  } | null;
  checklist: ChecklistItem[];

  isMacroTarefa?: boolean;
  tarefaPaiId?: string | null;
  subTarefas?: CardData[];

  componenteCatalogo?: string | null;
  /* Metadados simples */
  tags?: string[];
  dataInicio?: string;
  dataFim?: string;
}

import { IniciaisPipe } from '../../pipes/iniciais.pipe';

/* ================= COMPONENT ================= */

@Component({
  selector: 'app-card-component',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    NgbCollapseModule,
    FontAwesomeModule,
    FormsModule,
    DatePipe,
    IniciaisPipe,
  ],
  templateUrl: './card-component.html',
  styleUrls: ['./card-component.scss'],
})
export class CardComponent {
  @Input() data!: CardData;

  @Output() checklistItemselected = new EventEmitter<ChecklistItem>();
  @Output() tituloClick = new EventEmitter<CardData>();

  @Input() isExpandida = false; // <-- NOVO
  @Output() expandirClick = new EventEmitter<string>();

  faMinus = faMinus;
  faExclamation = faExclamation;
  isCollapsed = true;
  collapseId!: string;

  ngOnInit(): void {
    this.collapseId = `cardID-${this.data.id}`;
  }

  get isAtrasada(): boolean {
    if (!this.data || !this.data.dataFim) return false;
    
    if (String(this.data.status ?? '').toUpperCase() === 'CONCLUIDA') return false;

    // dataFim vem no formato YYYY-MM-DD
    const match = this.data.dataFim.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return false;

    const [_, ano, mes, dia] = match;
    const dataFim = new Date(Number(ano), Number(mes) - 1, Number(dia), 23, 59, 59, 999);
    
    return dataFim.getTime() < new Date().getTime();
  }

  onChecklistItemClick(item: ChecklistItem): void {
    this.checklistItemselected.emit(item);
  }

  onTituloClick(): void {
    this.tituloClick.emit(this.data);
  }

  onExpandirClick(event: Event) {
    event.stopPropagation();
    this.expandirClick.emit(this.data.id);
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
