import {TarefaStatusTransition} from './TarefaStatusTransition';
import {StatusTarefa} from '../../value-objects/StatusTarefa';
import {Tarefa} from '../../entities/Tarefa';

export class IniciarTarefaTransition implements TarefaStatusTransition{
  readonly status = StatusTarefa.EM_ANDAMENTO;

  aplicar(tarefa: Tarefa, usuario: string, force: boolean = false) {
    tarefa.iniciar(usuario, force);
  }
}
