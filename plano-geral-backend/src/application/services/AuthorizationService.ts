import {User} from '../../domain/entities/User';
import {PerfilUsuario} from '../../domain/value-objects/PerfilUsuario';

export class AuthorizationService {
  static ensureAdmin(user: User): void {
    if (user.perfil !== PerfilUsuario.ADMIN) {
      throw new Error('Ação permitida apenas para administradores.');
    }

    if (!user.ativo) {
      throw new Error('Usuário inativo. Entre em contato com o administrador.');
    }
  }

  static isAdmin(user: User): boolean {
    return user.perfil === PerfilUsuario.ADMIN;
  }
}
