import { TarefaDTO } from '../../domain/tarefa/tarefa.model';
import { CardData } from '../components/card-component/card-component';

export interface ChecklistItemDrawer {
  id: string;
  nome: string;
  concluido: boolean;
}

export interface AtividadeDrawer {
  id: string;
  tipo: 'acao' | 'comentario';
  usuario: string;
  data: Date;
  acao?: string;
  comentario?: string;
}

export type CardDataDrawer = CardData & {
  checklist: ChecklistItemDrawer[];
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

    responsavelId: dto.responsavelId ?? null,
    responsavel: dto.responsavel ?? null,
    dataCriacao: dto.atividades?.length
      ? new Date(dto.atividades[0].data)
      : new Date(),

    dataInicio: dto.dataInicio ? formatarDataParaString(dto.dataInicio) : undefined,
    dataFim: dto.dataFim ? formatarDataParaString(dto.dataFim) : undefined,

    status: dto.status,

    projetoId: dto.projetoId ?? null,
    projeto: dto.projeto ?? null,

    checklist: (dto.checklist ?? []).map((item) => {
      return {
        id: item.id,
        nome: item.nome,
        concluido: item.concluido,
      };
    }),

    atividades: (dto.atividades ?? []).map((a) => {
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

function formatarDataParaString(data: string | Date): string {
  if (typeof data === 'string') {
    return data.split('T')[0];
  }

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}
