import { Repository } from 'typeorm';
import { UserRepository } from '../../../../../domain/repositories/UserRepository';
import { UserORM } from '../UserOrm';
import { DataSource } from 'typeorm/browser';
import { UserMapper } from '../../mappers/UserMapper';
import { User } from '../../../../../domain/entities/User';
import { AppDataSource } from '../../../data-source';

export class UserTypeORMRepository implements UserRepository {
  private repository: Repository<UserORM>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserORM);
  }

  async save(user: User): Promise<void> {
    const orm = UserMapper.toOrm(user);
    await this.repository.save(orm);
  }

  async findById(id: string): Promise<User | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const orm = await this.repository.findOne({ where: { email } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async findAll(): Promise<User[]> {
    const orms = await this.repository.find();
    return orms.map((orm) => UserMapper.toDomain(orm));
  }

  async findAllActive(): Promise<User[]> {
    const orms = await this.repository.find({ where: { ativo: true } });
    return orms.map((orm) => UserMapper.toDomain(orm));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
