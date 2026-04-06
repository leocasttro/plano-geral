import { UserType } from '../value-objects/UserType';

type UserProps = {
  id: string;
  nome: string;
  email: string;
  perfil?: string;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export class User {
  private _perfil: string;
  private _ativo: boolean;
  private _updatedAt: Date;

  constructor(
    public readonly id: string,
    private _nome: string,
    private _email: string,
    perfil?: string,
    ativo?: boolean,
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

    const perfisValidos = ['ADMIN', 'USER', 'MANAGER', 'VIEWER'];
    const perfilUpper = (perfil || 'USER').toUpperCase();

    if (!perfisValidos.includes(perfilUpper)) {
      throw new Error('Perfil inválido');
    }

    this._perfil = perfilUpper;
    this._ativo = ativo ?? true;
    this._updatedAt = new Date();
  }

  static reconstituir(props: UserProps): User {
    const user = new User(
      props.id,
      props.nome,
      props.email,
      props.perfil,
      props.ativo,
    );
    return user;
  }

  get nome(): string {
    return this._nome;
  }

  get email(): string {
    return this._email;
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

  toJSON() {
    return {
      id: this.id,
      nome: this._nome,
      email: this._email,
      perfil: this._perfil,
      ativo: this._ativo,
      updatedAt: this._updatedAt,
    };
  }
}
