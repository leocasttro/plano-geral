import {TarefaRepository} from '../../../domain/repositories/TarefaRepository';
import { BusinessHoursService } from '../../services/BusinessHoursService';

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

    const inicioExecucao = atividades.find(
      (a) =>
        a.tipo === 'ALTERACAO_STATUS' &&
        a.descricao.toLowerCase().includes('inici'),
    );

    const conclusao = atividades.find(
      (a) =>
        a.tipo === 'ALTERACAO_STATUS' &&
        a.descricao.toLowerCase().includes('conclu'),
    );

    if (!inicioExecucao) {
      return [];
    }

    return atribuicoes.map((atividade, index) => {
      const proximaAtribuicao = atribuicoes[index + 1];

      const inicio = this.maiorData(atividade.data, inicioExecucao.data);
      const fim = this.menorData(
        proximaAtribuicao?.data,
        conclusao?.data,
        new Date(),
      );

      const duracaoHoras = BusinessHoursService.calcularHoras(inicio, fim);

      const valor = atividade.descricao.replace('Responsável atribuído: ', '');
      const [responsavelId, nomeResponsavel] = valor.split('|');

      return {
        responsavel: responsavelId,
        responsavelNome: nomeResponsavel,
        inicio,
        fim,
        duracaoHoras,
      };
    });
  }

  private maiorData(a: Date, b: Date): Date {
    return a > b ? a : b;
  }

  private menorData(...datas: Array<Date | undefined>): Date {
    return datas
      .filter((data): data is Date => !!data)
      .sort((a, b) => a.getTime() - b.getTime())[0];
  }
}
