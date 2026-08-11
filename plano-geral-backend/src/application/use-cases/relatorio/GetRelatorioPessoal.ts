import { Tarefa } from '../../../domain/entities/Tarefa';
import { TarefaComPrazo } from '../../../domain/entities/TarefaComPrazo';
import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';
import { StatusTarefa } from '../../../domain/value-objects/StatusTarefa';

type TarefaPessoalDTO = {
  id: string;
  titulo: string;
  status: StatusTarefa;
  prioridade: string;
  projetoNome: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  atrasada: boolean;
};

export type RelatorioPessoalDTO = {
  usuarioId: string;
  resumo: {
    totalTarefas: number;
    pendentes: number;
    emAndamento: number;
    concluidas: number;
    atrasadas: number;
    percentualConclusao: number;
  };
  tarefas: TarefaPessoalDTO[];
};

export class GetRelatorioPessoal {
  constructor(private tarefaRepository: TarefaRepository) {}

  async execute(input: { usuarioId: string }): Promise<RelatorioPessoalDTO> {
    const tarefas = (await this.tarefaRepository.list())
      .filter((tarefa) => tarefa.obterResponsavel() === input.usuarioId)
      .sort((a, b) => this.ordenarTarefas(a, b));

    const totalTarefas = tarefas.length;
    const concluidas = tarefas.filter(
      (tarefa) => tarefa.obterStatus() === StatusTarefa.CONCLUIDA,
    ).length;
    const pendentes = tarefas.filter(
      (tarefa) => tarefa.obterStatus() === StatusTarefa.PENDENTE,
    ).length;
    const emAndamento = tarefas.filter(
      (tarefa) => tarefa.obterStatus() === StatusTarefa.EM_ANDAMENTO,
    ).length;
    const atrasadas = tarefas.filter((tarefa) => this.estaAtrasada(tarefa)).length;

    return {
      usuarioId: input.usuarioId,
      resumo: {
        totalTarefas,
        pendentes,
        emAndamento,
        concluidas,
        atrasadas,
        percentualConclusao: totalTarefas
          ? Math.round((concluidas / totalTarefas) * 100)
          : 0,
      },
      tarefas: tarefas.map((tarefa) => this.toTarefaDTO(tarefa)),
    };
  }

  private toTarefaDTO(tarefa: Tarefa): TarefaPessoalDTO {
    const periodo = tarefa instanceof TarefaComPrazo
      ? tarefa.getPeriodo()
      : null;

    return {
      id: tarefa.id,
      titulo: tarefa.titulo,
      status: tarefa.obterStatus(),
      prioridade: tarefa.obterPrioridade(),
      projetoNome: tarefa.obterProjeto()?.nome ?? null,
      dataInicio: this.formatDateOnly(periodo?.getInicioOptional() ?? null),
      dataFim: this.formatDateOnly(periodo?.getFimOptional() ?? null),
      atrasada: this.estaAtrasada(tarefa),
    };
  }

  private ordenarTarefas(a: Tarefa, b: Tarefa): number {
    const dataA = a instanceof TarefaComPrazo
      ? a.getPeriodo().getFimOptional()?.getTime() ?? Number.MAX_SAFE_INTEGER
      : Number.MAX_SAFE_INTEGER;
    const dataB = b instanceof TarefaComPrazo
      ? b.getPeriodo().getFimOptional()?.getTime() ?? Number.MAX_SAFE_INTEGER
      : Number.MAX_SAFE_INTEGER;

    return dataA - dataB;
  }

  private estaAtrasada(tarefa: Tarefa): boolean {
    return tarefa instanceof TarefaComPrazo && tarefa.estaAtrasada();
  }

  private formatDateOnly(data: Date | null): string | null {
    if (!data) return null;

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }
}
