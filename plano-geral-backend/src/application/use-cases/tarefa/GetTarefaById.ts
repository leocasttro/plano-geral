import { TarefaRepository } from "../../../domain/repositories/TarefaRepository";
import {UserRepository} from '../../../domain/repositories/UserRepository';
import {ProjetoRepository} from '../../../domain/repositories/ProjetoRepository';
import {TarefaDTO, TarefaDTOProps} from '../../dtos/TarefaDTO';
import {TarefaAccessPolicy} from '../../../domain/policies/TarefaAccessPolicy';

export class GetTarefaById {
  constructor(
    private tarefaRepository: TarefaRepository,
    private userRepository: UserRepository,
    private projetoRepository: ProjetoRepository,
    private tarefaAccessPolicy = new TarefaAccessPolicy()
  ) {}

  async execute(input: { id: string; usuarioId: string; usuarioNome?: string; perfil: string }): Promise<TarefaDTOProps> {
    const tarefa = await this.tarefaRepository.findById(input.id);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    const todosProjetos = await this.projetoRepository.findAll();
    const meusProjetosIds = todosProjetos
      .filter((p) => p.obterCoordenadorId() === input.usuarioId)
      .map((p) => p.id);

    const usuarioPodeVisualizar = this.tarefaAccessPolicy.podeVisualizar(
      tarefa, 
      {
        id: input.usuarioId,
        nome: input.usuarioNome,
        perfil: input.perfil,
      },
      meusProjetosIds
    );

    if (!usuarioPodeVisualizar) {
      throw new Error('Acesso não permitido para esta tarefa')
    }

    const responsaveisIds = tarefa.obterResponsaveis();
    const responsaveis = [];

    for (const responsavelId of responsaveisIds) {
      const usuario = await this.userRepository.findById(responsavelId);
      if (usuario) {
        responsaveis.push({
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
        });
      }
    }

    return TarefaDTO.fromDomain(tarefa, responsaveis);
  }
}
