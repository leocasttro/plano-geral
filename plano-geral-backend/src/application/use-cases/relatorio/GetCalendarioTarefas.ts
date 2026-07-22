import { TarefaComPrazo } from '../../../domain/entities/TarefaComPrazo';
import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';
import { StatusTarefa } from '../../../domain/value-objects/StatusTarefa';
import {
  RelatorioCalendarioTarefaItemDTO,
  RelatorioCalendarioTarefasDTO,
} from '../../dtos/RelatorioCalendarioTarefasDTO';

type GetCalendarioTarefasInput = {
  projetoId?: string;
  inicio?: string;
  fim?: string;
};

export class GetCalendarioTarefas {
  constructor(private tarefaRepository: TarefaRepository) {}

  async execute(input: GetCalendarioTarefasInput = {}): Promise<RelatorioCalendarioTarefasDTO> {
    const filtroInicio = this.parseDateOnly(input.inicio, 'inicio');
    const filtroFim = this.parseDateOnly(input.fim, 'fim');

    if (filtroInicio && filtroFim && filtroInicio > filtroFim) {
      throw new Error('Data de início não pode ser maior que data de fim');
    }

    const tarefas = await this.tarefaRepository.list();

    const itens = tarefas
      .filter((tarefa) => tarefa instanceof TarefaComPrazo)
      .filter((tarefa) => !input.projetoId || tarefa.obterProjetoId() === input.projetoId)
      .map((tarefa) => this.toCalendarioItem(tarefa as TarefaComPrazo))
      .filter((item): item is RelatorioCalendarioTarefaItemDTO => item !== null)
      .filter((item) => this.temIntersecaoComPeriodo(item, filtroInicio, filtroFim))
      .sort((a, b) => {
        const inicioA = this.parseDateOnly(a.dataInicio, 'dataInicio')!.getTime();
        const inicioB = this.parseDateOnly(b.dataInicio, 'dataInicio')!.getTime();

        return inicioA - inicioB || a.titulo.localeCompare(b.titulo);
      });

    return {
      periodo: {
        inicio: input.inicio ?? null,
        fim: input.fim ?? null,
      },
      total: itens.length,
      tarefas: itens,
    };
  }

  private toCalendarioItem(tarefa: TarefaComPrazo): RelatorioCalendarioTarefaItemDTO | null {
    const periodo = tarefa.getPeriodo();
    const inicio = periodo.getInicio();
    const fim = periodo.getFim();

    if (!inicio && !fim) {
      return null;
    }

    const dataInicio = inicio ?? fim!;
    const dataFim = fim ?? inicio!;
    const projeto = tarefa.obterProjeto();

    return {
      id: tarefa.id,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      status: tarefa.obterStatus(),
      prioridade: tarefa.obterPrioridade(),
      responsavelId: tarefa.obterResponsavel() ?? null,
      projetoId: tarefa.obterProjetoId(),
      projeto,
      dataInicio: this.formatDateOnly(dataInicio),
      dataFim: this.formatDateOnly(dataFim),
      diasDuracao: this.calcularDiasInclusivos(dataInicio, dataFim),
      atrasada:
        tarefa.obterStatus() !== StatusTarefa.CONCLUIDA &&
        tarefa.estaAtrasada(),
    };
  }

  private temIntersecaoComPeriodo(
    item: RelatorioCalendarioTarefaItemDTO,
    filtroInicio?: Date,
    filtroFim?: Date,
  ): boolean {
    if (!filtroInicio && !filtroFim) {
      return true;
    }

    const inicio = this.parseDateOnly(item.dataInicio, 'dataInicio')!;
    const fim = this.parseDateOnly(item.dataFim, 'dataFim')!;

    if (filtroInicio && fim < filtroInicio) {
      return false;
    }

    if (filtroFim && inicio > filtroFim) {
      return false;
    }

    return true;
  }

  private calcularDiasInclusivos(inicio: Date, fim: Date): number {
    const msPorDia = 1000 * 60 * 60 * 24;
    const inicioLocal = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
    const fimLocal = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate());

    return Math.floor((fimLocal.getTime() - inicioLocal.getTime()) / msPorDia) + 1;
  }

  private parseDateOnly(value: string | undefined, campo: string): Date | undefined {
    if (!value) {
      return undefined;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
      throw new Error(`Data inválida para ${campo}. Use o formato YYYY-MM-DD`);
    }

    const [, ano, mes, dia] = match;
    const data = new Date(Number(ano), Number(mes) - 1, Number(dia));

    if (
      data.getFullYear() !== Number(ano) ||
      data.getMonth() !== Number(mes) - 1 ||
      data.getDate() !== Number(dia)
    ) {
      throw new Error(`Data inválida para ${campo}. Use uma data real no formato YYYY-MM-DD`);
    }

    return data;
  }

  private formatDateOnly(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }
}
