import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import {UserRepository} from '../../../domain/repositories/UserRepository';

export class ResponsavelTarefa {
  constructor(private repo: TarefaRepository, private userRepository: UserRepository) {}

  async execute(input: {tarefaId: string; responsavelId: string; usuario: string}) {
    const tarefa = await this.repo.findById(input.tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    const responsavel = await this.userRepository.findById(input.responsavelId);

    if (!responsavel) {
      throw new Error('Usuário responsável não encontrado');
    }

    if (!responsavel.ativo) {
      throw new Error('Usuário responsável está inativo');
    }

    tarefa.atribuirResponsavel(input.responsavelId, input.usuario);

    await this.repo.save(tarefa);
    return tarefa;
  }
}
