import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProjetoDTO } from '../../domain/projeto/projetoModel';
import { ProjetoApi } from '../../domain/projeto/projeto.api';
import { ProjetoEventsService } from '../../domain/projeto/projeto-events.service';
import { TarefaDTO } from '../../domain/tarefa/tarefa.model';

@Component({
  selector: 'app-projeto',
  imports: [CommonModule, FormsModule],
  templateUrl: './projeto.html',
  styleUrl: './projeto.scss',
})
export class Projeto implements OnInit, OnDestroy {
  projetos: ProjetoDTO[] = [];

  projetoSelecionado: ProjetoDTO | null = null;
  projetoModalSelecionado: ProjetoDTO | null = null;

  modalNovoProjetoAberto = false;
  modalTarefasProjetoAberto = false;

  novoProjeto = {
    nome: '',
    descricao: '',
  };

  loading = false;
  error = '';

  private sub?: Subscription;

  constructor(
    private projetoApi: ProjetoApi,
    private projetoEvents: ProjetoEventsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.carregarProjetos();

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
}
