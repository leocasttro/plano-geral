import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import {UserRepository} from '../../../domain/repositories/UserRepository';
import {TarefaDTO, TarefaDTOProps} from '../../dtos/TarefaDTO';
import {TarefaAccessPolicy} from '../../../domain/policies/TarefaAccessPolicy';

export class GetTarefaById {
  constructor(
    private tarefaRepository: TarefaRepository,
    private userRepository: UserRepository,
    private tarefaAccessPolicy = new TarefaAccessPolicy()
  ) {}

  async execute(input: { id: string; usuarioId: string; usuarioNome?: string; perfil: string }): Promise<TarefaDTOProps> {
    const tarefa = await this.tarefaRepository.findById(input.id);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    const usuarioPodeVisualizar = this.tarefaAccessPolicy.podeVisualizar(
      tarefa, {
        id: input.usuarioId,
        nome: input.usuarioNome,
        perfil: input.perfil,
      }
    );

    if (!usuarioPodeVisualizar) {
      throw new Error('Acesso não permitido para esta tarefa')
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
