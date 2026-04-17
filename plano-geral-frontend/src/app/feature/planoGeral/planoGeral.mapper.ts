import { TarefaDTO } from '../../domain/tarefa/tarefa.model';
import { CardData } from '../../shared/components/card-component/card-component';
import { splitDateTime } from '../../util/DateUtil';

export function tarefaDtoToCardData(t: TarefaDTO): CardData {
  const dt = splitDateTime(t.atividades?.[0]?.data);

  // ✅ Função para converter para string de forma segura
  const formatDateToString = (date: Date | string | null | undefined): string | undefined => {
    if (!date) return undefined;

    // Se já for string, retorna ela mesma (assumindo que está no formato correto)
    if (typeof date === 'string') {
      // Se a string já estiver no formato YYYY-MM-DD, retorna ela
      if (date.match(/^\d{4}-\d{2}-\d{2}/)) {
        return date;
      }
      // Se for ISO string, converte para YYYY-MM-DD
      return date.split('T')[0];
    }

    // Se for Date, converte para YYYY-MM-DD
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }

    return undefined;
  };

  return {
    id: t.id,
    titulo: t.titulo,
    descricao: t.descricao ?? '',
    status: (t.status ?? 'PENDENTE').toLowerCase(),
    responsavel: t.responsavel,
    badgeTexto: t.prioridade,
    badgeClasseCor: mapPrioridadeParaBadge(t.prioridade),
    urlImagem: 'https://placehold.co/24x24/999/FFF?text=?',
    dataCriacao: new Date(t.atividades?.[0]?.data ?? Date.now()),
    dataInicio: formatDateToString(t.dataInicio),
    dataFim: formatDateToString(t.dataFim),
    checklist: (t.checklist ?? []).map((item) => ({
      id: item.id,
      nome: item.nome,
      concluido: item.concluido,
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
