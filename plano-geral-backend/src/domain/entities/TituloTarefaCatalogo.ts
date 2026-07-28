export type TituloTarefaCatalogoProps = {
  id: string;
  acao?: string | null;
  componente?: string | null;
  atividadePrincipal?: string | null;
  subatividade?: string | null;
  descricao?: string | null;
  tituloNormalizado: string;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export class TituloTarefaCatalogo {
  constructor(
    public readonly id: string,
    public acao: string | null,
    public componente: string | null,
    public atividadePrincipal: string | null,
    public subatividade: string | null,
    public descricao: string | null,
    public tituloNormalizado: string,
    public ativo = true,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  static criar(input: {
    acao?: string | null;
    componente?: string | null;
    atividadePrincipal?: string | null;
    subatividade?: string | null;
    descricao?: string | null;
  }): TituloTarefaCatalogo {
    const titulo = TituloTarefaCatalogo.montarTituloExibicao(input);

    if (!titulo) {
      throw new Error('Título do catálogo precisa ter atividade ou subatividade');
    }

    return new TituloTarefaCatalogo(
      crypto.randomUUID(),
      input.acao?.trim() || null,
      input.componente?.trim() || null,
      input.atividadePrincipal?.trim() || null,
      input.subatividade?.trim() || null,
      input.descricao?.trim() || null,
      normalizarTexto(titulo),
      true,
    );
  }

  static reconstituir(props: TituloTarefaCatalogoProps): TituloTarefaCatalogo {
    return new TituloTarefaCatalogo(
      props.id,
      props.acao ?? null,
      props.componente ?? null,
      props.atividadePrincipal ?? null,
      props.subatividade ?? null,
      props.descricao ?? null,
      props.tituloNormalizado,
      props.ativo,
      props.createdAt,
      props.updatedAt,
    );
  }

  obterTituloExibicao(): string {
    return TituloTarefaCatalogo.montarTituloExibicao(this);
  }

  static montarTituloExibicao(input: {
    atividadePrincipal?: string | null;
    subatividade?: string | null;
  }): string {
    return [input.atividadePrincipal, input.subatividade]
      .map((item) => item?.trim())
      .filter((item): item is string => !!item)
      .join(' - ');
  }
}

export function normalizarTexto(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}
