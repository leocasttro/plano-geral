import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import { StatusTarefa } from "../../../domain/value-objects/StatusTarefa";
import {TarefaStatusTransitionService} from '../../../domain/services/tarefa-status/TarefaStatusTransitionService';
import { Tarefa } from "../../../domain/entities/Tarefa";
import { TarefaComPrazo } from "../../../domain/entities/TarefaComPrazo";
import { GestorProjetoNotificacaoService } from "../../services/GestorProjetoNotificacaoService";

type AlterarStatusTarefaDeps = {
  gestorProjetoNotificacaoService?: GestorProjetoNotificacaoService;
  statusTransitionService?: TarefaStatusTransitionService;
};

export class AlterarStatusTarefa {
  private statusTransitionService: TarefaStatusTransitionService;
  private userRepository?: import("../../../domain/repositories/UserRepository").UserRepository;

  constructor(private repo: TarefaRepository, private deps: AlterarStatusTarefaDeps = {}) {
    this.statusTransitionService = deps.statusTransitionService ?? new TarefaStatusTransitionService();
    this.userRepository = (deps as any).userRepository;
  }

  async execute(input: {
    tarefaId: string;
    novoStatus: StatusTarefa;
    usuario: string;
    usuarioId?: string;
    perfil?: string;
  }) {
    const tarefa = await this.repo.findById(input.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    
    let force = false;
    if (input.perfil === 'GESTOR_GEOPROCESSAMENTO' && tarefa.obterTituloCatalogo()?.componente?.toLowerCase() === 'geoprocessamento') {
      force = true;
    }
    
    if (!force) {
        this.validarPreRequisitosParaAndamentoOuConclusao(tarefa, input.novoStatus);
    }


    this.statusTransitionService.alterarStatus(
      tarefa,
      input.novoStatus,
      input.usuario,
      force
    );

    await this.repo.save(tarefa);
    await this.deps.gestorProjetoNotificacaoService?.notificarAndamentoTarefa({
      tarefa,
      novoStatus: input.novoStatus,
      usuarioNome: input.usuario,
      usuarioId: input.usuarioId,
    }).catch((error) => {
      console.error('Falha ao notificar gestor do projeto:', error);
    });

    return tarefa;
  }

  private validarPreRequisitosParaAndamentoOuConclusao(
    tarefa: Tarefa,
    novoStatus: StatusTarefa,
  ): void {
    if (
      novoStatus !== StatusTarefa.EM_ANDAMENTO &&
      novoStatus !== StatusTarefa.CONCLUIDA
    ) {
      return;
    }

    if (tarefa.obterResponsaveis().length === 0) {
      throw new Error('Defina um responsável antes de mover a tarefa');
    }

    if (!(tarefa instanceof TarefaComPrazo)) {
      throw new Error('Defina data de início e fim antes de mover a tarefa');
    }

    const periodo = tarefa.getPeriodo();

    if (!periodo.getInicio() || !periodo.getFim()) {
      throw new Error('Defina data de início e fim antes de mover a tarefa');
    }
  }
}
