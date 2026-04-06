import { User } from '../../../../domain/entities/User';
import { UserORM } from '../entities/UserOrm';

export class UserMapper {
  static toDomain(orm: UserORM): User {
    return User.reconstituir({
      id: orm.id,
      nome: orm.nome,
      email: orm.email,
      perfil: orm.perfil,
      ativo: orm.ativo,
      createdAt: orm.created_at,
      updatedAt: orm.updated_at,
    });
  }

  static toOrm(domain: User): UserORM {
    const orm = new UserORM();
    orm.id = domain.id;
    orm.nome = domain.nome;
    orm.email = domain.email;
    orm.perfil = domain.perfil;
    orm.ativo = domain.ativo;
    return orm;
  }
}
