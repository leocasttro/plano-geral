import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap'; // ✨ 1. Importe o módulo aqui
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowDown, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';

export interface CardData {
  id?: number;
  titulo: string;
  descricao: string;
  badgeTexto: string;
  badgeClasseCor: string;
  urlImagem: string;
  dataCriacao: string;
  status?: string; // ✅ necessário
  checklist: ChecklistItem[];
}

export interface ChecklistItem {
  nome: string;
  status: 'Pendente' | 'Concluído';
}

@Component({
  selector: 'app-card-component',
  standalone: true,
  imports: [NgClass, NgbCollapseModule, FontAwesomeModule, FormsModule],
  templateUrl: './card-component.html',
  styleUrls: ['./card-component.scss'],
})
export class CardComponent {
  @Input() data!: CardData;
  @Output() checklistItemselected = new EventEmitter<ChecklistItem>();

  faMinus = faMinus;

  public isCollapsed = true;

  ngOnInit(): void {
    console.log('📦 Dados recebidos no CardComponent:', this.data);
    if (this.data?.checklist) {
      console.log('🧾 Checklist:', this.data.checklist);
    } else {
      console.warn('⚠️ Nenhum checklist encontrado neste card.');
    }
  }

  onChecklistItemClick(item: ChecklistItem) {
    this.checklistItemselected.emit(item);
  }

  public gerarIdUnico(titulo: string): string {
    return 'cardID-' + titulo.replace(/\s+/g, '');
  }

}
