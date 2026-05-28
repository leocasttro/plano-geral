import { randomUUID } from 'crypto';
import { Projeto } from '../../../domain/entities/Projeto';
import { ProjetoRepository } from './../../../domain/repositories/ProjetoRepository';
interface CreateProjetoInput {
  nome: string;
  descricao?: string;
}

export class CreateProjeto {
  constructor(private ProjetoRepository: ProjetoRepository) {}

  async execute(input: CreateProjetoInput): Promise<Projeto> {
    const projeto = new Projeto(
      randomUUID(),
      input.nome,
      input.descricao
    );

    await this.ProjetoRepository.save(projeto);
    return projeto;
  }
}
