import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

export interface CardData {
  titulo: string;
  descricao: string;
  badgeTexto: string;
  badgeClasseCor: string;
  urlImagem: string;
  dataCriacao: string;
}

@Component({
  selector: 'app-card-component',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './card-component.html',
  styleUrl: './card-component.scss'
})
export class CardComponent {
  @Input() data!: CardData;
}

