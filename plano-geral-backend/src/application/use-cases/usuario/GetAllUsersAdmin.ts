import { UserRepository } from '../../../domain/repositories/UserRepository';
import { UserResponseDTO } from '../../dtos/UserDTO';

export class GetAllUsersAdmin {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.findAll();

    return users
      .map((user) => user.toJSON())
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }
}
