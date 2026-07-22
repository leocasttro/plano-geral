import { UserRepository } from '../../../domain/repositories/UserRepository';
import { UserResponseDTO } from '../../dtos/UserDTO';

export class AlterarStatusUsuario {
  constructor(private userRepository: UserRepository) {}

  async execute(input: { userId: string; ativo: boolean; usuarioAcao?: string }): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (!input.ativo && user.perfil === 'ADMIN') {
      await this.garantirOutroAdminAtivo(user.id);
    }

    if (input.ativo) {
      if (!user.ativo) {
        user.ativar(input.usuarioAcao);
      }
    } else if (user.ativo) {
      user.desativar(input.usuarioAcao);
    }

    await this.userRepository.save(user);

    return user.toJSON();
  }

  private async garantirOutroAdminAtivo(userId: string): Promise<void> {
    const adminsAtivos = (await this.userRepository.findAll()).filter(
      (user) => user.id !== userId && user.ativo && user.perfil === 'ADMIN',
    );

    if (!adminsAtivos.length) {
      throw new Error('Não é possível desativar o último administrador ativo');
    }
  }
}
