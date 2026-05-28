import { User } from '../../../../domain/entities/User';
import { UserORM } from '../entities/UserOrm';
import {PerfilUsuario} from '../../../../domain/value-objects/PerfilUsuario';

//Melhor ainda, depois você pode validar antes do cast, mas por hora o cast resolve.
export class UserMapper {
  static toDomain(orm: UserORM): User {
    return User.reconstituir({
      id: orm.id,
      nome: orm.nome,
      email: orm.email,
      senha: orm.senha_hash,
      perfil: orm.perfil_id as PerfilUsuario,
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
    orm.senha_hash = domain.senhaHash;
    orm.perfil_id = domain.perfil;
    orm.ativo = domain.ativo;
    return orm;
  }
}
