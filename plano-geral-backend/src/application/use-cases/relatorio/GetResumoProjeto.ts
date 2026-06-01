import {Prioridade} from '../../../domain/value-objects/Prioridade';
import {ProjetoRepository} from '../../../domain/repositories/ProjetoRepository';
import {TarefaComPrazo} from '../../../domain/entities/TarefaComPrazo';
import {StatusTarefa} from '../../../domain/value-objects/StatusTarefa';
import {RelatorioProjetoResumoDTO, ResponsavelResumoProjetoDTO} from '../../dtos/RelatorioProjetoResumoDTO';

export class GetResumoProjeto {
  constructor(private projetoRepository: ProjetoRepository) {
  }

  async execute(projetoId: string): Promise<RelatorioProjetoResumoDTO> {
    const projeto = await this.projetoRepository.findById(projetoId);

    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    const tarefas = projeto.obterTarefas();

    const tarefasPendentes = tarefas.filter(
      (tarefa) => tarefa.obterStatus() === 'PENDENTE'
    ).length;

    const tarefasEmAndamento = tarefas.filter(
      (tarefa) => tarefa.obterStatus() === 'EM_ANDAMENTO'
    ).length;

    const tarefasConcluidas = tarefas.filter(
      (tarefa) => tarefa.obterStatus() === 'CONCLUIDA'
    ).length;

    const tarefasAtrasadas = tarefas.filter(
      (tarefa) => {
        if (!(tarefa instanceof TarefaComPrazo)) return false;
        if (tarefa.obterStatus() === 'CONCLUIDA') return false;

        return tarefa.estaAtrasada();
      }
    ).length;

    const porPrioridade: Record<Prioridade, number> = {
      BAIXA: 0,
      MEDIA: 0,
      ALTA: 0,
      CRITICA: 0,
    };

    tarefas.forEach((tarefa) => {
      porPrioridade[tarefa.obterPrioridade()] += 1;
    });

    const responsaveisMap = new Map<string, ResponsavelResumoProjetoDTO>();

    tarefas.forEach((tarefa) => {
      const responsavel = tarefa.obterResponsavel();

      if (!responsavel) return;

      if (!responsaveisMap.has(responsavel)) {
        responsaveisMap.set(responsavel, {
          usuario: responsavel,
          totalTarefas: 0,
          pendentes: 0,
          emAndamento: 0,
          concluidas: 0,
          atrasadas: 0,
        });
      }

      const resumo = responsaveisMap.get(responsavel)!;
      resumo.totalTarefas += 1;

      if (tarefa.obterStatus() === StatusTarefa.PENDENTE) {
        resumo.pendentes += 1;
      }

      if (tarefa.obterStatus() === StatusTarefa.EM_ANDAMENTO) {
        resumo.emAndamento += 1;
      }

      if (tarefa.obterStatus() === StatusTarefa.CONCLUIDA) {
        resumo.concluidas += 1;
      }

      if (
        tarefa instanceof TarefaComPrazo &&
        tarefa.obterStatus() !== StatusTarefa.CONCLUIDA &&
        tarefa.estaAtrasada()
      ) {
        resumo.atrasadas += 1;
      }
    });

    return {
      projetoId: projeto.id,
      nome: projeto.nome,
      descricao: projeto.descricao,
      status: projeto.obterStatus(),
      progresso: projeto.calcularProgresso(),
      totalTarefas: tarefas.length,
      tarefasPendentes,
      tarefasEmAndamento,
      tarefasConcluidas,
      tarefasAtrasadas,
      porPrioridade,
      responsaveis: Array.from(responsaveisMap.values()),
    };
  }
}
