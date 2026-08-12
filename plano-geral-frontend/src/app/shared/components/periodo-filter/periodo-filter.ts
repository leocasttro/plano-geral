import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-periodo-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './periodo-filter.html',
  styleUrl: './periodo-filter.scss',
})
export class PeriodoFilterComponent {
  @Input() label = 'Período';
  @Input() inicio = '';
  @Input() fim = '';
  @Input() disabled = false;

  @Output() inicioChange = new EventEmitter<string>();
  @Output() fimChange = new EventEmitter<string>();
  @Output() periodoChange = new EventEmitter<{ inicio: string; fim: string }>();

  alterarInicio(valor: string): void {
    this.inicio = valor;
    this.inicioChange.emit(valor);
    this.emitirPeriodo();
  }

  alterarFim(valor: string): void {
    this.fim = valor;
    this.fimChange.emit(valor);
    this.emitirPeriodo();
  }

  private emitirPeriodo(): void {
    this.periodoChange.emit({
      inicio: this.inicio,
      fim: this.fim,
    });
  }
}
