import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type StatusUI = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO';
type PrioridadeUI = 'BAIXA' | 'NORMAL' | 'ALTA' | 'CRITICA';

type ProjetoUI = { id: string; nome: string; descricao?: string };

type TarefaUI = {
  id: string;
  titulo: string;
  descricao?: string;
  status: StatusUI;
  prioridade: PrioridadeUI;
  responsavel?: string;
  projetoId: string;
  prazo?: string; // opcional: "2026-02-10"
};

type CardId = 'TODAS' | 'MINHAS' | 'ATRASADAS' | 'CRITICAS' | 'CONCLUIDAS';

type CardUI = {
  id: CardId;
  titulo: string;
  subtitulo?: string;
  icone?: string; // se quiser usar depois
};

@Component({
  selector: 'app-projeto',
  imports: [CommonModule],
  templateUrl: './projeto.html',
  styleUrl: './projeto.scss',
})
export class Projeto {
  // ===== Mock =====
  projetos: ProjetoUI[] = [
    { id: '1', nome: 'Site institucional', descricao: 'Refatorar layout e SEO' },
    { id: '2', nome: 'App mobile', descricao: 'MVP do aplicativo' },
    { id: '3', nome: 'CRM interno', descricao: 'Funil e relatórios' },
  ];

  tarefas: TarefaUI[] = [
    { id: 't1', titulo: 'Criar header', status: 'CONCLUIDO', prioridade: 'NORMAL', responsavel: 'Leonardo', projetoId: '1', prazo: '2026-01-20' },
    { id: 't2', titulo: 'Página home', status: 'EM_ANDAMENTO', prioridade: 'ALTA', responsavel: 'Leonardo', projetoId: '1', prazo: '2026-02-01' },
    { id: 't3', titulo: 'Otimizar imagens', status: 'PENDENTE', prioridade: 'BAIXA', responsavel: 'Ana', projetoId: '1', prazo: '2026-01-15' },

    { id: 't4', titulo: 'Tela login', status: 'EM_ANDAMENTO', prioridade: 'CRITICA', responsavel: 'Leonardo', projetoId: '2', prazo: '2026-02-05' },
    { id: 't5', titulo: 'Integração API', status: 'PENDENTE', prioridade: 'ALTA', responsavel: 'Bruno', projetoId: '2', prazo: '2026-01-10' },

    { id: 't6', titulo: 'Pipeline de dados', status: 'PENDENTE', prioridade: 'NORMAL', responsavel: 'Ana', projetoId: '3', prazo: '2026-02-15' },
    { id: 't7', titulo: 'Relatório mensal', status: 'CONCLUIDO', prioridade: 'NORMAL', responsavel: 'Bruno', projetoId: '3', prazo: '2026-01-05' },
  ];

  // ===== Cards de dashboard =====
  cards: CardUI[] = [
    { id: 'TODAS', titulo: 'Todas as tarefas', subtitulo: 'Visão geral' },
    { id: 'MINHAS', titulo: 'Minhas tarefas', subtitulo: 'Atribuídas a você' },
    { id: 'ATRASADAS', titulo: 'Atrasadas', subtitulo: 'Prazo vencido' },
    { id: 'CRITICAS', titulo: 'Críticas', subtitulo: 'Prioridade CRITICA' },
    { id: 'CONCLUIDAS', titulo: 'Concluídas', subtitulo: 'Finalizadas' },
  ];

  // ===== Modal state =====
  modalAberto = false;
  cardSelecionado: CardUI | null = null;

  // (opcional) simula "usuário logado"
  usuarioAtual = 'Leonardo';

  abrirModal(card: CardUI) {
    this.cardSelecionado = card;
    this.modalAberto = true;
    document.body.classList.add('modal-open');
  }

  fecharModal() {
    this.modalAberto = false;
    this.cardSelecionado = null;
    document.body.classList.remove('modal-open');
  }

  // ===== Filtros para cada card =====
  get tarefasFiltradasDoCard(): TarefaUI[] {
    if (!this.cardSelecionado) return [];

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    switch (this.cardSelecionado.id) {
      case 'TODAS':
        return [...this.tarefas];

      case 'MINHAS':
        return this.tarefas.filter(t => (t.responsavel ?? '') === this.usuarioAtual);

      case 'ATRASADAS':
        return this.tarefas.filter(t => {
          if (!t.prazo) return false;
          const prazo = new Date(t.prazo);
          prazo.setHours(0, 0, 0, 0);
          return prazo < hoje && t.status !== 'CONCLUIDO';
        });

      case 'CRITICAS':
        return this.tarefas.filter(t => t.prioridade === 'CRITICA' && t.status !== 'CONCLUIDO');

      case 'CONCLUIDAS':
        return this.tarefas.filter(t => t.status === 'CONCLUIDO');
    }
  }

  // ===== Kanban dentro do modal =====
  get pendentesModal() {
    return this.tarefasFiltradasDoCard.filter(t => t.status === 'PENDENTE');
  }

  get andamentoModal() {
    return this.tarefasFiltradasDoCard.filter(t => t.status === 'EM_ANDAMENTO');
  }

  get concluidasModal() {
    return this.tarefasFiltradasDoCard.filter(t => t.status === 'CONCLUIDO');
  }

  // ===== Contadores nos cards =====
  countCard(id: CardId): number {
    const fakeCard: CardUI = { id, titulo: '' };
    this.cardSelecionado = fakeCard; // uso temporário pra reaproveitar o filtro
    const total = this.tarefasFiltradasDoCard.length;
    this.cardSelecionado = null;
    return total;
  }

  prioridadeBadgeClass(p: PrioridadeUI): string {
    switch (p) {
      case 'BAIXA': return 'bg-secondary';
      case 'NORMAL': return 'bg-primary';
      case 'ALTA': return 'bg-warning text-dark';
      case 'CRITICA': return 'bg-danger';
    }
  }
}
