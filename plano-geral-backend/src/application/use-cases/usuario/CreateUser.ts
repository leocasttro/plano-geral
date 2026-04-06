import { User } from '../../../domain/entities/User';
import { CreateUserDTO, UserResponseDTO } from '../../dtos/UserDTO';
import { UserRepository } from './../../../domain/repositories/UserRepository';
export class CreateUser {

  constructor(private UserRepository: UserRepository) {}

  async execute(data: CreateUserDTO): Promise<UserResponseDTO> {

    const existingUser = await this.UserRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Usuário com este email já existe!');
    }

    const id = crypto.randomUUID();

    const user = new User(
      id,
      data.nome,
      data.email,
      data.perfil,
      true
    );

    await this.UserRepository.save(user);

    return user.toJSON();

  }

}
