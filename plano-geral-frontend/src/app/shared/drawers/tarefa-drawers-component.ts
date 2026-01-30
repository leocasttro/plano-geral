import { TarefaApi } from './../../domain/tarefa/tarefa.api';
import { AtividadeDTO } from '../../domain/tarefa/tarefa.model';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { NgbCollapseModule, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';

import {
  AtividadeDrawer,
  CardDataDrawer,
  tarefaDtoToDrawer,
} from './tarefa-drawer.mapper';

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

  novoChecklistItem = '';
  mostrarFormChecklist = false;

  constructor(
    private offcanvas: NgbOffcanvas,
    private tarefaApi: TarefaApi,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.tarefa.atividades = this.tarefa.atividades ?? [];
    this.tarefa.checklist = this.tarefa.checklist ?? [];
    this.listarAtividades();

    this.participantes = [
      ...new Set(this.tarefa.atividades.map((a) => a.usuario)),
    ];
  }

  trackAtividade(index: number, item: AtividadeDrawer) {
    return item?.id ?? index;
  }

  adicionarComentario(): void {
    if (!this.novoComentario.trim()) return;

    this.tarefaApi
      .adicionarComentario(
        this.tarefa.id!,
        this.novoComentario,
        'Leonardo Castro',
      )
      .subscribe({
        next: (dto) => {
          const atualizada = tarefaDtoToDrawer(dto);

          this.tarefa = {
            ...atualizada,
            atividades: [...atualizada.atividades],
            checklist: [...(atualizada.checklist ?? [])],
          };

          this.participantes = [
            ...new Set(this.tarefa.atividades.map((a) => a.usuario)),
          ];

          this.novoComentario = '';

          this.cdr.detectChanges();
        },
      });
  }

  listarAtividades() {
    this.tarefaApi.buscarAtividades(this.tarefa.id!).subscribe({
      next: (atividades: AtividadeDTO[]) => {
        this.tarefa.atividades = (atividades ?? []).map(
          (a): AtividadeDrawer => {
            const tipo = String(a.tipo).toUpperCase();

            return {
              id: a.id,
              tipo: tipo === 'COMENTARIO' ? 'comentario' : 'acao',
              usuario: a.usuario,
              data: new Date(a.data),
              comentario: tipo === 'COMENTARIO' ? a.descricao : undefined,
              acao: tipo !== 'COMENTARIO' ? a.descricao : undefined,
            };
          },
        );

        this.participantes = [
          ...new Set(this.tarefa.atividades.map((x) => x.usuario)),
        ];

        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  fechar(): void {
    this.offcanvas.dismiss();
  }

  abrirFormChecklist() {
    this.isChecklistCollapsed = false;
    this.mostrarFormChecklist = true;
  }

  fecharFormChecklist() {
    this.mostrarFormChecklist = false;
    this.novoChecklistItem = '';
  }

  salvarChecklistItem() {
    const nome = this.novoChecklistItem.trim();
    if (!nome) return;

    this.tarefaApi.adicionarChecklistItem(this.tarefa.id!, nome).subscribe({
      next: (dto) => {
        const atualizada = tarefaDtoToDrawer(dto);

        this.tarefa = {
          ...this.tarefa,
          ...atualizada,
          checklist: [...(atualizada.checklist ?? [])],
          atividades: [...(atualizada.atividades ?? [])],
        };

        this.participantes = [
          ...new Set((this.tarefa.atividades ?? []).map((a) => a.usuario)),
        ];

        this.fecharFormChecklist();
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  toggleChecklistItem(itemId: string) {
    this.tarefaApi.toggleChecklistItem(this.tarefa.id!, itemId).subscribe({
      next: (dto) => {
        const atualizada = tarefaDtoToDrawer(dto);

        this.tarefa = {
          ...this.tarefa,
          checklist: [...(atualizada.checklist ?? [])],
          atividades: [...(atualizada.atividades ?? [])],
        };

        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  trackChecklist(_: number, item: { id: string }) {
    return item.id;
  }
}
