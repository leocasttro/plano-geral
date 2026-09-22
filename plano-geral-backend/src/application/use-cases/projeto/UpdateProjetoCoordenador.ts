import { Projeto } from "../../../domain/entities/Projeto";
import { ProjetoRepository } from "../../../domain/repositories/ProjetoRepository";
import { UserRepository } from "../../../domain/repositories/UserRepository";

export class UpdateProjetoCoordenador {
  constructor(
    private projetoRepo: ProjetoRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(input: { projetoId: string; coordenadorId: string | null; usuarioPerfil: string }): Promise<Projeto> {
    if (input.usuarioPerfil !== 'ADMIN' && input.usuarioPerfil !== 'GESTOR') {
      throw new Error('O perfil não pode editar o responsável pelo projeto');
    }

    const projeto = await this.projetoRepo.findById(input.projetoId);
    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    let coordenadorNome = null;
    if (input.coordenadorId) {
      const coordenador = await this.userRepository.findById(input.coordenadorId);

      if (!coordenador) {
        throw new Error('Coordenador não encontrado');
      }
      coordenadorNome = coordenador.nome;
    }

    projeto.alterarCoordenador(input.coordenadorId || null, coordenadorNome);
    await this.projetoRepo.save(projeto);

    return projeto;
  }
}
