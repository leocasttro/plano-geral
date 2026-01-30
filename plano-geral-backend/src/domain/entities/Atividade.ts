import { TipoAtividade } from "../value-objects/TipoAtividade";

type AtividadeProps = {
  id: string;
  tipo: TipoAtividade;
  usuario: string;
  descricao: string;
  data: Date;
};

export class Atividade {
  public readonly data: Date;

  constructor(
    public readonly id: string,
    public readonly tipo: TipoAtividade,
    public readonly usuario: string,
    public readonly descricao: string,
    data?: Date,
  ) {
    this.data = data ?? new Date();

    if (!descricao || descricao.trim().length === 0) {
      throw new Error('Atividade precisa de uma descrição válida');
    }
  }

  static reconstituir(props: AtividadeProps): Atividade {
    return new Atividade(
      props.id,
      props.tipo,
      props.usuario,
      props.descricao,
      props.data,
    );
  }
}
