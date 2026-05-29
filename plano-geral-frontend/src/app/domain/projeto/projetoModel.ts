import {TarefaDTO} from '../tarefa/tarefa.model';

export interface ProjetoDTO {
  id: string;
  nome: string;
  descricao?: string;
  status: string;
  progresso: number;
  totalTarefas: number;
  tarefasConcluidas: number;
  tarefas?: TarefaDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CriarProjetoRequest {
  nome: string;
  descricao?: string;
}
