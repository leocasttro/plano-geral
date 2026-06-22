import {TarefaStatusTransition} from './TarefaStatusTransition';
import {StatusTarefa} from '../../value-objects/StatusTarefa';
import {Tarefa} from '../../entities/Tarefa';

export class ConcluirTarefaTransition implements TarefaStatusTransition {
  readonly status = StatusTarefa.CONCLUIDA;

  aplicar(tarefa: Tarefa, usuario: string) {
    tarefa.concluir(usuario);
  }
}
