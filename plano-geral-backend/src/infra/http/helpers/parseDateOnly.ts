export function parseDateOnly(value?: string): Date | undefined {
  if (!value) return undefined;

  const [ano, mes, dia] = value.split('T')[0].split('-').map(Number);

  if (!ano || !mes || !dia) {
    throw new Error('Data inválida');
  }

  return new Date(ano, mes - 1, dia);
}
