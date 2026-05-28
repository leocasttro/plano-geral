import {ProjetoRepository} from '../../../domain/repositories/ProjetoRepository';

export class GetProjetoById {
  constructor(private projetoRepository: ProjetoRepository) {}

  async execute(id: string) {
    const projeto = await this.projetoRepository.findById(id);

    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    return projeto;
  }
}
