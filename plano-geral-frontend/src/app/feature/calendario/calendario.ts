import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { catchError, finalize, of, take } from 'rxjs';
import { RelatorioApi } from '../../domain/relatorio/relatorio.api';
import {
  RelatorioCalendarioTarefasDTO,
  TarefaCalendarioDTO,
} from '../../domain/relatorio/relatorio.model';

type CalendarioModo = 'ano' | 'mes' | 'semana' | 'dia';

type CalendarioDia = {
  data: Date;
  iso: string;
  numero: number;
  foraDoMes: boolean;
  hoje: boolean;
  tarefas: TarefaCalendarioDTO[];
};

type CalendarioMesResumo = {
  indice: number;
  nome: string;
  total: number;
  atrasadas: number;
  concluidas: number;
  largura: number;
};

type CalendarioFaixa = {
  tarefa: TarefaCalendarioDTO;
  inicioColuna: number;
  fimColuna: number;
  linha: number;
  iniciaNoPeriodo: boolean;
  terminaNoPeriodo: boolean;
};

type CalendarioSemana = {
  dias: CalendarioDia[];
  faixas: CalendarioFaixa[];
};

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario.html',
  styleUrl: './calendario.scss',
})
export class Calendario implements OnInit {
  calendario: RelatorioCalendarioTarefasDTO | null = null;
  calendarioModo: CalendarioModo = 'mes';
  dataCalendario = this.inicioDoDia(new Date());
  calendarioSemanaDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  calendarioModos: { id: CalendarioModo; label: string }[] = [
    { id: 'ano', label: 'Ano' },
    { id: 'mes', label: 'Mês' },
    { id: 'semana', label: 'Semana' },
    { id: 'dia', label: 'Dia' },
  ];

  loading = false;
  error = '';

  constructor(
    private relatorioApi: RelatorioApi,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarCalendario();
  }

  carregarCalendario(): void {
    this.loading = true;
    this.error = '';

    this.relatorioApi
      .calendario()
      .pipe(
        take(1),
        catchError((err) => {
          console.error('Erro ao buscar calendário:', err);
          this.error = 'Erro ao carregar calendário.';
          return of({ periodo: { inicio: null, fim: null }, total: 0, tarefas: [] });
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe((calendario) => {
        this.calendario = calendario;
      });
  }

  alterarModoCalendario(modo: CalendarioModo): void {
    this.calendarioModo = modo;
  }

  voltarCalendario(): void {
    this.dataCalendario = this.moverDataCalendario(-1);
  }

  avancarCalendario(): void {
    this.dataCalendario = this.moverDataCalendario(1);
  }

  irParaHojeCalendario(): void {
    this.dataCalendario = this.inicioDoDia(new Date());
  }

  tituloCalendario(): string {
    if (this.calendarioModo === 'ano') {
      return String(this.dataCalendario.getFullYear());
    }

    if (this.calendarioModo === 'semana') {
      const dias = this.diasDaSemanaCalendario();
      const primeiro = dias[0].data;
      const ultimo = dias[dias.length - 1].data;

      return `${this.formatarDiaMes(primeiro)} - ${this.formatarDataBrasil(this.formatDateOnly(ultimo))}`;
    }

    if (this.calendarioModo === 'dia') {
      return this.formatarDataBrasil(this.formatDateOnly(this.dataCalendario));
    }

    return this.dataCalendario.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  }

  diasDoMesCalendario(): CalendarioDia[] {
    const ano = this.dataCalendario.getFullYear();
    const mes = this.dataCalendario.getMonth();
    const primeiroDiaMes = new Date(ano, mes, 1);
    const inicioGrade = new Date(ano, mes, 1 - primeiroDiaMes.getDay());

    return Array.from({ length: 42 }, (_, indice) => {
      const data = new Date(inicioGrade);
      data.setDate(inicioGrade.getDate() + indice);

      return this.montarDiaCalendario(data, data.getMonth() !== mes);
    });
  }

  semanasDoMesCalendario(): CalendarioSemana[] {
    const dias = this.diasDoMesCalendario();
    const semanas: CalendarioSemana[] = [];

    for (let indice = 0; indice < dias.length; indice += 7) {
      const diasSemana = dias.slice(indice, indice + 7);

      semanas.push({
        dias: diasSemana,
        faixas: this.criarFaixasPeriodo(diasSemana),
      });
    }

    return semanas;
  }

  diasDaSemanaCalendario(): CalendarioDia[] {
    const inicio = new Date(this.dataCalendario);
    inicio.setDate(this.dataCalendario.getDate() - this.dataCalendario.getDay());

    return Array.from({ length: 7 }, (_, indice) => {
      const data = new Date(inicio);
      data.setDate(inicio.getDate() + indice);

      return this.montarDiaCalendario(data, false);
    });
  }

  faixasDaSemanaCalendario(): CalendarioFaixa[] {
    return this.criarFaixasPeriodo(this.diasDaSemanaCalendario());
  }

  tarefasDoDiaCalendario(): TarefaCalendarioDTO[] {
    return this.tarefasNaData(this.dataCalendario);
  }

  mesesDoAnoCalendario(): CalendarioMesResumo[] {
    const ano = this.dataCalendario.getFullYear();
    const meses = Array.from({ length: 12 }, (_, indice) => {
      const inicio = new Date(ano, indice, 1);
      const fim = new Date(ano, indice + 1, 0);
      const tarefas = this.tarefasCalendario().filter((tarefa) =>
        this.tarefaSobrepoePeriodo(tarefa, inicio, fim),
      );

      return {
        indice,
        nome: inicio.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        total: tarefas.length,
        atrasadas: tarefas.filter((tarefa) => tarefa.atrasada).length,
        concluidas: tarefas.filter((tarefa) => tarefa.status === 'CONCLUIDA').length,
        largura: 0,
      };
    });

    const maiorTotal = Math.max(...meses.map((mes) => mes.total), 1);

    return meses.map((mes) => ({
      ...mes,
      largura: Math.max(8, Math.round((mes.total / maiorTotal) * 100)),
    }));
  }

  selecionarMesCalendario(indice: number): void {
    this.dataCalendario = new Date(this.dataCalendario.getFullYear(), indice, 1);
    this.calendarioModo = 'mes';
  }

  selecionarDiaCalendario(dia: CalendarioDia): void {
    this.dataCalendario = dia.data;
    this.calendarioModo = 'dia';
  }

  abrirTarefaNoDia(tarefa: TarefaCalendarioDTO): void {
    this.dataCalendario = this.parseDateOnly(tarefa.dataInicio);
    this.calendarioModo = 'dia';
  }

  classeStatusCalendario(tarefa: TarefaCalendarioDTO): string {
    if (tarefa.atrasada) {
      return 'overdue';
    }

    if (tarefa.status === 'CONCLUIDA') {
      return 'done';
    }

    if (tarefa.status === 'EM_ANDAMENTO') {
      return 'progress';
    }

    return 'pending';
  }

  resumoTarefaCalendario(tarefa: TarefaCalendarioDTO): string {
    const projeto = tarefa.projeto?.nome ?? 'Sem projeto';

    return `${projeto} · ${this.formatarDataBrasil(tarefa.dataInicio)} até ${this.formatarDataBrasil(tarefa.dataFim)}`;
  }

  estiloFaixaCalendario(faixa: CalendarioFaixa): Record<string, string> {
    return {
      'grid-column': `${faixa.inicioColuna} / ${faixa.fimColuna + 1}`,
      'grid-row': String(faixa.linha),
    };
  }

  nomeDiaSemana(data: Date): string {
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
    });
  }

  formatarDataBrasil(data?: string | null): string {
    if (!data) {
      return 'sem data';
    }

    const date = new Date(data);

    if (Number.isNaN(date.getTime())) {
      return 'sem data';
    }

    return date.toLocaleDateString('pt-BR', {
      timeZone: 'UTC',
    });
  }

  private moverDataCalendario(direcao: -1 | 1): Date {
    const data = new Date(this.dataCalendario);

    if (this.calendarioModo === 'ano') {
      data.setFullYear(data.getFullYear() + direcao);
      return data;
    }

    if (this.calendarioModo === 'mes') {
      data.setMonth(data.getMonth() + direcao, 1);
      return data;
    }

    if (this.calendarioModo === 'semana') {
      data.setDate(data.getDate() + direcao * 7);
      return data;
    }

    data.setDate(data.getDate() + direcao);
    return data;
  }

  private montarDiaCalendario(data: Date, foraDoMes: boolean): CalendarioDia {
    const dia = this.inicioDoDia(data);

    return {
      data: dia,
      iso: this.formatDateOnly(dia),
      numero: dia.getDate(),
      foraDoMes,
      hoje: this.formatDateOnly(dia) === this.formatDateOnly(new Date()),
      tarefas: this.tarefasNaData(dia),
    };
  }

  private criarFaixasPeriodo(dias: CalendarioDia[]): CalendarioFaixa[] {
    if (!dias.length) {
      return [];
    }

    const inicioPeriodo = dias[0].data;
    const fimPeriodo = dias[dias.length - 1].data;
    const faixasBase = this.tarefasCalendario()
      .filter((tarefa) => this.tarefaSobrepoePeriodo(tarefa, inicioPeriodo, fimPeriodo))
      .map((tarefa) => {
        const inicioTarefa = this.parseDateOnly(tarefa.dataInicio);
        const fimTarefa = this.parseDateOnly(tarefa.dataFim);
        const inicioVisivel = inicioTarefa > inicioPeriodo ? inicioTarefa : inicioPeriodo;
        const fimVisivel = fimTarefa < fimPeriodo ? fimTarefa : fimPeriodo;

        return {
          tarefa,
          inicioColuna: this.diferencaDias(inicioPeriodo, inicioVisivel) + 1,
          fimColuna: this.diferencaDias(inicioPeriodo, fimVisivel) + 1,
          linha: 1,
          iniciaNoPeriodo: inicioTarefa >= inicioPeriodo,
          terminaNoPeriodo: fimTarefa <= fimPeriodo,
        };
      })
      .sort((a, b) => {
        if (a.inicioColuna !== b.inicioColuna) {
          return a.inicioColuna - b.inicioColuna;
        }

        return b.fimColuna - a.fimColuna || a.tarefa.titulo.localeCompare(b.tarefa.titulo);
      });

    const linhasFim: number[] = [];

    return faixasBase.map((faixa) => {
      const linhaIndex = linhasFim.findIndex((fimColuna) => fimColuna < faixa.inicioColuna);
      const linha = linhaIndex === -1 ? linhasFim.length : linhaIndex;
      linhasFim[linha] = faixa.fimColuna;

      return {
        ...faixa,
        linha: linha + 1,
      };
    });
  }

  private tarefasNaData(data: Date): TarefaCalendarioDTO[] {
    return this.tarefasCalendario().filter((tarefa) =>
      this.tarefaSobrepoePeriodo(tarefa, data, data),
    );
  }

  private tarefaSobrepoePeriodo(
    tarefa: TarefaCalendarioDTO,
    inicioPeriodo: Date,
    fimPeriodo: Date,
  ): boolean {
    const inicio = this.parseDateOnly(tarefa.dataInicio);
    const fim = this.parseDateOnly(tarefa.dataFim);

    return fim >= inicioPeriodo && inicio <= fimPeriodo;
  }

  private tarefasCalendario(): TarefaCalendarioDTO[] {
    return this.calendario?.tarefas ?? [];
  }

  private parseDateOnly(data: string): Date {
    const [ano, mes, dia] = data.split('-').map(Number);

    return new Date(ano, mes - 1, dia);
  }

  private diferencaDias(inicio: Date, fim: Date): number {
    const msPorDia = 1000 * 60 * 60 * 24;

    return Math.round((fim.getTime() - inicio.getTime()) / msPorDia);
  }

  private inicioDoDia(data: Date): Date {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
  }

  private formatDateOnly(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  private formatarDiaMes(data: Date): string {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  }
}
