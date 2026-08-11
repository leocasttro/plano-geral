import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RelatorioApi } from '../../domain/relatorio/relatorio.api';
import { RelatorioPessoalDTO } from '../../domain/relatorio/relatorio.model';
import { AuthService } from '../../domain/auth/auth.service';

@Component({
  selector: 'app-relatorio-pessoal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relatorio-pessoal.html',
  styleUrl: './relatorio-pessoal.scss',
})
export class RelatorioPessoal implements OnInit {
  relatorio: RelatorioPessoalDTO | null = null;
  loading = false;
  error = '';

  constructor(
    private relatorioApi: RelatorioApi,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    this.error = '';

    this.relatorioApi.pessoal().subscribe({
      next: (relatorio) => {
        this.relatorio = relatorio;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erro ao carregar seu relatório.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get nomeUsuario(): string {
    return this.authService.usuario()?.nome ?? 'Colaborador';
  }

  tarefasPorStatus(status: string): number {
    return this.relatorio?.tarefas.filter((tarefa) => this.statusIgual(tarefa.status, status)).length ?? 0;
  }

  statusChart() {
    const resumo = this.relatorio?.resumo;

    return [
      { label: 'Pendentes', value: resumo?.pendentes ?? 0, className: 'pending' },
      { label: 'Em andamento', value: resumo?.emAndamento ?? 0, className: 'progress' },
      { label: 'Concluídas', value: resumo?.concluidas ?? 0, className: 'done' },
      { label: 'Atrasadas', value: resumo?.atrasadas ?? 0, className: 'danger' },
    ];
  }

  prioridadeChart() {
    const tarefas = this.relatorio?.tarefas ?? [];
    const prioridades = ['BAIXA', 'NORMAL', 'ALTA', 'CRITICA'];

    return prioridades.map((prioridade) => ({
      label: this.prioridadeLabel(prioridade),
      value: tarefas.filter((tarefa) => tarefa.prioridade === prioridade).length,
      className: prioridade.toLowerCase(),
    }));
  }

  projetoChart() {
    const tarefas = this.relatorio?.tarefas ?? [];
    const grupos = new Map<string, number>();

    tarefas.forEach((tarefa) => {
      const projeto = tarefa.projetoNome || 'Sem projeto';
      grupos.set(projeto, (grupos.get(projeto) ?? 0) + 1);
    });

    return [...grupos.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }

  maiorValor(items: { value: number }[]): number {
    return Math.max(...items.map((item) => item.value), 1);
  }

  alturaColuna(value: number, items: { value: number }[]): number {
    return Math.max(8, (value / this.maiorValor(items)) * 100);
  }

  donutStyle(): string {
    const percentual = this.relatorio?.resumo.percentualConclusao ?? 0;

    return `conic-gradient(#059669 ${percentual * 3.6}deg, #e5e7eb 0deg)`;
  }

  indicadorDesempenho(): string {
    const percentual = this.relatorio?.resumo.percentualConclusao ?? 0;

    if (percentual >= 80) return 'Muito bom';
    if (percentual >= 50) return 'Em evolução';
    if (percentual > 0) return 'Atenção';
    return 'Sem conclusão';
  }

  formatarData(data?: string | null): string {
    if (!data) return 'Sem data';

    const [ano, mes, dia] = data.split('-').map(Number);
    if (!ano || !mes || !dia) return data;

    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR');
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDENTE: 'Pendente',
      EM_ANDAMENTO: 'Em andamento',
      CONCLUIDA: 'Concluída',
      CONCLUIDO: 'Concluída',
    };

    return labels[status] ?? status;
  }

  statusIgual(statusAtual: string, statusEsperado: string): boolean {
    if (statusEsperado === 'CONCLUIDA') {
      return statusAtual === 'CONCLUIDA' || statusAtual === 'CONCLUIDO';
    }

    return statusAtual === statusEsperado;
  }

  prioridadeLabel(prioridade: string): string {
    const labels: Record<string, string> = {
      BAIXA: 'Baixa',
      NORMAL: 'Normal',
      ALTA: 'Alta',
      CRITICA: 'Crítica',
    };

    return labels[prioridade] ?? prioridade;
  }
}
