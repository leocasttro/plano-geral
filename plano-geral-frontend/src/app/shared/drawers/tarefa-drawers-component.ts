import {
  SolicitacaoAlteracaoDatasDTO,
  TarefaApi,
} from './../../domain/tarefa/tarefa.api';
import { AtividadeDTO, Usuario } from '../../domain/tarefa/tarefa.model';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import {
  NgbCollapseModule,
  NgbOffcanvas,
  NgbTypeaheadModule,
} from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { EventEmitter, Output } from '@angular/core';

import {
  AtividadeDrawer,
  CardDataDrawer,
  tarefaDtoToDrawer,
} from './tarefa-drawer.mapper';
import { UsuarioApi } from '../../domain/usuario/usuario.api';
import { UsuarioDTO } from '../../domain/usuario/usuario.model';
import { ToastService } from '../toast/toast.service';
import { AuthService } from '../../domain/auth/auth.service';

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
  @Input() solicitacaoAlteracaoDatasId: string | null = null;
  @Output() tarefaAtualizada = new EventEmitter<CardDataDrawer>();
  @Output() tarefaExcluida = new EventEmitter<string>();

  faCalendar = faCalendar;

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

  mostrandoCalendario = false;
  dataInicioTemp: string = '';
  dataFimTemp: string = '';
  justificativaDatasTemp = '';

  salvandoDatas = false;
  excluindoTarefa = false;
  avaliandoSolicitacaoDatas = false;
  solicitacaoAlteracaoDatas: SolicitacaoAlteracaoDatasDTO | null = null;
  solicitacaoAlteracaoDatasPendente: SolicitacaoAlteracaoDatasDTO | null = null;

  constructor(
    private offcanvas: NgbOffcanvas,
    private tarefaApi: TarefaApi,
    private usuarioApi: UsuarioApi,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.tarefa.atividades = this.tarefa.atividades ?? [];
    this.tarefa.checklist = this.tarefa.checklist ?? [];
    this.listarAtividades();
    this.listarUsuarios();
    this.carregarSolicitacaoAlteracaoDatas();
    this.carregarSolicitacaoAlteracaoDatasPendente();
    this.participantes = [
      ...new Set(this.tarefa.atividades.map((a) => a.usuario)),
    ];

    if (this.tarefa.responsavel) {
      this.responsavelSelecionado = {
        id: this.tarefa.responsavel.id,
        nome: this.tarefa.responsavel.nome,
        email: this.tarefa.responsavel.email,
        perfil: 'USER',
        ativo: true,
      };
    }
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

          this.toast.success('Comentário adicionado na tarefa.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Erro ao adicionar comentário.');
        },
      });
  }

  carregarSolicitacaoAlteracaoDatas(): void {
    if (!this.solicitacaoAlteracaoDatasId) {
      this.solicitacaoAlteracaoDatas = null;
      return;
    }

    this.tarefaApi
      .buscarSolicitacaoAlteracaoDatas(this.solicitacaoAlteracaoDatasId)
      .subscribe({
        next: (solicitacao) => {
          this.solicitacaoAlteracaoDatas = solicitacao;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao carregar solicitação de datas:', err);
          this.solicitacaoAlteracaoDatas = null;
          this.cdr.detectChanges();
        },
      });
  }

  carregarSolicitacaoAlteracaoDatasPendente(): void {
    if (!this.tarefa.id || this.podeAlterarDatas()) {
      this.solicitacaoAlteracaoDatasPendente = null;
      return;
    }

    this.tarefaApi.buscarSolicitacaoAlteracaoDatasPendente(this.tarefa.id).subscribe({
      next: (solicitacao) => {
        this.solicitacaoAlteracaoDatasPendente = solicitacao;
        this.cdr.detectChanges();
      },
      error: () => {
        this.solicitacaoAlteracaoDatasPendente = null;
        this.cdr.detectChanges();
      },
    });
  }

  aprovarSolicitacaoAlteracaoDatas(): void {
    if (!this.solicitacaoAlteracaoDatasId || this.avaliandoSolicitacaoDatas) {
      return;
    }

    this.avaliandoSolicitacaoDatas = true;

    this.tarefaApi
      .aprovarAlteracaoDatas(this.solicitacaoAlteracaoDatasId)
      .subscribe({
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

          this.solicitacaoAlteracaoDatasId = null;
          this.solicitacaoAlteracaoDatas = null;
          this.avaliandoSolicitacaoDatas = false;
          this.tarefaAtualizada.emit(this.tarefa);
          this.toast.success('Solicitação de datas aprovada.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.toast.error(err.error?.error ?? 'Erro ao aprovar solicitação.');
          this.avaliandoSolicitacaoDatas = false;
          this.cdr.detectChanges();
        },
      });
  }

  reprovarSolicitacaoAlteracaoDatas(): void {
    if (!this.solicitacaoAlteracaoDatasId || this.avaliandoSolicitacaoDatas) {
      return;
    }

    this.avaliandoSolicitacaoDatas = true;

    this.tarefaApi
      .reprovarAlteracaoDatas(this.solicitacaoAlteracaoDatasId)
      .subscribe({
        next: () => {
          this.solicitacaoAlteracaoDatasId = null;
          this.solicitacaoAlteracaoDatas = null;
          this.avaliandoSolicitacaoDatas = false;
          this.toast.success('Solicitação de datas reprovada.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.toast.error(err.error?.error ?? 'Erro ao reprovar solicitação.');
          this.avaliandoSolicitacaoDatas = false;
          this.cdr.detectChanges();
        },
      });
  }

  estaAvaliandoSolicitacaoAlteracaoDatas(): boolean {
    return !!this.solicitacaoAlteracaoDatasId;
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

  excluirTarefa(): void {
    if (!this.tarefa.id || this.excluindoTarefa) return;

    this.excluindoTarefa = true;

    this.tarefaApi.excluir(this.tarefa.id).subscribe({
      next: () => {
        this.toast.success('Tarefa apagada.');
        this.tarefaExcluida.emit(this.tarefa.id!);
        this.offcanvas.dismiss();
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.error?.error ?? 'Erro ao apagar tarefa.');
        this.excluindoTarefa = false;
        this.cdr.detectChanges();
      },
    });
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
        this.toast.success('Item adicionado ao checklist.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Erro ao adicionar item no checklist.');
      },
    });
  }

  salvarDatas() {
    if (!this.tarefa.id) return;

    if (!this.validarDatas()) {
      this.toast.warning('A data de início não pode ser maior que a data de fim.');
      return;
    }

    if (this.deveSolicitarAprovacaoDatas() && this.solicitacaoAlteracaoDatasPendente) {
      this.toast.warning('Aguarde a aprovação ou reprovação da solicitação pendente.');
      return;
    }

    if (
      this.deveInformarJustificativaDatas() &&
      !this.justificativaDatasTemp.trim()
    ) {
      this.toast.warning('Informe uma justificativa para alterar as datas.');
      return;
    }

    this.salvandoDatas = true;

    const payload = {
      dataInicio: this.dataInicioTemp || undefined,
      dataFim: this.dataFimTemp || undefined,
      justificativa: this.deveInformarJustificativaDatas()
        ? this.justificativaDatasTemp.trim()
        : undefined,
    };

    if (this.deveSolicitarAprovacaoDatas()) {
      this.tarefaApi.solicitarAlteracaoDatas(this.tarefa.id, payload).subscribe({
        next: () => {
          this.mostrandoCalendario = false;
          this.salvandoDatas = false;
          this.carregarSolicitacaoAlteracaoDatasPendente();
          this.justificativaDatasTemp = '';
          this.toast.success('Solicitação de alteração de datas enviada para aprovação.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.toast.error(err.error?.error ?? 'Erro ao solicitar alteração das datas.');
          this.salvandoDatas = false;
          this.cdr.detectChanges();
        },
      });
      return;
    }

    this.tarefaApi.alterarDatas(this.tarefa.id, payload).subscribe({
      next: (dto) => {
        const atualizada = tarefaDtoToDrawer(dto);

        this.tarefa = {
          ...this.tarefa,
          ...atualizada,
          dataInicio: atualizada.dataInicio,
          dataFim: atualizada.dataFim,
          checklist: [...(atualizada.checklist ?? [])],
          atividades: this.ordernarAtividade([
            ...(atualizada.atividades ?? []),
          ]),
        };

        this.dataInicioTemp = this.tarefa.dataInicio || '';
        this.dataFimTemp = this.tarefa.dataFim || '';
        this.justificativaDatasTemp = '';

        this.mostrandoCalendario = false;
        this.salvandoDatas = false;

        this.tarefaAtualizada.emit(this.tarefa);
        this.toast.success('Datas da tarefa atualizadas.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.error?.error ?? 'Erro ao alterar as datas da tarefa.');
        this.salvandoDatas = false;
        this.cdr.detectChanges();
      },
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

        this.toast.success('Checklist atualizado.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Erro ao atualizar checklist.');
      },
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
    if (this.estaAvaliandoSolicitacaoAlteracaoDatas()) {
      this.toast.error('Não é possível alterar o responsável ao avaliar alteração de datas.');
      return;
    }

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

  selecionarResponsavel(usuario: Usuario) {
    if (this.estaAvaliandoSolicitacaoAlteracaoDatas()) {
      this.mostrarSelecaoResponsavel = false;
      this.toast.error('Não é possível alterar o responsável ao avaliar alteração de datas.');
      return;
    }

    this.responsavelSelecionado = usuario;
    this.mostrarSelecaoResponsavel = false;

    this.tarefaApi
      .atribuirResponsavel(this.tarefa.id!, usuario.id)
      .subscribe({
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

          this.responsavelSelecionado = this.tarefa.responsavel
            ? {
              id: this.tarefa.responsavel.id,
              nome: this.tarefa.responsavel.nome,
              email: this.tarefa.responsavel.email,
              perfil: 'USER',
              ativo: true,
            }
            : null;

          this.tarefaAtualizada.emit(this.tarefa);
          this.toast.success('Responsável atualizado.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao atribuir responsável:', err);
          this.toast.error('Erro ao atribuir responsável.');
        },
      });
  }

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
      .alterarPrioridade(this.tarefa.id!, nova)
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

          this.toast.success('Prioridade atualizada.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.tarefa.badgeTexto = prioridadeAnterior;
          this.tarefa.badgeClasseCor =
            this.prioridadeToBadge(prioridadeAnterior);

          this.tarefaAtualizada.emit(this.tarefa); // ✅ volta pro board também

          this.toast.error('Erro ao alterar prioridade.');
          this.cdr.detectChanges();
        },
      });
  }

  toggleCalendario(event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    if (!this.mostrandoCalendario) {
      this.dataInicioTemp = this.tarefa.dataInicio || '';
      this.dataFimTemp = this.tarefa.dataFim || '';
    }

    this.mostrandoCalendario = !this.mostrandoCalendario;
  }

  // Método para cancelar edição
  cancelarEdicao() {
    this.mostrandoCalendario = false;
    this.dataInicioTemp = '';
    this.dataFimTemp = '';
    this.justificativaDatasTemp = '';
  }

  // Formatar data para exibição (DD/MM/YYYY)
  formatarDataExibicao(data: string | undefined): string {
    if (!data) return '—';

    const [ano, mes, dia] = data.split('T')[0].split('-');

    if (!ano || !mes || !dia) {
      return '-';
    }

    return `${dia}/${mes}/${ano}`;
  }

  formatarDataSolicitacao(data: string | null | undefined): string {
    return this.formatarDataExibicao(data ?? undefined);
  }

  // Validação básica das datas
  validarDatas(): boolean {
    if (this.dataInicioTemp && this.dataFimTemp) {

      if (this.dataInicioTemp > this.dataFimTemp) {
        return false;
      }
    }
    return true;
  }

  deveInformarJustificativaDatas(): boolean {
    return this.deveSolicitarAprovacaoDatas() || !!(this.tarefa.dataInicio || this.tarefa.dataFim);
  }

  deveSolicitarAprovacaoDatas(): boolean {
    return !this.podeAlterarDatas() && !!(this.tarefa.dataInicio || this.tarefa.dataFim);
  }

  podeAlterarDatas(): boolean {
    const perfil = this.authService.usuario()?.perfil?.toUpperCase();
    return perfil === 'ADMIN' || perfil === 'MANAGER' || perfil === 'GESTOR';
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
