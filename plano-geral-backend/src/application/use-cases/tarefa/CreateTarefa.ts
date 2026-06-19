import { Tarefa } from "../../../domain/entities/Tarefa";
import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import {ProjetoRepository} from '../../../domain/repositories/ProjetoRepository';

export class CreateTarefa {
  constructor(private readonly repo: TarefaRepository, private readonly projetoRepo: ProjetoRepository) {}

  async execute(input: { titulo: string; descricao?: string; projetoId: string; usuario: string; usuarioNome: string }) {

    const projeto = await this.projetoRepo.findById(input.projetoId);

    if (!projeto) {
      throw new Error("Projeto não encontrado")
    }

    const tarefa = new Tarefa(
      crypto.randomUUID(),
      input.titulo,
      input.descricao,
      input.projetoId
    );

    tarefa.definirProjeto({
      id: projeto.id,
      nome: projeto.nome,
    });

    tarefa.registrarCriacao(input.usuario, input.usuarioNome);

    await this.repo.save(tarefa);

    return tarefa;
  }
}
