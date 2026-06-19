import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProjetoDTO } from '../../domain/projeto/projetoModel';
import { ProjetoApi } from '../../domain/projeto/projeto.api';
import { ProjetoEventsService } from '../../domain/projeto/projeto-events.service';
import { TarefaDTO } from '../../domain/tarefa/tarefa.model';
import { UsuarioApi } from '../../domain/usuario/usuario.api';
import { UsuarioDTO } from '../../domain/usuario/usuario.model';

@Component({
  selector: 'app-projeto',
  imports: [CommonModule, FormsModule],
  templateUrl: './projeto.html',
  styleUrl: './projeto.scss',
})
export class Projeto implements OnInit, OnDestroy {
  projetos: ProjetoDTO[] = [];
  usuarios: UsuarioDTO[] = [];

  projetoSelecionado: ProjetoDTO | null = null;
  projetoModalSelecionado: ProjetoDTO | null = null;

  modalNovoProjetoAberto = false;
  modalTarefasProjetoAberto = false;

  novoProjeto = {
    nome: '',
    descricao: '',
    centroCusto: '',
    coordenadorId: '',
  };

  loading = false;
  error = '';

  statusMenuProjetoId: string | null = null;

  statusOptions = ['ATIVO', 'PAUSADO', 'CONCLUIDO', 'CANCELADO'];

  private sub?: Subscription;

  constructor(
    private projetoApi: ProjetoApi,
    private projetoEvents: ProjetoEventsService,
    private cdr: ChangeDetectorRef,
    private usuarioApi: UsuarioApi,
  ) {}

  ngOnInit() {
    this.carregarProjetos();
    this.carregarUsuarios();

    this.sub = this.projetoEvents.novoProjeto$.subscribe(() => {
      this.abrirModalNovoProjeto();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    document.body.classList.remove('modal-open');
  }

  carregarProjetos() {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.projetoApi.buscarTodos().subscribe({
      next: (projetos) => {
        this.projetos = projetos;
        this.projetoSelecionado = projetos[0] ?? null;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erro ao carregar projetos';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  carregarUsuarios() {
    this.usuarioApi.buscarTodos().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  selecionarProjeto(projeto: ProjetoDTO) {
    this.projetoSelecionado = projeto;
  }

  abrirModalTarefas(projeto: ProjetoDTO) {
    this.projetoModalSelecionado = projeto;
    this.modalTarefasProjetoAberto = true;
    document.body.classList.add('modal-open');
  }

  fecharModalTarefas() {
    this.modalTarefasProjetoAberto = false;
    this.projetoModalSelecionado = null;
    document.body.classList.remove('modal-open');
  }

  abrirModalNovoProjeto() {
    this.novoProjeto = {
      nome: '',
      descricao: '',
      centroCusto: '',
      coordenadorId: '',
    };

    this.modalNovoProjetoAberto = true;
    document.body.classList.add('modal-open');
  }

  fecharModalNovoProjeto() {
    this.modalNovoProjetoAberto = false;
    document.body.classList.remove('modal-open');
  }

  criarProjeto() {
    if (!this.novoProjeto.nome.trim()) return;

    this.projetoApi.criar(this.novoProjeto).subscribe({
      next: (projeto) => {
        this.projetos = [projeto, ...this.projetos];
        this.projetoSelecionado = projeto;
        this.fecharModalNovoProjeto();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erro ao criar projeto';
        this.cdr.detectChanges();
      },
    });
  }

  tarefasDoProjeto(projeto: ProjetoDTO | null = this.projetoModalSelecionado): TarefaDTO[] {
    return projeto?.tarefas ?? [];
  }

  tarefasPorStatus(status: string): TarefaDTO[] {
    return this.tarefasDoProjeto().filter((tarefa) => tarefa.status === status);
  }

  pendentesModal(): TarefaDTO[] {
    return this.tarefasPorStatus('PENDENTE');
  }

  andamentoModal(): TarefaDTO[] {
    return this.tarefasPorStatus('EM_ANDAMENTO');
  }

  concluidasModal(): TarefaDTO[] {
    return this.tarefasPorStatus('CONCLUIDA');
  }

  totalTarefas(projeto: ProjetoDTO): number {
    return projeto.totalTarefas ?? projeto.tarefas?.length ?? 0;
  }

  prioridadeBadgeClass(prioridade: string): string {
    switch (prioridade) {
      case 'BAIXA':
        return 'bg-secondary';
      case 'NORMAL':
        return 'bg-primary';
      case 'ALTA':
        return 'bg-warning text-dark';
      case 'CRITICA':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  toggleStatusMenu(projetoId: string) {
    this.statusMenuProjetoId =
      this.statusMenuProjetoId === projetoId ? null : projetoId;
  }

  alterarStatusProjeto(projeto: ProjetoDTO, status: string) {
    if (projeto.status === status) {
      this.statusMenuProjetoId = null;
      return;
    }

    this.projetoApi.atualizarStatus(projeto.id, status).subscribe({
      next: (projetoAtualizado) => {
        this.projetos = this.projetos.map((item) =>
          item.id === projetoAtualizado.id ? projetoAtualizado : item,
        );

        if (this.projetoSelecionado?.id === projetoAtualizado.id) {
          this.projetoSelecionado = projetoAtualizado;
        }

        if (this.projetoModalSelecionado?.id === projetoAtualizado.id) {
          this.projetoModalSelecionado = projetoAtualizado;
        }

        this.statusMenuProjetoId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erro ao alterar status do projeto';
        this.statusMenuProjetoId = null;
        this.cdr.detectChanges();
      },
    });
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'ATIVO':
        return 'Ativo';
      case 'PAUSADO':
        return 'Pausado';
      case 'CONCLUIDO':
        return 'Concluído';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'ATIVO':
        return 'bg-success';
      case 'PAUSADO':
        return 'bg-warning text-dark';
      case 'CONCLUIDO':
        return 'bg-primary';
      case 'CANCELADO':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}
