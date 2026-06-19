import {TarefaRepository} from '../../../domain/repositories/TarefaRepository';

type PeriodoResponsavel = {
  responsavel: string;
  inicio: Date;
  fim: Date;
  duracaoHoras: number;
};

export class GetTempoTarefaPorResponsavel {
  constructor(private tarefaRepository: TarefaRepository) {}

  async execute(tarefaId: string): Promise<PeriodoResponsavel[]> {
    const tarefa = await this.tarefaRepository.findById(tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    const atividades = tarefa
      .obterAtividades()
      .sort((a, b) => a.data.getTime() - b.data.getTime());

    const atribuicoes = atividades.filter(
      (a) => a.tipo === 'ATRIBUICAO_RESPONSAVEL',
    );

    const conclusao = atividades.find(
      (a) =>
        a.tipo === 'ALTERACAO_STATUS' &&
        a.descricao.toLowerCase().includes('conclu'),
    );

    return atribuicoes.map((atividade, index) => {
      const proximaAtribuicao = atribuicoes[index + 1];

      const inicio = atividade.data;
      const fim = proximaAtribuicao?.data ?? conclusao?.data ?? new Date();

      const duracaoHoras =
        (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60);

      const valor = atividade.descricao.replace('Responsável atribuído: ', '');
      const [responsavelId, nomeResponsavel] = valor.split('|');

      return {
        responsavel: responsavelId,
        responsavelNome: nomeResponsavel,
        inicio,
        fim,
        duracaoHoras: Number(duracaoHoras.toFixed(2)),
      };
    });
  }
}
