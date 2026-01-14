import { TipoAtividade } from '../value-objects/TipoAtividade';

export class Atividade {
  public readonly data: Date;

  constructor(
    public readonly id: string,
    public readonly tipo: TipoAtividade,
    public readonly usuario: string,
    public readonly descricao: string,
  ) {
    this.data = new Date();

    if(!descricao || descricao.trim().length === 0) {
      throw new Error('Atividade precisa de uma descrição válida');
    }
  }
}
