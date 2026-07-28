export interface TituloTarefaCatalogoDTO {
  id: string;
  acao: string | null;
  componente: string | null;
  atividadePrincipal: string | null;
  subatividade: string | null;
  descricao: string | null;
  tituloExibicao: string;
  ativo: boolean;
}
