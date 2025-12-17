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
  if (!datetime) return null;

  const d = new Date(datetime); // JS já converte UTC -> local

  return {
    date: `${String(d.getDate()).padStart(2, '0')}/` +
          `${String(d.getMonth() + 1).padStart(2, '0')}/` +
          `${d.getFullYear()}`,
    time: `${String(d.getHours()).padStart(2, '0')}:` +
          `${String(d.getMinutes()).padStart(2, '0')}:` +
          `${String(d.getSeconds()).padStart(2, '0')}`,
  };
}



