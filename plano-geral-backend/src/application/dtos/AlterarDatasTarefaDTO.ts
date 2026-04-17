export interface AlterarDatasTarefaDTO {
  id: string;
  dataInicio?: Date | null;
  dataFim?: Date | null;
  usuario: string;
}
