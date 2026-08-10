import {UsuarioDTO} from '../usuario/usuario.model';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  user: UsuarioDTO;
}

export interface ConfirmPasswordChangeRequest {
  email: string;
  token: string;
  novaSenha: string;
  confirmacaoSenha: string;
}
