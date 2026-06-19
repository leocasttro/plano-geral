import { StatusProjeto } from "../value-objects/StatusProjeto";
import { Tarefa } from "./Tarefa";

export interface ProjetoProps {
  id: string;
  centroCusto?:  string | null;
  coordenadorId?: string | null;
  nome: string;
  descricao?: string;
  status: StatusProjeto;
  tarefas: Tarefa[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Projeto {
  private tarefas: Tarefa[] = [];
  private status: StatusProjeto;
  private centroCusto?: string | null;
  private coordenadorId?: string | null;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    public readonly id: string,
    public nome: string,
    public descricao?: string,
    centroCusto?: string | null,
    coordenadorId?: string | null,
  ) {
    if (!nome || nome.trim().length === 0) {
      throw new Error('Projeto precisa de um nome válido');
    }

    this.status = StatusProjeto.ATIVO;
    this.centroCusto = centroCusto ?? null;
    this.coordenadorId = coordenadorId ?? null;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static reconstituir(props: ProjetoProps): Projeto {
    const projeto = new Projeto(props.id, props.nome, props.descricao);

    projeto.status = props.status;
    projeto.tarefas = props.tarefas ?? [];
    projeto.centroCusto = props.centroCusto ?? null;
    projeto.coordenadorId = props.coordenadorId ?? null;
    projeto.createdAt = props.createdAt ?? new Date();
    projeto.updatedAt = props.updatedAt ?? new Date();

    return projeto
  }

  pausar(usuario: string): void {
    if (this.status === StatusProjeto.CONCLUIDO) {
      throw new Error('Não é possível pausar um projeto concluído');
    }

    this.status = StatusProjeto.PAUSADO;
    this.updatedAt = new Date();
  }

  retomar(usuario: string): void {
    if (this.status !== StatusProjeto.PAUSADO) {
      throw new Error('Apenas projetos pausados podem ser retomados');
    }

    this.status = StatusProjeto.ATIVO;
    this.updatedAt = new Date();
  }

  concluir(usuario: string) {
    if (this.status === StatusProjeto.CONCLUIDO) {
      throw new Error('Projeto já está concluído');
    }

    const tarefasPendentes = this.tarefas.filter(
      t => t.obterStatus() !== 'CONCLUIDA'
    );

    if (tarefasPendentes.length > 0) {
      throw new Error(`Não é possível concluir o projeto ${tarefasPendentes.length} tarefa(s) pendente(s)`);
    }

    this.status = StatusProjeto.CONCLUIDO;
    this.updatedAt = new Date();
  }

  cancelar(usuario: string): void {
    if (this.status === StatusProjeto.CONCLUIDO) {
      throw new Error('Não é possível cancelar um projeto concluído');
    }

    if (this.status === StatusProjeto.CANCELADO) {
      throw new Error('Projeto já está cancelado');
    }

    this.status = StatusProjeto.CANCELADO;
    this.updatedAt = new Date();
  }

  adicionarTarefa(tarefa: Tarefa): void {
    if (this.status === StatusProjeto.CONCLUIDO) {
      throw new Error('Não é possível adicionar tarefas em projetos concluídos');
    }

    this.tarefas.push(tarefa);
    this.updatedAt = new Date();
  }

  removerTarefa(tarefaId: string): void {
    const index = this.tarefas.findIndex(t => t.id === tarefaId);
    if (index === -1) {
      throw new Error('Tarefa não encontrada no projeto');
    }
    this.tarefas.splice(index, 1);
    this.updatedAt = new Date();
  }

  obterStatus(): StatusProjeto {
    return this.status;
  }

  obterTarefas(): Tarefa[] {
    return [...this.tarefas];
  }

  obterCentroCusto(): string | null {
    return this.centroCusto ?? null;
  }

  obterCoordenadorId(): string | null {
    return this.coordenadorId ?? null;
  }

  obterCreatedAt(): Date {
    return this.createdAt;
  }

  obterUpdatedAt(): Date {
    return this.updatedAt;
  }

  calcularProgresso(): number {
    if (this.tarefas.length === 0) return 0;

    const tarefasConcluidas = this.tarefas.filter(
      t => t.obterStatus() === 'CONCLUIDA'
    ).length;

    return (tarefasConcluidas / this.tarefas.length) * 100;
  }
}
