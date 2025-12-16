import {
  faBell,
  faMagnifyingGlass,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar {
  @Input() mostrarBotaoNovaTarefa: boolean = true;
  @Output() novaTarefa = new EventEmitter<void>();

  faSearch = faMagnifyingGlass;
  faNotification = faBell;
  faPlus = faPlus;

  onNovaTarefaClick() {
    this.novaTarefa.emit();
  }
}
