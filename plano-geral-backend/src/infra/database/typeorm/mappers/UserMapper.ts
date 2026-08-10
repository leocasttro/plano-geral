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
      mustChangePassword: orm.must_change_password,
      passwordChangeTokenHash: orm.password_change_token_hash,
      passwordChangeTokenExpiresAt: orm.password_change_token_expires_at,
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
    orm.must_change_password = domain.mustChangePassword;
    orm.password_change_token_hash = domain.passwordChangeTokenHash ?? null;
    orm.password_change_token_expires_at = domain.passwordChangeTokenExpiresAt ?? null;
    return orm;
  }
}
