import { UserRepository } from '../../../domain/repositories/UserRepository';
import { UserResponseDTO } from '../../dtos/UserDTO';

export class GetAllUsers {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.findAllActive();
    return users.map(user => user.toJSON());
  }
}
