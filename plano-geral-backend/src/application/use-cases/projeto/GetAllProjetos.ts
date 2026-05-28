import {ProjetoRepository} from '../../../domain/repositories/ProjetoRepository';

export class GetAllProjetos {
  constructor(private projetoRepository: ProjetoRepository) {}

  async execute() {
    return this.projetoRepository.findAll();
  }
}
