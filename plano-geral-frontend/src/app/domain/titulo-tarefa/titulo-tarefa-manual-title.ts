export const SUBATIVIDADE_TITULO_MANUAL =
  'Abrir campo para preenchimento pelo responsável';

export function normalizarTextoCatalogo(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function ehSubatividadeTituloManual(
  value: string | null | undefined,
): boolean {
  return (
    normalizarTextoCatalogo(value) ===
    normalizarTextoCatalogo(SUBATIVIDADE_TITULO_MANUAL)
  );
}

export function montarTituloAutomaticoTarefa(
  atividadePrincipal: string | null | undefined,
  subatividade: string | null | undefined,
): string {
  if (ehSubatividadeTituloManual(subatividade)) {
    return '';
  }

  return [atividadePrincipal, subatividade]
    .map((item) => item?.trim())
    .filter((item): item is string => !!item)
    .join(' - ');
}

export function subatividadeUnicaExigeTituloManual<T extends { subatividade?: string | null }>(
  subatividades: T[],
): boolean {
  return (
    subatividades.length === 1 &&
    ehSubatividadeTituloManual(subatividades[0].subatividade)
  );
}
