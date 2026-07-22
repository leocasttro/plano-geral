import { UserRepository } from '../../../domain/repositories/UserRepository';
import { UserResponseDTO } from '../../dtos/UserDTO';

export class AlterarPerfilUsuario {
  constructor(private userRepository: UserRepository) {}

  async execute(input: { userId: string; perfil: string; usuarioAcao?: string }): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const perfilAnterior = user.perfil;

    if (perfilAnterior === 'ADMIN' && input.perfil.toUpperCase() !== 'ADMIN') {
      await this.garantirOutroAdminAtivo(user.id);
    }

    user.alterarPerfil(input.perfil, input.usuarioAcao);
    await this.userRepository.save(user);

    return user.toJSON();
  }

  private async garantirOutroAdminAtivo(userId: string): Promise<void> {
    const adminsAtivos = (await this.userRepository.findAll()).filter(
      (user) => user.id !== userId && user.ativo && user.perfil === 'ADMIN',
    );

    if (!adminsAtivos.length) {
      throw new Error('Não é possível remover o último administrador ativo');
    }
  }
}
