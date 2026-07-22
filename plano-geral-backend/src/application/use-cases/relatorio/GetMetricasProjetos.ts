import {ProjetoRepository} from '../../../domain/repositories/ProjetoRepository';
import {RelatorioMetricasProjetosDTO} from '../../dtos/RelatorioMetricasProjetosDTO';
import {StatusTarefa} from '../../../domain/value-objects/StatusTarefa';
import {TarefaComPrazo} from '../../../domain/entities/TarefaComPrazo';
import {Tarefa} from '../../../domain/entities/Tarefa';
import {TipoAtividade} from '../../../domain/value-objects/TipoAtividade';

export class GetMetricasProjetos {
  constructor(private projetoRepository: ProjetoRepository) {}

  async execute(): Promise<RelatorioMetricasProjetosDTO> {
    const projetos = await this.projetoRepository.findAll();

    return {
      projetos: projetos.map((projeto) => {
        const tarefas = projeto.obterTarefas();
        const totalTarefas = tarefas.length;
        const tarefasEmAndamento = this.contarPorStatus(tarefas, StatusTarefa.EM_ANDAMENTO);
        const tarefasConcluidas = this.contarPorStatus(tarefas, StatusTarefa.CONCLUIDA);

        const tarefasComPrazo = tarefas.filter(
          (tarefa) => tarefa instanceof TarefaComPrazo && !!tarefa.getPeriodo().getFim(),
        ) as TarefaComPrazo[];

        const tarefasForaDoPrazo = tarefasComPrazo.filter((tarefa) =>
          this.estaForaDoPrazo(tarefa),
        ).length;

        const tarefasAtrasadas = tarefasComPrazo.filter(
          (tarefa) =>
            tarefa.obterStatus() !== StatusTarefa.CONCLUIDA && tarefa.estaAtrasada(),
        ).length;

        const tarefasDentroDoPrazo = tarefasComPrazo.length - tarefasForaDoPrazo;

        return {
          projetoId: projeto.id,
          nome: projeto.nome,
          centroCusto: projeto.obterCentroCusto(),
          status: projeto.obterStatus(),
          totalTarefas,
          tarefasEmAndamento,
          tarefasConcluidas,
          tarefasComPrazo: tarefasComPrazo.length,
          tarefasDentroDoPrazo,
          tarefasForaDoPrazo,
          tarefasAtrasadas,
          percentualConclusao: this.percentual(tarefasConcluidas, totalTarefas),
          percentualRespeitoPrazo: this.percentual(tarefasDentroDoPrazo, tarefasComPrazo.length),
          indiceAvanco: this.percentual(tarefasConcluidas + tarefasEmAndamento * 0.5, totalTarefas),
          avancou: tarefasEmAndamento + tarefasConcluidas > 0,
        };
      }),
    };
  }

  private contarPorStatus(tarefas: Tarefa[], status: StatusTarefa): number {
    return tarefas.filter((tarefa) => tarefa.obterStatus() === status).length;
  }

  private estaForaDoPrazo(tarefa: TarefaComPrazo): boolean {
    const dataFim = tarefa.getPeriodo().getFim();

    if (!dataFim) return false;

    if (tarefa.obterStatus() !== StatusTarefa.CONCLUIDA) {
      return tarefa.estaAtrasada();
    }

    const dataConclusao = tarefa
      .obterAtividades()
      .filter(
        (atividade) =>
          atividade.tipo === TipoAtividade.ALTERACAO_STATUS &&
          atividade.descricao.toLowerCase().includes('conclu'),
      )
      .map((atividade) => atividade.data)
      .sort((a, b) => b.getTime() - a.getTime())[0];

    if (!dataConclusao) return false;

    return dataConclusao > dataFim;
  }

  private percentual(parte: number, total: number): number {
    if (total === 0) return 0;

    return Number(((parte / total) * 100).toFixed(2));
  }
}
