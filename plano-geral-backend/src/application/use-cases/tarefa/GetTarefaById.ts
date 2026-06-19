import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import {UserRepository} from '../../../domain/repositories/UserRepository';
import {TarefaDTO, TarefaDTOProps} from '../../dtos/TarefaDTO';

export class GetTarefaById {
  constructor(
    private tarefaRepository: TarefaRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(input: { id: string; usuarioId: string; usuarioNome?: string; perfil: string }): Promise<TarefaDTOProps> {
    const tarefa = await this.tarefaRepository.findById(input.id);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    const usuarioPodeVisualizar =
      input.perfil === 'ADMIN' ||
      tarefa.obterCriador() === input.usuarioId ||
      tarefa.obterResponsavel() === input.usuarioId ||
      tarefa.obterAtividades().some((atividade) => {
        return (
          atividade.tipo === 'CRIACAO' &&
          (
            atividade.usuario === input.usuarioId ||
            atividade.usuario === input.usuarioNome
          )
        );
      });

    if (!usuarioPodeVisualizar) {
      throw new Error('Acesso não permitido para esta tarefa');
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
