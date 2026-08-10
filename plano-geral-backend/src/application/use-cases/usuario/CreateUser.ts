import { MailService } from './../../services/MailService';
import { User } from '../../../domain/entities/User';
import { CreateUserDTO, UserResponseDTO } from '../../dtos/UserDTO';
import { UserRepository } from './../../../domain/repositories/UserRepository';
import bcrypt from 'bcryptjs';

export class CreateUser {

  constructor(private UserRepository: UserRepository, private mailService: MailService) {}

  async execute(data: CreateUserDTO): Promise<UserResponseDTO> {

    const existingUser = await this.UserRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Usuário com este email já existe!');
    }

    const id = crypto.randomUUID();

    const senhaHash = await bcrypt.hash(data.senha, 10);

    const token = crypto.randomUUID();
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const user = new User(
      id,
      data.nome,
      data.email,
      senhaHash,
      data.perfil,
      true
    );

    user.definirTokenTrocaSenha(tokenHash, expiresAt);

    await this.UserRepository.save(user);

    const link = `${process.env.FRONTEND_URL}/trocar-senha?email=${encodeURIComponent(data.email)}&token=${token}`;

    await this.mailService.sendPasswordChangeConfirmation(
      data.email,
      data.nome,
      link,
    );

    return user.toJSON();

  }

}
