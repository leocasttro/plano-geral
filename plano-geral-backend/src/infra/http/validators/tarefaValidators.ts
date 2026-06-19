import {Prioridade} from '../../../domain/value-objects/Prioridade';
import {StatusTarefa} from '../../../domain/value-objects/StatusTarefa';

export function isPrioridade(valor: unknown): valor is Prioridade {
  return (
    valor === Prioridade.BAIXA ||
    valor === Prioridade.MEDIA ||
    valor === Prioridade.ALTA ||
    valor === Prioridade.CRITICA
  );
}

export function isStatusTarefa(valor: unknown): valor is StatusTarefa {
  return (
    valor === StatusTarefa.PENDENTE ||
    valor === StatusTarefa.EM_ANDAMENTO ||
    valor === StatusTarefa.CONCLUIDA
  );
}
