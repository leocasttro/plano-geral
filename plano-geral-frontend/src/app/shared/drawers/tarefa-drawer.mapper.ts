import { TarefaDTO } from '../../domain/tarefa/tarefa.model';
import { CardData } from '../components/card-component/card-component';

export interface AtividadeDrawer {
  id: string;
  tipo: 'acao' | 'comentario';
  usuario: string;
  data: Date;
  acao?: string;
  comentario?: string;
}

export type CardDataDrawer = CardData & {
  checklist: { nome: string; status: 'Concluído' | 'Pendente' }[];
  atividades: AtividadeDrawer[];
  tags?: string[];
  dataCriacao: Date;
  status: string;
};

export function tarefaDtoToDrawer(dto: TarefaDTO): CardDataDrawer {
  return {
    id: dto.id,
    titulo: dto.titulo,
    descricao: dto.descricao ?? '',

    badgeTexto: dto.prioridade,
    badgeClasseCor: prioridadeToBadge(dto.prioridade),
    urlImagem: 'https://placehold.co/32x32',

    dataCriacao: dto.atividades?.length
      ? new Date(dto.atividades[0].data)
      : new Date(),

    status: dto.status,

    checklist: (dto.checklist ?? []).map(item => ({
      nome: item.nome,
      status: item.concluido ? 'Concluído' : 'Pendente',
    })),

    atividades: (dto.atividades ?? []).map(a => {
      const tipo = String(a.tipo).toUpperCase();

      return {
        id: a.id,
        tipo: tipo === 'COMENTARIO' ? 'comentario' : 'acao',
        usuario: a.usuario,
        data: new Date(a.data),
        comentario: tipo === 'COMENTARIO' ? a.descricao : undefined,
        acao: tipo !== 'COMENTARIO' ? a.descricao : undefined,
      };
    }),
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
