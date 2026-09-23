import { randomUUID } from 'crypto';
import { Prioridade } from '../value-objects/Prioridade';
import { StatusTarefa } from '../value-objects/StatusTarefa';
import { TipoAtividade } from '../value-objects/TipoAtividade';
import { Atividade } from './Atividade';
import { CheckListItem } from './ChecklistItem';
import { Periodo } from '../value-objects/Periodo';

type TarefaProps = {
  id: string;
  titulo: string;
  tituloCatalogoId?: string | null;
  descricao?: string;
  status: StatusTarefa;
  prioridade: Prioridade;
  responsaveis: string[];
  criadorId?: string;
  projetoId: string;
  projeto?: ProjetoResumo | null;
  tituloCatalogo?: TituloCatalogoResumo | null;
  checklist?: CheckListItem[];
  atividades?: Atividade[];
  isMacroTarefa?: boolean;
  tarefaPaiId?: string | null;
};

type ProjetoResumo = {
  id: string;
  nome: string;
  centroCusto?: string | null;
}

type TituloCatalogoResumo = {
  id: string;
  componente: string | null;
  atividadePrincipal: string | null;
  subatividade: string | null;
}

export class Tarefa {
  private tituloCatalogoId?: string | null;
  private status: StatusTarefa;
  private checklist: CheckListItem[] = [];
  private atividades: Atividade[] = [];
  private responsaveis: string[] = [];
  private criadorId?: string;
  private projetoId: string;
  private prioridade: Prioridade;
  private projeto?: ProjetoResumo | null;
  private tituloCatalogo?: TituloCatalogoResumo | null;
  private isMacroTarefa: boolean = false;
  private tarefaPaiId?: string | null;

  constructor(
    public readonly id: string,
    public titulo: string,
    public descricao: string | undefined,
    projetoId: string,
    tituloCatalogoId?: string | null,
  ) {
    if (!titulo || titulo.trim().length === 0) {
      throw new Error('Tarefa precisa de um título válido');
    }

    this.status = StatusTarefa.PENDENTE;
    this.prioridade = Prioridade.BAIXA;
    this.projetoId = projetoId;
    this.tituloCatalogoId = tituloCatalogoId ?? null;
  }

  static reconstituir(props: TarefaProps): Tarefa {
    const tarefa = new Tarefa(props.id, props.titulo, props.descricao, props.projetoId);

    tarefa.status = props.status;
    tarefa.prioridade = props.prioridade;
    tarefa.responsaveis = props.responsaveis ?? [];
    tarefa.criadorId = props.criadorId;
    tarefa.projetoId = props.projetoId;
    tarefa.projeto = props.projeto ?? null;
    tarefa.tituloCatalogo = props.tituloCatalogo ?? null;
    tarefa.checklist = props.checklist ?? [];
    tarefa.atividades = props.atividades ?? [];
    tarefa.tituloCatalogoId = props.tituloCatalogoId ?? null;
    tarefa.isMacroTarefa = props.isMacroTarefa ?? false;
    tarefa.tarefaPaiId = props.tarefaPaiId ?? null;

    return tarefa;
  }


  retrocederParaPendente(usuario: string) {
    this.status = StatusTarefa.PENDENTE;
    this.registrarAtividade(
      new Atividade(
        randomUUID(),
        TipoAtividade.ALTERACAO_STATUS,
        usuario,
        'Status alterado para PENDENTE',
      ),
    );
  }

  iniciar(usuario: string, force: boolean = false) {
    if (!force && this.status !== StatusTarefa.PENDENTE) {
      throw new Error('Só é possível iniciar uma tarefa PENDENTE');
    }

    this.status = StatusTarefa.EM_ANDAMENTO;

    this.registrarAtividade(
      new Atividade(
        randomUUID(),
        TipoAtividade.ALTERACAO_STATUS,
        usuario,
        'Tarefa iniciada',
      ),
    );
  }

  concluir(usuario: string, force: boolean = false) {
    if (!force && this.status !== StatusTarefa.EM_ANDAMENTO) {
      throw new Error('Só é possível concluir uma tarefa EM ANDAMENTO');
    }

    if (this.existeChecklistPendente()) {
      throw new Error(
        'Não é possível concluir a tarefa com itens pendentes no checklist',
      );
    }

    this.status = StatusTarefa.CONCLUIDA;

    this.registrarAtividade(
      new Atividade(
        randomUUID(),
        TipoAtividade.ALTERACAO_STATUS,
        usuario,
        'Tarefa concluída',
      ),
    );
  }

  registrarCriacao(usuarioId: string, usuarioNome: string): void {
    this.criadorId = usuarioId;

    this.registrarAtividade(
      new Atividade(
        randomUUID(),
        TipoAtividade.CRIACAO,
        usuarioNome,
        `Tarefa criada por ${usuarioNome}`,
      ),
    );
  }

  alterarPrioridade(nova: Prioridade, usuario: string) {
    this.prioridade = nova;

    this.registrarAtividade(
      new Atividade(
        randomUUID(),
        TipoAtividade.ALTERACAO_PRIORIDADE,
        usuario,
        `Prioridade alterada para ${nova}`,
      ),
    );
  }

  atribuirResponsaveis(responsaveisIds: string[], usuarioAcao: string, nomesResponsaveis: string[]) {
    if (responsaveisIds.length > 3) {
      throw new Error('A tarefa pode ter no máximo 3 responsáveis');
    }

    this.responsaveis = responsaveisIds;

    this.registrarAtividade(
      new Atividade(
        randomUUID(),
        TipoAtividade.ATRIBUICAO_RESPONSAVEL,
        usuarioAcao,
        `Responsáveis atribuídos: ${nomesResponsaveis.join(', ')}`
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
        comentario,
      ),
    );
  }

  alterarComentario(atividadeId: string, novoComentario: string, usuarioAcao: string) {
    const atividade = this.atividades.find(a => a.id === atividadeId);
    if (!atividade || atividade.tipo !== TipoAtividade.COMENTARIO) {
      throw new Error('Comentário não encontrado');
    }

    if (atividade.usuario !== usuarioAcao) {
      throw new Error('Apenas o autor pode editar o comentário');
    }

    const vinteQuatroHorasEmMs = 24 * 60 * 60 * 1000;
    if (new Date().getTime() - atividade.data.getTime() > vinteQuatroHorasEmMs) {
      throw new Error('O comentário só pode ser editado em até 24h após a criação');
    }

    atividade.alterarDescricao(novoComentario);
  }

  apagarComentario(atividadeId: string, usuarioAcao: string) {
    const index = this.atividades.findIndex(a => a.id === atividadeId);
    if (index === -1 || this.atividades[index].tipo !== TipoAtividade.COMENTARIO) {
      throw new Error('Comentário não encontrado');
    }

    const atividade = this.atividades[index];

    if (atividade.usuario !== usuarioAcao) {
      throw new Error('Apenas o autor pode apagar o comentário');
    }

    const vinteQuatroHorasEmMs = 24 * 60 * 60 * 1000;
    if (new Date().getTime() - atividade.data.getTime() > vinteQuatroHorasEmMs) {
      throw new Error('O comentário só pode ser apagado em até 24h após a criação');
    }

    this.atividades.splice(index, 1);
  }

  private existeChecklistPendente(): boolean {
    return this.checklist.some((item) => !item.isConcluido());
  }

  adicionarCheckListItem(nome: string) {
    const clean = (nome ?? '').trim();

    if (!clean) {
      throw new Error('Check list do item não pode ser vazio');
    }

    if (clean.length > 250) {
      throw new Error('Check list deve ter no máximo 250 caracteres');
    }

    this.checklist.push(new CheckListItem(randomUUID(), clean, false));
  }

  toggleChecklistItem(itemId: string) {
    const item = this.checklist.find((i) => i.id === itemId);
    if (!item) throw new Error('Item do checklist não encontrado');

    item.toggle();
  }

  protected registrarAtividade(atividade: Atividade) {
    this.atividades.push(atividade);
  }

  converterParaPrazo(dataInicio?: Date, dataFim?: Date): import('./TarefaComPrazo').TarefaComPrazo {
    const { TarefaComPrazo } = require('./TarefaComPrazo') as typeof import('./TarefaComPrazo');
    const periodo = new Periodo(dataInicio, dataFim);

    const tarefaComPrazo = new TarefaComPrazo(
      this.id,
      this.titulo,
      this.descricao,
      this.projetoId,
      periodo,
      this.tituloCatalogoId,
    );

    // Copiar os dados
    Object.assign(tarefaComPrazo, {
      status: this.status,
      prioridade: this.prioridade,
      responsaveis: this.responsaveis,
      criadorId: this.criadorId,
      projeto: this.projeto,
      tituloCatalogoId: this.tituloCatalogoId,
      tituloCatalogo: this.tituloCatalogo,
      checklist: [...this.checklist],
      atividades: [...this.atividades],
      isMacroTarefa: this.isMacroTarefa,
      tarefaPaiId: this.tarefaPaiId,
    });

    return tarefaComPrazo;
  }

  obterTituloCatalogoId(): string | null {
    return this.tituloCatalogoId ?? null;
  }

  obterTituloCatalogo(): TituloCatalogoResumo | null {
    return this.tituloCatalogo ?? null;
  }

  obterProjeto(): ProjetoResumo | null {
    return this.projeto ?? null;
  }

  definirProjeto(projeto: ProjetoResumo): void {
    this.projeto = projeto;
  }

  associarAoProjeto(projetoId: string): void {
    this.projetoId = projetoId;
  }

  obterProjetoId(): string {
    return this.projetoId
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

  obterResponsaveis(): string[] {
    return [...this.responsaveis];
  }

  obterCriador(): string | undefined {
    return this.criadorId;
  }

  obterIsMacroTarefa(): boolean { return this.isMacroTarefa; }

  obterTarefaPaiId(): string | null { return this.tarefaPaiId ?? null; }

  transformarEmMacroTarefa(): void { this.isMacroTarefa = true; }

  vincularATarefaPai(paiId: string): void { this.tarefaPaiId = paiId; }
}
