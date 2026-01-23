import { TarefaDTO } from '../../domain/tarefa/tarefa.model';
import { CardData } from '../components/card-component/card-component';

export interface AtividadeDrawer {
  tipo: 'acao' | 'comentario';
  usuario: string;
  data: Date;
  acao?: string;
  comentario?: string;
}

export type CardDataDrawer = CardData & {
  atividades: AtividadeDrawer[];
};

export function tarefaDtoToDrawer(dto: TarefaDTO): CardDataDrawer {
  return {
    id: dto.id,
    titulo: dto.titulo,
    descricao: dto.descricao ?? '',

    // UI-only
    badgeTexto: dto.prioridade,
    badgeClasseCor: prioridadeToBadge(dto.prioridade),
    urlImagem: 'https://placehold.co/32x32',

    dataCriacao: new Date(dto.atividades?.[0]?.data ?? Date.now()),
    status: dto.status,

    checklist: dto.checklist.map(item => ({
      nome: item.nome,
      status: item.concluido ? 'Concluído' : 'Pendente',
    })),

    atividades: dto.atividades.map(a => ({
      tipo: a.tipo === 'COMENTARIO' ? 'comentario' : 'acao',
      usuario: a.usuario,
      data: new Date(a.data),
      comentario: a.tipo === 'COMENTARIO' ? a.descricao : undefined,
      acao: a.tipo !== 'COMENTARIO' ? a.descricao : undefined,
    })),
  };
}

function prioridadeToBadge(prioridade: string): string {
  switch (prioridade) {
    case 'CRITICA': return 'bg-danger';
    case 'ALTA': return 'bg-warning';
    case 'NORMAL': return 'bg-primary';
    default: return 'bg-secondary';
  }
}
