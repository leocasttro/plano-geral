import { randomUUID } from 'crypto';
import { Prioridade } from '../value-objects/Prioridade';
import { StatusTarefa } from '../value-objects/StatusTarefa';
import { TipoAtividade } from '../value-objects/TipoAtividade';
import { Atividade } from './Atividade';
import { CheckListItem } from './ChecklistItem';

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

    // estado inicial obrigatório
    this.status = StatusTarefa.PENDENTE;
    this.prioridade = Prioridade.BAIXA;
  }

  // ======================
  // STATUS
  // ======================

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

  // ======================
  // PRIORIDADE
  // ======================

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

  // ======================
  // RESPONSÁVEL
  // ======================

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

  // ======================
  // CHECKLIST
  // ======================

  adicionarChecklist(item: CheckListItem) {
    this.checklist.push(item);
  }

  private existeChecklistPendente(): boolean {
    return this.checklist.some(item => !item.isConcluido());
  }

  // ======================
  // ATIVIDADES (HISTÓRICO)
  // ======================

  private registrarAtividade(atividade: Atividade) {
    this.atividades.push(atividade);
  }

  // ======================
  // GETTERS SEGUROS
  // ======================

  obterStatus(): StatusTarefa {
    return this.status;
  }

  obterChecklist(): CheckListItem[] {
    return [...this.checklist];
  }

  obterAtividades(): Atividade[] {
    return [...this.atividades];
  }
}
