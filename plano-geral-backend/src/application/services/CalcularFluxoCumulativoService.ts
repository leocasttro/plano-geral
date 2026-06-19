import { Tarefa } from '../../domain/entities/Tarefa';
import { StatusTarefa } from '../../domain/value-objects/StatusTarefa';
import { TipoAtividade } from '../../domain/value-objects/TipoAtividade';

export type FluxoCumulativoDia = {
  data: string;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
};

export class CalcularFluxoCumulativoService {
  execute(tarefas: Tarefa[], dias = 7): FluxoCumulativoDia[] {
    const hoje = new Date();

    return Array.from({ length: dias }).map((_, index) => {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - (dias - 1 - index));

      const fimDoDia = new Date(data);
      fimDoDia.setHours(23, 59, 59, 999);

      const contagem: FluxoCumulativoDia = {
        data: data.toISOString().split('T')[0],
        pendentes: 0,
        emAndamento: 0,
        concluidas: 0,
      };

      tarefas.forEach((tarefa) => {
        const status = this.obterStatusNaData(tarefa, fimDoDia);

        if (status === StatusTarefa.PENDENTE) contagem.pendentes += 1;
        if (status === StatusTarefa.EM_ANDAMENTO) contagem.emAndamento += 1;
        if (status === StatusTarefa.CONCLUIDA) contagem.concluidas += 1;
      });

      return contagem;
    });
  }

  private obterStatusNaData(tarefa: Tarefa, dataReferencia: Date): StatusTarefa | null {
    const atividades = tarefa
      .obterAtividades()
      .filter((atividade) => atividade.data <= dataReferencia)
      .sort((a, b) => a.data.getTime() - b.data.getTime());

    const criada = atividades.some(
      (atividade) => atividade.tipo === TipoAtividade.CRIACAO,
    );

    if (!criada) {
      return null;
    }

    let status: StatusTarefa = StatusTarefa.PENDENTE;

    atividades.forEach((atividade) => {
      if (atividade.tipo !== TipoAtividade.ALTERACAO_STATUS) return;

      const descricao = atividade.descricao.toLowerCase();

      if (descricao.includes('iniciada')) {
        status = StatusTarefa.EM_ANDAMENTO;
      }

      if (descricao.includes('conclu')) {
        status = StatusTarefa.CONCLUIDA;
      }
    });

    return status;
  }
}
