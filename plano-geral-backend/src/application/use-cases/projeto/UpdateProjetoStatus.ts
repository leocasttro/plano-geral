import {ProjetoRepository} from '../../../domain/repositories/ProjetoRepository';
import {StatusProjeto} from '../../../domain/value-objects/StatusProjeto';

export class UpdateProjetoStatus {
  constructor(private projetoRepository: ProjetoRepository) {}

  async execute(input: { projetoId: string; status: StatusProjeto; usuario: string }) {
    const projeto = await this.projetoRepository.findById(input.projetoId);

    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    switch (input.status) {
      case StatusProjeto.PAUSADO:
        projeto.pausar(input.usuario);
        break;
      case StatusProjeto.ATIVO:
        projeto.retomar(input.usuario);
        break;
      case StatusProjeto.CONCLUIDO:
        projeto.concluir(input.usuario);
        break;
      case StatusProjeto.CANCELADO:
        projeto.cancelar(input.usuario);
        break;
      default:
        throw new Error('Status inválido');
    }

    await this.projetoRepository.save(projeto);

    return projeto;
  }
}
