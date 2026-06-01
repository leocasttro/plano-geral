import { Tarefa } from "../../../domain/entities/Tarefa";
import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import {UserRepository} from '../../../domain/repositories/UserRepository';
import {TarefaDTO, TarefaDTOProps} from '../../dtos/TarefaDTO';

type ResponsavelDTO = {
  id: string;
  nome: string;
  email: string;
}

export class GetAllTarefas {
  constructor(
    private tarefaRepository: TarefaRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(): Promise<TarefaDTOProps[]> {
    const tarefas = await this.tarefaRepository.list();

    const responsaveisIds = Array.from(
      new Set(
        tarefas
          .map((tarefa) => tarefa.obterResponsavel())
          .filter((id): id is string => !!id),
      ),
    );

    const usuarios = await this.userRepository.findAllActive();

    const usuariosMap = new Map<string, ResponsavelDTO>();

    usuarios
      .filter((usuario) => responsaveisIds.includes(usuario.id))
      .forEach((usuario) => {
        usuariosMap.set(usuario.id, {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
        });
      });

    return tarefas.map((tarefa) => {
      const responsavelId = tarefa.obterResponsavel();
      const responsavel = responsavelId
        ? usuariosMap.get(responsavelId) ?? null
        : null;

      return TarefaDTO.fromDomain(tarefa, responsavel);
    });
  }
}
