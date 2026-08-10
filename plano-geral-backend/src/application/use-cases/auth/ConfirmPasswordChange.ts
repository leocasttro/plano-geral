import { UserRepository } from "../../../domain/repositories/UserRepository";
import bcrypt from 'bcryptjs';

export class ConfirmPasswordChange {
  constructor(private userRepository: UserRepository) {}

  async execute(input: {
    email: string;
    token: string;
    novaSenha: string;
    confirmacaoSenha: string;
  }) {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new Error('Token inválido');
    }

    if (!user.passwordChangeTokenHash) {
      throw new Error('Token inválido');
    }

    if (!user.passwordChangeTokenExpiresAt) {
      throw new Error('Token inválido');
    }

    if (user.passwordChangeTokenExpiresAt < new Date()) {
      throw new Error('Token expirado');
    }

    const tokenValido = await bcrypt.compare(input.token, user.passwordChangeTokenHash);

    if (!tokenValido) {
      throw new Error('Token inválido');
    }

    if (input.novaSenha !== input.confirmacaoSenha) {
      throw new Error('As senhas não conferem');
    }

    const novaSenhaHash = await bcrypt.hash(input.novaSenha, 10);

    user.alterarSenha(novaSenhaHash);
    user.confirmarTrocaSenha();

    await this.userRepository.save(user);
  }
}
