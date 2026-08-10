import { UserType } from '../value-objects/UserType';
import {PerfilUsuario} from '../value-objects/PerfilUsuario';

type UserProps = {
  id: string;
  nome: string;
  email: string;
  senha: string;
  perfil?: PerfilUsuario;
  ativo: boolean;
  mustChangePassword?: boolean;
  passwordChangeTokenHash?: string | null;
  passwordChangeTokenExpiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export class User {
  private _perfil: string;
  private _ativo: boolean;
  private _mustChangePassword: boolean;
  private _passwordChangeTokenHash?: string | null;
  private _passwordChangeTokenExpiresAt?: Date | null;
  private _updatedAt: Date;

  constructor(
    public readonly id: string,
    private _nome: string,
    private _email: string,
    private _senhaHash: string,
    perfil?: string,
    ativo?: boolean,
    mustChangePassword?: boolean,
    passwordChangeTokenHash?: string | null,
    passwordChangeTokenExpiresAt?: Date | null,
  ) {
    if (!_nome || _nome.trim().length === 0) {
      throw new Error('Nome do usuário é obrigatório');
    }

    if (_nome.length < 3) {
      throw new Error('Nome deve ter no mínimo 3 caracteres');
    }

    if (!_email || !_email.includes('@')) {
      throw new Error('Email inválido');
    }

    const perfilUpper = (perfil || PerfilUsuario.USUARIO).toUpperCase();

    this._perfil = perfilUpper;
    this._ativo = ativo ?? true;
    this._mustChangePassword = mustChangePassword ?? false;
    this._passwordChangeTokenHash = passwordChangeTokenHash ?? null;
    this._passwordChangeTokenExpiresAt = passwordChangeTokenExpiresAt ?? null;
    this._updatedAt = new Date();
  }

  static reconstituir(props: UserProps): User {
    const user = new User(
      props.id,
      props.nome,
      props.email,
      props.senha,
      props.perfil,
      props.ativo,
      props.mustChangePassword,
      props.passwordChangeTokenHash,
      props.passwordChangeTokenExpiresAt,
    );
    return user;
  }

  get nome(): string {
    return this._nome;
  }

  get email(): string {
    return this._email;
  }

  get senhaHash(): string {
    return this._senhaHash;
  }

  get perfil(): string {
    return this._perfil;
  }

  get ativo(): boolean {
    return this._ativo;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get mustChangePassword(): boolean {
    return this._mustChangePassword;
  }

  get passwordChangeTokenHash(): string | null | undefined {
    return this._passwordChangeTokenHash;
  }

  get passwordChangeTokenExpiresAt(): Date | null | undefined {
    return this._passwordChangeTokenExpiresAt;
  }

  ativar(usuarioAcao?: string) {
    if (this._ativo) {
      throw new Error('Usuário já está ativo');
    }

    this._ativo = true;
    this._updatedAt = new Date();
  }

  alterarPerfil(novoPerfil: string, usuarioAcao?: string) {
    const perfisValidos = ['ADMIN', 'USER', 'MANAGER', 'VIEWER'];
    const perfilUpper = novoPerfil.toUpperCase();

    if (!perfisValidos.includes(perfilUpper)) {
      throw new Error('Perfil inválido');
    }

    this._perfil = perfilUpper;
    this._updatedAt = new Date();
  }

  desativar(usuarioAcao?: string) {
    if (!this._ativo) {
      throw new Error('Usuário já está inativo');
    }

    this._ativo = false;
    this._updatedAt = new Date();
  }

  definirTokenTrocaSenha(tokenHash: string, expiresAt: Date) {
    this._mustChangePassword = true;
    this._passwordChangeTokenHash = tokenHash;
    this._passwordChangeTokenExpiresAt = expiresAt;
    this._updatedAt = new Date();
  }

  alterarSenha(novaSenhaHash: string) {
    this._senhaHash = novaSenhaHash;
    this._updatedAt = new Date();
  }

  confirmarTrocaSenha() {
    this._mustChangePassword = false;
    this._passwordChangeTokenHash = null;
    this._passwordChangeTokenExpiresAt = null;
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      nome: this._nome,
      email: this._email,
      perfil: this._perfil,
      ativo: this._ativo,
      mustChangePassword: this._mustChangePassword,
      updatedAt: this._updatedAt,
    };
  }
}
