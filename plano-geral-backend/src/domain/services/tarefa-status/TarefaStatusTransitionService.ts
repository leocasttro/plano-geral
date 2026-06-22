import {TarefaStatusTransition} from './TarefaStatusTransition';
import {IniciarTarefaTransition} from './IniciarTarefaTransition';
import {ConcluirTarefaTransition} from './ConcluirTarefaTransition';
import {Tarefa} from '../../entities/Tarefa';
import {StatusTarefa} from '../../value-objects/StatusTarefa';

export class TarefaStatusTransitionService {
  constructor(private readonly transitions: TarefaStatusTransition[] = [
    new IniciarTarefaTransition(),
    new ConcluirTarefaTransition(),
  ],
    ) {}

  alterarStatus(tarefa: Tarefa, novoStatus: StatusTarefa, usuario: string): void {
    if (tarefa.obterStatus() === novoStatus) return;

    const transition = this.transitions.find((item) =>
      item.status === novoStatus);

    if (!transition) {
      throw new Error('Transição de status não permitida');
    }

    transition.aplicar(tarefa, usuario);
  }
}
