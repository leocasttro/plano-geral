import {UserRepository} from '../../../domain/repositories/UserRepository';
import bcrypt from 'bcryptjs';

export class LoginUser {
  constructor(private userRepository: UserRepository) {}

  async execute(input: { email: string; senha: string }) {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    if (!user.ativo) {
      throw new Error('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(input.senha, user.senhaHash);

    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    return user;
  }
}
