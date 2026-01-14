import { TarefaDTO } from '../../domain/tarefa/tarefa.model';
import { CardData } from '../../shared/components/card-component/card-component';
import { splitDateTime } from '../../util/DateUtil';

export function tarefaDtoToCardData(t: TarefaDTO): CardData {
  const dt = splitDateTime(t.atividades?.[0]?.data);

  return {
    id: t.id,
    titulo: t.titulo,
    descricao: t.descricao ?? '',
    status: t.status.toLowerCase(),

    // UI-specific (temporário)
    badgeTexto: t.prioridade,
    badgeClasseCor: mapPrioridadeParaBadge(t.prioridade),
    urlImagem: 'https://placehold.co/24x24/999/FFF?text=?',

    dataCriacao: new Date(t.atividades?.[0]?.data ?? Date.now()),

    checklist: t.checklist.map((item) => ({
      nome: item.nome,
      status: item.concluido ? 'Concluído' : 'Pendente',
    })),
  };
}

function mapPrioridadeParaBadge(prioridade: string): string {
  switch (prioridade) {
    case 'CRITICA':
      return 'bg-danger';
    case 'ALTA':
      return 'bg-warning';
    case 'NORMAL':
      return 'bg-primary';
    default:
      return 'bg-secondary';
  }
}
