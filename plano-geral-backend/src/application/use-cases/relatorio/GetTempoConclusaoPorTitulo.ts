import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';

type ItemTempoConclusao = {
  tarefaId: string;
  titulo: string;
  status: string;
  criadaEm: Date | null;
  concluidaEm: Date | null;
  duracaoHoras: number | null;
  duracaoDias: number | null;
};

export type RelatorioTempoConclusaoPorTituloDTO = {
  titulo: string;
  totalTarefas: number;
  totalConcluidas: number;
  tempoMedioHoras: number | null;
  tempoMedioDias: number | null;
  tarefas: ItemTempoConclusao[];
};

export class GetTempoConclusaoPorTitulo {
  constructor(private tarefaRepository: TarefaRepository) {}

  async execute(titulo: string): Promise<RelatorioTempoConclusaoPorTituloDTO> {
    const tituloFiltro = titulo?.trim().toLowerCase();

    if (!tituloFiltro) {
      throw new Error('Título é obrigatório');
    }

    const tarefas = (await this.tarefaRepository.list())
      .filter((tarefa) => tarefa.titulo.trim().toLowerCase() === tituloFiltro);

    const itens = tarefas.map((tarefa) => {
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

      return {
        tarefaId: tarefa.id,
        titulo: tarefa.titulo,
        status: tarefa.obterStatus(),
        criadaEm,
        concluidaEm,
        duracaoHoras,
        duracaoDias:
          duracaoHoras === null ? null : Number((duracaoHoras / 24).toFixed(2)),
      };
    });

    const concluidas = itens.filter((item) => item.duracaoHoras !== null);
    const tempoMedioHoras = concluidas.length
      ? Number(
        (
          concluidas.reduce((total, item) => total + (item.duracaoHoras ?? 0), 0) /
          concluidas.length
        ).toFixed(2),
      )
      : null;

    return {
      titulo: titulo.trim(),
      totalTarefas: itens.length,
      totalConcluidas: concluidas.length,
      tempoMedioHoras,
      tempoMedioDias:
        tempoMedioHoras === null ? null : Number((tempoMedioHoras / 24).toFixed(2)),
      tarefas: itens,
    };
  }
}
