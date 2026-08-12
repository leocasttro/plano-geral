import { Tarefa } from '../../../domain/entities/Tarefa';
import { TarefaComPrazo } from '../../../domain/entities/TarefaComPrazo';
import {
  normalizarTexto,
  TituloTarefaCatalogo,
} from '../../../domain/entities/TituloTarefaCatalogo';

export type RelatorioFiltros = {
  projetoId?: string;
  usuarioId?: string;
  componente?: string;
  atividadePrincipal?: string;
  subatividade?: string;
  inicio?: Date;
  fim?: Date;
};

type CatalogoResumo = {
  componente: string | null;
  atividadePrincipal: string | null;
  subatividade: string | null;
};

export function filtrarTarefasRelatorio(
  tarefas: Tarefa[],
  filtros: RelatorioFiltros = {},
  resolverCatalogo?: (tarefa: Tarefa) => CatalogoResumo | null,
): Tarefa[] {
  return tarefas.filter((tarefa) => {
    if (filtros.projetoId && tarefa.obterProjetoId() !== filtros.projetoId) {
      return false;
    }

    if (filtros.usuarioId && tarefa.obterResponsavel() !== filtros.usuarioId) {
      return false;
    }

    const catalogo = resolverCatalogo?.(tarefa) ?? tarefa.obterTituloCatalogo();

    if (!textoIgual(catalogo?.componente, filtros.componente)) {
      return false;
    }

    if (!textoIgual(catalogo?.atividadePrincipal, filtros.atividadePrincipal)) {
      return false;
    }

    if (!textoIgual(catalogo?.subatividade, filtros.subatividade)) {
      return false;
    }

    return pertenceAoPeriodo(tarefa, filtros);
  });
}

export function criarResolverCatalogoRelatorio(
  catalogos: TituloTarefaCatalogo[],
): (tarefa: Tarefa) => CatalogoResumo | null {
  const catalogoPorTitulo = new Map<string, TituloTarefaCatalogo[]>();

  catalogos.forEach((catalogo) => {
    const titulo = catalogo.obterTituloExibicao();

    if (!titulo) {
      return;
    }

    const chave = normalizarTexto(titulo);
    catalogoPorTitulo.set(chave, [...(catalogoPorTitulo.get(chave) ?? []), catalogo]);
  });

  return (tarefa: Tarefa) =>
    tarefa.obterTituloCatalogo() ??
    catalogoPorTitulo.get(normalizarTexto(tarefa.titulo))?.[0] ??
    null;
}

function textoIgual(valor: string | null | undefined, filtro?: string): boolean {
  if (!filtro?.trim()) {
    return true;
  }

  return normalizarTexto(valor ?? '') === normalizarTexto(filtro);
}

function pertenceAoPeriodo(tarefa: Tarefa, filtros: RelatorioFiltros): boolean {
  if (!filtros.inicio && !filtros.fim) {
    return true;
  }

  const inicio = filtros.inicio ?? new Date(-8640000000000000);
  const fim = filtros.fim ?? new Date(8640000000000000);

  if (tarefa instanceof TarefaComPrazo) {
    const dataInicio = tarefa.getPeriodo().getInicioOptional();
    const dataFim = tarefa.getPeriodo().getFimOptional();

    if (dataInicio || dataFim) {
      const tarefaInicio = dataInicio ?? dataFim!;
      const tarefaFim = dataFim ?? dataInicio!;

      if (tarefaInicio <= fim && tarefaFim >= inicio) {
        return true;
      }
    }
  }

  return tarefa.obterAtividades().some(
    (atividade) => atividade.data >= inicio && atividade.data <= fim,
  );
}
