import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import {UserRepository} from '../../../domain/repositories/UserRepository';
import {TarefaDTO, TarefaDTOProps} from '../../dtos/TarefaDTO';
import {TarefaAccessPolicy} from '../../../domain/policies/TarefaAccessPolicy';

type ResponsavelDTO = {
  id: string;
  nome: string;
  email: string;
}

export class GetAllTarefas {
  constructor(
    private tarefaRepository: TarefaRepository,
    private userRepository: UserRepository,
    private tarefaAccessPolicy = new TarefaAccessPolicy()
  ) {}

  async execute(input: { usuarioId: string; usuarioNome?: string; perfil: string }): Promise<TarefaDTOProps[]> {
    const todasTarefas = await this.tarefaRepository.list();

    const tarefas = todasTarefas.filter((tarefa) =>
      this.tarefaAccessPolicy.podeVisualizar(tarefa, {
        id: input.usuarioId,
        nome: input.usuarioNome,
        perfil: input.perfil,
      }),
    );

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
