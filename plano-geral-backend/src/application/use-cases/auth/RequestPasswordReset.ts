import { UserRepository } from "../../../domain/repositories/UserRepository";
import { MailService } from "../../services/MailService";
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export class RequestPasswordReset {
  constructor(
    private userRepository: UserRepository,
    private mailService: MailService,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('hex');

    const tokenHash = await bcrypt.hash(resetToken, 10);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    user.definirTokenTrocaSenha(tokenHash, expiresAt);
    await this.userRepository.save(user);

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/trocar-senha?token=${resetToken}&email=${email}`;

    await this.mailService.sendPasswordReset(user.email, user.nome, resetLink);
  }
}
