import {UserRepository} from '../../../domain/repositories/UserRepository';
import bcrypt from 'bcryptjs';

export class LoginUser {
  constructor(private userRepository: UserRepository) {}

  async execute(input: { email: string; senha: string }) {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new Error('Credencias inválidas');
    }

    if (!user.ativo) {
      throw new Error('Usuário inativo, contate o administrador');
    }

    const senhaValida = await bcrypt.compare(input.senha, user.senhaHash);

    if (!senhaValida) {
      throw new Error('Senha incorreta');
    }

    return user;
  }
}
