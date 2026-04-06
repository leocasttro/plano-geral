export interface UserResponseDTO {
  id: string;
  nome: string;
  email: string;
  perfil?: string;
  ativo: boolean;
}

export interface CreateUserDTO {
  nome: string;
  email: string;
  perfil?: string;
  senha: string;
}

export interface UpdateUserDTO {
  nome?: string;
  email?: string;
  perfil?: string;
  ativo?: boolean;
  senha?: string;
}
