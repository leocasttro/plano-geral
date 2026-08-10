export interface UserResponseDTO {
  id: string;
  nome: string;
  email: string;
  perfil?: string;
  ativo: boolean;
  mustChangePassword: boolean;
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

export interface ConfirmPasswordChangeDTO {
  email: string;
  token: string;
  novaSenha: string;
  confirmacaoSenha: string;
}
