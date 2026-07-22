export interface UsuarioDTO {
  id: string;
  nome: string;
  email: string;
  perfil?: string;
  ativo: boolean;
}

export interface CriarUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  perfil: string;
}
