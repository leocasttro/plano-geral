import { UserRepository } from '../../../domain/repositories/UserRepository';

export class DeleteUser {
  constructor(private userRepository: UserRepository) {}

  async execute(input: { userId: string; usuarioAcaoId?: string }): Promise<void> {
    if (!input.userId) {
      throw new Error('Usuário inválido');
    }

    if (input.usuarioAcaoId && input.usuarioAcaoId === input.userId) {
      throw new Error('Não é possível excluir o próprio usuário logado');
    }

    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (user.ativo && user.perfil === 'ADMIN') {
      await this.garantirOutroAdminAtivo(user.id);
    }

    await this.userRepository.delete(user.id);
  }

  private async garantirOutroAdminAtivo(userId: string): Promise<void> {
    const adminsAtivos = (await this.userRepository.findAll()).filter(
      (user) => user.id !== userId && user.ativo && user.perfil === 'ADMIN',
    );

    if (!adminsAtivos.length) {
      throw new Error('Não é possível excluir o último administrador ativo');
    }
  }
}
