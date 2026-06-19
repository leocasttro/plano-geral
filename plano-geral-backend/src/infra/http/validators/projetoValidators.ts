import {StatusProjeto} from '../../../domain/value-objects/StatusProjeto';

export function isStatusProjeto(valor: any): valor is StatusProjeto {
  return (
    valor === 'ATIVO' ||
    valor === 'PAUSADO' ||
    valor === 'CONCLUIDO' ||
    valor === 'CANCELADO'
  );
}
