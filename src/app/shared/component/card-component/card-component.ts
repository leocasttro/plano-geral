import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap'; // ✨ 1. Importe o módulo aqui
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowDown, faMinus } from '@fortawesome/free-solid-svg-icons';

export interface CardData {
  titulo: string;
  descricao: string;
  badgeTexto: string;
  badgeClasseCor: string;
  urlImagem: string;
  dataCriacao: string;
  checklist: ChecklistItem[];
}

export interface ChecklistItem {
  id: number;
  titulo: string;
  status: 'Pendente' | 'Concluído';
  arquivo?: File;
}

@Component({
  selector: 'app-card-component',
  standalone: true,
  imports: [NgClass, NgbCollapseModule, FontAwesomeModule],
  templateUrl: './card-component.html',
  styleUrls: ['./card-component.scss'],
})
export class CardComponent {
  @Input() data!: CardData;
  @Output() checklistItemSelected = new EventEmitter<ChecklistItem>();
  public isCollapsed = true;
  faMinus = faMinus;

  /**
   * Função chamada quando um item do dropdown é clicado.
   * Em vez de conter a lógica, ela apenas emite o item para o pai.
   * @param item O item do checklist que foi clicado.
   */
  onItemClick(item: ChecklistItem): void {
    if (item.status === 'Pendente') {
      // Correto, com o "S" maiúsculo
      this.checklistItemSelected.emit(item);
    }
  }

  public gerarIdUnico(titulo: string): string {
    // Concatena 'ID' com o título após remover todos os espaços em branco
    return 'cardID-' + titulo.replace(/\s+/g, '');
  }
}
