import e from "cors";
import { StatusProjeto } from "../value-objects/StatusProjeto";
import { Tarefa } from "./Tarefa";

export interface ProjetoProps {
  id: string;
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
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    public readonly id: string,
    public nome: string,
    public descricao?: string
  ) {
    if (!nome || nome.trim().length === 0) {
      throw new Error('Projeto precisa de um nome válido');
    }

    this.status = StatusProjeto.ATIVO;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static reconstituir(props: ProjetoProps): Projeto {
    const projeto = new Projeto(props.id, props.nome, props.descricao);

    projeto.status = props.status;
    projeto.tarefas = props.tarefas ?? [];
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
