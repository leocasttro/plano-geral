import {Tarefa} from '../entities/Tarefa';
import {TipoAtividade} from '../value-objects/TipoAtividade';

type UsuarioTarefa = {
  id: string;
  nome?: string;
  perfil: string;
}

export class TarefaAccessPolicy {
  podeVisualizar(tarefa: Tarefa, usuario: UsuarioTarefa): boolean {
    if (usuario.perfil === 'ADMIN') {
      return true;
    }

    return (
      tarefa.obterCriador() === usuario.id ||
      tarefa.obterResponsavel() === usuario.id ||
      tarefa.obterAtividades().some((atividade) => {
        return (
          atividade.tipo === TipoAtividade.CRIACAO &&
          (atividade.usuario === usuario.id || atividade.usuario === usuario.nome)
        );
      })
    );
  }
}
