// src/util/DateUtil.ts
export interface SimpleDateTime {
  date: string; // "24/11/2025"
  time: string; // "18:32:42"
}

/**
 * Recebe "YYYY-MM-DD HH:mm:ss[.SSS]" e retorna { date: "dd/mm/yyyy", time: "HH:MM:SS" }.
 * Retorna null se input inválido.
 */
export function splitDateTime(datetime?: string | null): SimpleDateTime | null {
  if (!datetime || typeof datetime !== 'string') return null;

  const clean = datetime.split('.')[0].trim(); // remove milissegundos e espaços
  const parts = clean.split(/[ T]/); // aceita espaço ou 'T'
  if (parts.length < 2) return null;

  const [date, time] = parts;
  const dateParts = date.split('-');
  if (dateParts.length !== 3) return null;

  const [yyyy, mm, dd] = dateParts;
  // simples validação numérica básica
  if (!/^\d{4}$/.test(yyyy) || !/^\d{1,2}$/.test(mm) || !/^\d{1,2}$/.test(dd)) return null;

  const timePart = time.split(':').slice(0, 3).join(':'); // garante HH:MM:SS (descarta ms se sobraram)
  return {
    date: `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`,
    time: timePart,
  };
}
