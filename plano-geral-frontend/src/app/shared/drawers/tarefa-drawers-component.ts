import { TarefaApi } from './../../domain/tarefa/tarefa.api';
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { NgbCollapseModule, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';

import { CardDataDrawer, tarefaDtoToDrawer } from './tarefa-drawer.mapper';

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
  novoComentario = '';

  constructor(private offcanvas: NgbOffcanvas, private tarefaApi: TarefaApi) {}

  ngOnInit(): void {
    this.tarefa.atividades = this.tarefa.atividades ?? [];
    this.tarefa.checklist = this.tarefa.checklist ?? [];

    this.participantes = [
      ...new Set(this.tarefa.atividades.map((a) => a.usuario)),
    ];
  }

  trackAtividade(_: number, item: any) {
    return item.id ?? item.data;
  }

  adicionarComentario(): void {
    console.log('cliquei');

    if (!this.novoComentario.trim()) return;

    this.tarefaApi
      .adicionarComentario(
        this.tarefa.id!,
        this.novoComentario,
        'usuario-logado'
      )
      .subscribe({
        next: (dto) => {
          const atualizada = tarefaDtoToDrawer(dto);
          this.tarefa = {
            ...atualizada,
            atividades: [...atualizada.atividades],
          };
          this.participantes = [
            ...new Set(this.tarefa.atividades.map((a) => a.usuario)),
          ];

          this.novoComentario = '';
        },
      });
  }

  fechar(): void {
    this.offcanvas.dismiss();
  }
}
