import {ProjetoRepository} from '../../../domain/repositories/ProjetoRepository';
import {StatusProjeto} from '../../../domain/value-objects/StatusProjeto';

export class UpdateProjetoStatus {
  constructor(private projetoRepository: ProjetoRepository) {}

  async execute(input: { projetoId: string; status: StatusProjeto, usuario: string }) {
    const projeto = await this.projetoRepository.findById(input.projetoId);

    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    if (input.status === StatusProjeto.PAUSADO) {
      projeto.pausar(input.usuario);
    }

    if (input.status === StatusProjeto.ATIVO) {
      projeto.retomar(input.usuario);
    }

    if (input.status === StatusProjeto.CONCLUIDO) {
      projeto.concluir(input.usuario);
    }

    await this.projetoRepository.save(projeto);

    return projeto;
  }
}
