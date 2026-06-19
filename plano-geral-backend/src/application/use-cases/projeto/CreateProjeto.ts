import { randomUUID } from 'crypto';
import { Projeto } from '../../../domain/entities/Projeto';
import { ProjetoRepository } from './../../../domain/repositories/ProjetoRepository';
import {UserRepository} from '../../../domain/repositories/UserRepository';
interface CreateProjetoInput {
  nome: string;
  descricao?: string;
  centroCusto?: string | null;
  coordenadorId?: string | null;
}

export class CreateProjeto {
  constructor(private ProjetoRepository: ProjetoRepository, private userRepository: UserRepository,) {}

  async execute(input: CreateProjetoInput): Promise<Projeto> {
    const projeto = new Projeto(
      randomUUID(),
      input.nome,
      input.descricao,
      input.centroCusto,
      input.coordenadorId
    );

    if (input.coordenadorId) {
      const coordenador = await this.userRepository.findById(input.coordenadorId);

      if (!coordenador) {
        throw new Error('Coordenador não encontrado');
      }

      if (!coordenador.ativo) {
        throw new Error('Coordenador inativo');
      }
    }

    await this.ProjetoRepository.save(projeto);
    return projeto;
  }
}
