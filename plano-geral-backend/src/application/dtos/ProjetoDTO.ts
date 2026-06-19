import { Projeto } from "../../domain/entities/Projeto";
import { TarefaDTO } from "./TarefaDTO";

export interface ProjetoDTOProps {
  id: string;
  nome: string;
  descricao?: string;
  status: string;
  progresso: number;
  centroCusto?: string | null;
  coordenadorId?: string | null;
  totalTarefas: number;
  tarefasConcluidas: number;
  tarefas?: TarefaDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export class ProjetoDTO {
  static fromDomain(projeto: Projeto): ProjetoDTOProps {
    const tarefas = projeto.obterTarefas();
    const totalTarefas = tarefas.length;
    const tarefasConcluidas = tarefas.filter(
      t => t.obterStatus() === 'CONCLUIDA'
    ).length;

    return {
      id: projeto.id,
      nome: projeto.nome,
      descricao: projeto.descricao,
      status: projeto.obterStatus(),
      progresso: projeto.calcularProgresso(),
      centroCusto: projeto.obterCentroCusto(),
      coordenadorId: projeto.obterCoordenadorId(),
      totalTarefas,
      tarefasConcluidas,
      tarefas: tarefas.map(t => TarefaDTO.fromDomain(t)),
      createdAt: projeto.obterCreatedAt(),
      updatedAt: projeto.obterUpdatedAt()
    }
  }
}
