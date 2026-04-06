import { TarefaApi } from './../../domain/tarefa/tarefa.api';
import { AtividadeDTO, Usuario } from '../../domain/tarefa/tarefa.model';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import {
  NgbCollapseModule,
  NgbOffcanvas,
  NgbTypeaheadModule,
} from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { EventEmitter, Output } from '@angular/core';

import {
  AtividadeDrawer,
  CardDataDrawer,
  tarefaDtoToDrawer,
} from './tarefa-drawer.mapper';
import { UsuarioApi } from '../../domain/usuario/usuario.api';
import { UsuarioDTO } from '../../domain/usuario/usuario.model';

@Component({
  selector: 'app-tarefa-drawers-component',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    NgbCollapseModule,
    FontAwesomeModule,
    FormsModule,
    NgbTypeaheadModule,
  ],
  templateUrl: './tarefa-drawers-component.html',
  styleUrls: ['./tarefa-drawers-component.scss'],
})
export class TarefaDrawersComponent implements OnInit {
  @Input() tarefa!: CardDataDrawer;
  @Output() tarefaAtualizada = new EventEmitter<CardDataDrawer>();

  faMinus = faMinus;
  isChecklistCollapsed = false;
  participantes: string[] = [];
  novoComentario = '';

  novoChecklistItem = '';
  mostrarFormChecklist = false;

  mostrarPrioridades = false;
  prioridades = ['BAIXA', 'NORMAL', 'ALTA', 'CRITICA'];

  mostrarSelecaoResponsavel = false;
  responsavelSelecionado: Usuario | null = null;
  listaUsuarios: Usuario[] = [];
  filtroUsuario = '';
  usuariosFiltrados: Usuario[] = [];

  constructor(
    private offcanvas: NgbOffcanvas,
    private tarefaApi: TarefaApi,
    private usuarioApi: UsuarioApi,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.tarefa.atividades = this.tarefa.atividades ?? [];
    this.tarefa.checklist = this.tarefa.checklist ?? [];
    this.listarAtividades();
    this.listarUsuarios();

    this.participantes = [
      ...new Set(this.tarefa.atividades.map((a) => a.usuario)),
    ];

    this.cdr.detectChanges();
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
            atividades: this.ordernarAtividade([
              ...(atualizada.atividades ?? []),
            ]),
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
        const atividadesDrawer = (atividades ?? []).map(
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

        this.tarefa.atividades = this.ordernarAtividade(atividadesDrawer);

        this.participantes = [
          ...new Set(this.tarefa.atividades.map((x) => x.usuario)),
        ];

        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  listarUsuarios() {
    this.usuarioApi.buscarTodos().subscribe({
      next: (usuarios: UsuarioDTO[]) => {
        console.log('Usuários carregados:', usuarios);
        // Converter DTO para Usuario
        this.listaUsuarios = usuarios.map((user) => this.mapearUsuario(user));
        this.usuariosFiltrados = this.listaUsuarios;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
      },
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

  private ordernarAtividade(
    atividadeDrawer: AtividadeDrawer[],
  ): AtividadeDrawer[] {
    return [
      ...atividadeDrawer.sort((a, b) => a.data.getTime() - b.data.getTime()),
    ];
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
          atividades: this.ordernarAtividade([
            ...(atualizada.atividades ?? []),
          ]),
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
          ...atualizada,
          checklist: [...(atualizada.checklist ?? [])],
          atividades: [...(atualizada.atividades ?? [])],
        };

        this.tarefaAtualizada.emit(this.tarefa); // ✅

        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  trackChecklist(_: number, item: { id: string }) {
    return item.id;
  }

  private prioridadeToBadge(prioridade: string): string {
    switch (String(prioridade).toUpperCase()) {
      case 'CRITICA':
        return 'bg-danger';
      case 'ALTA':
        return 'bg-warning';
      case 'NORMAL':
        return 'bg-primary';
      default:
        return 'bg-secondary'; // BAIXA
    }
  }

  private mapearUsuario(dto: UsuarioDTO): Usuario {
    return {
      id: dto.id,
      nome: dto.nome,
      email: dto.email,
      perfil: dto.perfil || 'USER',
      ativo: dto.ativo !== undefined ? dto.ativo : true,
    };
  }

  abrirSelecaoResponsavel() {
    this.mostrarSelecaoResponsavel = true;
    this.filtroUsuario = '';
    if (this.listaUsuarios.length === 0) {
      this.listarUsuarios();
    }
  }

  filtrarUsuarios() {
    const termo = this.filtroUsuario.toLowerCase();
    if (!termo) {
      this.usuariosFiltrados = this.listaUsuarios;
    } else {
      this.usuariosFiltrados = this.listaUsuarios.filter(
        (user) =>
          user.nome.toLowerCase().includes(termo) ||
          user.email.toLowerCase().includes(termo),
      );
    }
  }

  // selecionarResponsavel(usuario: Usuario) {
  //   this.responsavelSelecionado = usuario;
  //   this.mostrarSelecaoResponsavel = false;

  //   // Chamar API para atribuir responsável
  //   this.tarefaApi
  //     .atribuirResponsavel(this.tarefa.id!, usuario.id, 'Leonardo Castro')
  //     .subscribe({
  //       next: (dto) => {
  //         const atualizada = tarefaDtoToDrawer(dto);
  //         this.tarefa = {
  //           ...this.tarefa,
  //           ...atualizada,
  //           checklist: [...(atualizada.checklist ?? [])],
  //           atividades: this.ordernarAtividade([
  //             ...(atualizada.atividades ?? []),
  //           ]),
  //         };
  //         this.tarefaAtualizada.emit(this.tarefa);
  //         this.cdr.detectChanges();
  //       },
  //       error: (err) => {
  //         console.error('Erro ao atribuir responsável:', err);
  //         alert('Erro ao atribuir responsável');
  //       },
  //     });
  // }

  setPrioridade(nova: string) {
    if (!nova || nova === this.tarefa.badgeTexto) {
      this.mostrarPrioridades = false;
      return;
    }

    const prioridadeAnterior = this.tarefa.badgeTexto;

    this.tarefa.badgeTexto = nova;
    this.tarefa.badgeClasseCor = this.prioridadeToBadge(nova);
    this.mostrarPrioridades = false;

    this.tarefaApi
      .alterarPrioridade(this.tarefa.id!, nova, 'Leonardo Castro')
      .subscribe({
        next: (dto) => {
          const atualizada = tarefaDtoToDrawer(dto);

          this.tarefa = {
            ...this.tarefa,
            ...atualizada,
            checklist: [...(atualizada.checklist ?? [])],
            atividades: [...(atualizada.atividades ?? [])],
          };

          this.tarefaAtualizada.emit(this.tarefa); // ✅ AVISA O BOARD

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.tarefa.badgeTexto = prioridadeAnterior;
          this.tarefa.badgeClasseCor =
            this.prioridadeToBadge(prioridadeAnterior);

          this.tarefaAtualizada.emit(this.tarefa); // ✅ volta pro board também

          this.cdr.detectChanges();
        },
      });
  }

  getCorAvatar(nome: string): string {
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
