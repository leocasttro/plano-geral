import {StatusTarefa} from '../../value-objects/StatusTarefa';
import {Tarefa} from '../../entities/Tarefa';

export interface TarefaStatusTransition {
  readonly status: StatusTarefa;
  aplicar(tarefa: Tarefa, usuario: string): void
}
