import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';
import { Tarefa } from '../../../domain/entities/Tarefa';
import { TarefaComPrazo } from '../../../domain/entities/TarefaComPrazo';

type TarefaTituloDetalheDTO = {
  tarefaId: string;
  status: string;
  prioridade: string;
  projetoNome: string | null;
  criadaEm: Date | null;
  concluidaEm: Date | null;
  duracaoHoras: number | null;
  dataInicio: Date | null;
  dataFim: Date | null;
};

type RelatorioTempoMedioPorTituloItemDTO = {
  titulo: string;
  totalTarefas: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  tarefasComTempoCalculado: number;
  tempoMedioHoras: number | null;
  percentualConclusao: number;
  tarefas: TarefaTituloDetalheDTO[];
};

export type RelatorioTempoMedioPorTituloDTO = {
  totalTitulos: number;
  titulos: RelatorioTempoMedioPorTituloItemDTO[];
};

export class GetTempoMedioPorTitulo {
  constructor(private tarefaRepository: TarefaRepository) {}

  async execute(): Promise<RelatorioTempoMedioPorTituloDTO> {
    const tarefas = await this.tarefaRepository.list();
    const grupos = new Map<string, typeof tarefas>();

    tarefas.forEach((tarefa) => {
      const titulo = tarefa.titulo.trim();

      if (!titulo) {
        return;
      }

      const lista = grupos.get(titulo) ?? [];
      lista.push(tarefa);
      grupos.set(titulo, lista);
    });

    const titulos = Array.from(grupos.entries()).map(([titulo, tarefasTitulo]) => {
      const totalTarefas = tarefasTitulo.length;
      const pendentes = tarefasTitulo.filter(
        (tarefa) => tarefa.obterStatus() === 'PENDENTE',
      ).length;
      const emAndamento = tarefasTitulo.filter(
        (tarefa) => tarefa.obterStatus() === 'EM_ANDAMENTO',
      ).length;
      const concluidas = tarefasTitulo.filter(
        (tarefa) => tarefa.obterStatus() === 'CONCLUIDA',
      ).length;

      const tarefasDetalhe = tarefasTitulo.map((tarefa) =>
        this.toTarefaDetalhe(tarefa),
      );

      const temposConclusao = tarefasDetalhe
        .map((tarefa) => tarefa.duracaoHoras)
        .filter((tempo): tempo is number => tempo !== null);

      const tempoMedioHoras = temposConclusao.length
        ? Number(
            (
              temposConclusao.reduce((total, tempo) => total + tempo, 0) /
              temposConclusao.length
            ).toFixed(2),
          )
        : null;

      return {
        titulo,
        totalTarefas,
        pendentes,
        emAndamento,
        concluidas,
        tarefasComTempoCalculado: temposConclusao.length,
        tempoMedioHoras,
        percentualConclusao: totalTarefas
          ? Math.round((concluidas / totalTarefas) * 100)
          : 0,
        tarefas: tarefasDetalhe.sort((a, b) =>
          (b.criadaEm?.getTime() ?? 0) - (a.criadaEm?.getTime() ?? 0),
        ),
      };
    });

    return {
      totalTitulos: titulos.length,
      titulos: titulos.sort(
        (a, b) =>
          b.totalTarefas - a.totalTarefas ||
          a.titulo.localeCompare(b.titulo),
      ),
    };
  }

  private toTarefaDetalhe(tarefa: Tarefa): TarefaTituloDetalheDTO {
    const atividades = tarefa
      .obterAtividades()
      .sort((a, b) => a.data.getTime() - b.data.getTime());

    const criacao = atividades.find((a) => a.tipo === 'CRIACAO');
    const conclusao = atividades.find(
      (a) =>
        a.tipo === 'ALTERACAO_STATUS' &&
        a.descricao.toLowerCase().includes('conclu'),
    );

    const criadaEm = criacao?.data ?? null;
    const concluidaEm = conclusao?.data ?? null;
    const duracaoHoras =
      criadaEm && concluidaEm
        ? Number(((concluidaEm.getTime() - criadaEm.getTime()) / 36e5).toFixed(2))
        : null;

    let dataInicio: Date | null = null;
    let dataFim: Date | null = null;

    if (tarefa instanceof TarefaComPrazo) {
      dataInicio = tarefa.getPeriodo().getInicio();
      dataFim = tarefa.getPeriodo().getFim();
    }

    return {
      tarefaId: tarefa.id,
      status: tarefa.obterStatus(),
      prioridade: tarefa.obterPrioridade(),
      projetoNome: tarefa.obterProjeto()?.nome ?? null,
      criadaEm,
      concluidaEm,
      duracaoHoras,
      dataInicio,
      dataFim,
    };
  }
}
