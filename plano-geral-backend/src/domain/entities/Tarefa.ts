import { randomUUID } from 'crypto';
import { Prioridade } from '../value-objects/Prioridade';
import { StatusTarefa } from '../value-objects/StatusTarefa';
import { TipoAtividade } from '../value-objects/TipoAtividade';
import { Atividade } from './Atividade';
import { CheckListItem } from './ChecklistItem';

type TarefaProps = {
  id: string;
  titulo: string;
  descricao?: string;
  status: StatusTarefa;
  prioridade: Prioridade;
  reponsavel?: string;
  checklist?: CheckListItem[];
  atividades?: Atividade[];
}
export class Tarefa {
  private status: StatusTarefa;
  private checklist: CheckListItem[] = [];
  private atividades: Atividade[] = [];
  private responsavel?: string;
  private prioridade: Prioridade;

  constructor(
    public readonly id: string,
    public titulo: string,
    public descricao?: string
  ) {
    if (!titulo || titulo.trim().length === 0) {
      throw new Error('Tarefa precisa de um título válido');
    }

    this.status = StatusTarefa.PENDENTE;
    this.prioridade = Prioridade.BAIXA;
  }

  static reconstituir(props: TarefaProps): Tarefa {
    const tarefa = new Tarefa(props.id, props.titulo, props.descricao);

    tarefa.status = props.status;
    tarefa.prioridade = props.prioridade;
    tarefa.responsavel = props.reponsavel;
    tarefa.checklist = props.checklist ?? [];
    tarefa.atividades = props.atividades ?? [];

    return tarefa;
  }

  iniciar(usuario: string) {
    if (this.status !== StatusTarefa.PENDENTE) {
      throw new Error('Só é possível iniciar uma tarefa PENDENTE');
    }

    this.status = StatusTarefa.EM_ANDAMENTO;

    this.registrarAtividade(
      new Atividade(
        randomUUID(),
        TipoAtividade.ALTERACAO_STATUS,
        usuario,
        'Tarefa iniciada'
      )
    );
  }

  concluir(usuario: string) {
    if (this.status !== StatusTarefa.EM_ANDAMENTO) {
      throw new Error('Só é possível concluir uma tarefa EM ANDAMENTO');
    }

    if (this.existeChecklistPendente()) {
      throw new Error(
        'Não é possível concluir a tarefa com itens pendentes no checklist'
      );
    }

    this.status = StatusTarefa.CONCLUIDA;

    this.registrarAtividade(
      new Atividade(
        randomUUID(),
        TipoAtividade.ALTERACAO_STATUS,
        usuario,
        'Tarefa concluída'
      )
    );
  }

  alterarPrioridade(nova: Prioridade, usuario: string) {
    this.prioridade = nova;

    this.registrarAtividade(
      new Atividade(
        randomUUID(),
        TipoAtividade.ALTERACAO_PRIORIDADE,
        usuario,
        `Prioridade alterada para ${nova}`
      )
    );
  }

  atribuirResponsavel(usuarioAlvo: string, usuarioAcao: string) {
    this.responsavel = usuarioAlvo;

    this.registrarAtividade(
      new Atividade(
        randomUUID(),
        TipoAtividade.ATRIBUICAO_RESPONSAVEL,
        usuarioAcao,
        `Responsável atribuído: ${usuarioAlvo}`
      )
    );
  }

  adicionarChecklist(item: CheckListItem) {
    this.checklist.push(item);
  }

  adicionarComentario(comentario: string, usuario: string) {
    if (!comentario || comentario.trim().length === 0) {
      throw new Error('Comentário não pode ser vazio');
    }

    this.registrarAtividade(
      new Atividade(
        randomUUID(),
        TipoAtividade.COMENTARIO,
        usuario,
        comentario
      )
    );
  }

  private existeChecklistPendente(): boolean {
    return this.checklist.some(item => !item.isConcluido());
  }

  private registrarAtividade(atividade: Atividade) {
    this.atividades.push(atividade);
  }

  obterStatus(): StatusTarefa {
    return this.status;
  }

  obterChecklist(): CheckListItem[] {
    return [...this.checklist];
  }

  obterAtividades(): Atividade[] {
    return [...this.atividades];
  }

  obterPrioridade(): Prioridade {
    return this.prioridade;
  }

  obterResponsavel(): string | undefined {
    return this.responsavel;
  }
}
