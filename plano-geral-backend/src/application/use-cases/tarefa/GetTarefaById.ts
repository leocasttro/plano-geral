import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import {UserRepository} from '../../../domain/repositories/UserRepository';
import {TarefaDTO, TarefaDTOProps} from '../../dtos/TarefaDTO';

export class GetTarefaById {
  constructor(
    private tarefaRepository: TarefaRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<TarefaDTOProps> {
    const tarefa = await this.tarefaRepository.findById(id);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    const responsavelId = tarefa.obterResponsavel();

    let responsavel = null;

    if (responsavelId) {
      const usuario = await this.userRepository.findById(responsavelId);

      responsavel = usuario
        ? {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
        }
        : null;
    }

    return TarefaDTO.fromDomain(tarefa, responsavel);
  }
}
