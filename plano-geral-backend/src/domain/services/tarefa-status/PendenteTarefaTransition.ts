import {TarefaStatusTransition} from './TarefaStatusTransition';
import {StatusTarefa} from '../../value-objects/StatusTarefa';
import {Tarefa} from '../../entities/Tarefa';

export class PendenteTarefaTransition implements TarefaStatusTransition {
  readonly status = StatusTarefa.PENDENTE;
  aplicar(tarefa: Tarefa, usuario: string, force: boolean = false) {
    if (!force) throw new Error('Só gestores podem retroceder o status para Pendente');
    tarefa.retrocederParaPendente(usuario);
  }
}
