import {ProjetoRepository} from '../../../domain/repositories/ProjetoRepository';
import {TarefaRepository} from '../../../domain/repositories/TarefaRepository';
import {UserRepository} from '../../../domain/repositories/UserRepository';
import {TarefaComPrazo} from '../../../domain/entities/TarefaComPrazo';
import {StatusTarefa} from '../../../domain/value-objects/StatusTarefa';
import {TipoAtividade} from '../../../domain/value-objects/TipoAtividade';
import {StatusProjeto} from '../../../domain/value-objects/StatusProjeto';
import {RelatorioDashboardDTO} from '../../dtos/RelatorioDashboardDTO';

export class GetDashboardRelatorio {
  constructor(
    private projetoRepository: ProjetoRepository,
    private tarefaRepository: TarefaRepository,
    private userRepository: UserRepository
  ) {}

  async execute(): Promise<RelatorioDashboardDTO> {
    const [projetos, tarefas, usuarios, usuariosAtivos] = await Promise.all([
      this.projetoRepository.findAll(),
      this.tarefaRepository.list(),
      this.userRepository.findAll(),
      this.userRepository.findAllActive()
    ]);

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 15);

    const tarefasAtrasadas = tarefas.filter((tarefa) => {
      if (!(tarefa instanceof TarefaComPrazo)) return false;
      if (tarefa.obterStatus() === StatusTarefa.CONCLUIDA) return false;

      return tarefa.estaAtrasada();
    }).length;

    const tarefasCriadasUltimos15Dias = tarefas.filter((tarefa) =>
      tarefa.obterAtividades().some((atividade) => {
        return (
          atividade.tipo === TipoAtividade.CRIACAO && atividade.data >= dataLimite
        );
      }),
    ).length;

    const tarefasConcluidasUltimos15Dias = tarefas.filter((tarefa) =>
      tarefa.obterAtividades().some((atividade) => {
        return (
          atividade.tipo === TipoAtividade.ALTERACAO_STATUS &&
          atividade.descricao.toLowerCase().includes('conclu') &&
          atividade.data >= dataLimite
        );
      }),
    ).length;

    return {
      projetos: {
        total: projetos.length,
        ativos: projetos.filter(
          (projeto) => projeto.obterStatus() === StatusProjeto.ATIVO,
        ).length,
        pausados: projetos.filter(
          (projeto) => projeto.obterStatus() === StatusProjeto.PAUSADO,
        ).length,
        concluidos: projetos.filter(
          (projeto) => projeto.obterStatus() === StatusProjeto.CONCLUIDO,
        ).length,
        cancelados: projetos.filter(
          (projeto) => projeto.obterStatus() === StatusProjeto.CANCELADO,
        ).length,
      },
      tarefas: {
        total: tarefas.length,
        pendentes: tarefas.filter(
          (tarefa) => tarefa.obterStatus() === StatusTarefa.PENDENTE,
        ).length,
        emAndamento: tarefas.filter(
          (tarefa) => tarefa.obterStatus() === StatusTarefa.EM_ANDAMENTO,
        ).length,
        concluidas: tarefas.filter(
          (tarefa) => tarefa.obterStatus() === StatusTarefa.CONCLUIDA,
        ).length,
        atrasadas: tarefasAtrasadas,
      },
      usuarios: {
        total: usuarios.length,
        ativos: usuariosAtivos.length,
      },
      produtividade: {
        tarefasCriadasUltimos15Dias,
        tarefasConcluidasUltimos15Dias,
      },
    };
  }
}
