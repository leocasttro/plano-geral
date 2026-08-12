export class BusinessHoursService {
  static readonly START_HOUR = 8;
  static readonly END_HOUR = 18;
  static readonly HOURS_PER_BUSINESS_DAY =
    BusinessHoursService.END_HOUR - BusinessHoursService.START_HOUR;

  static calcularHoras(inicio: Date, fim: Date): number {
    if (fim <= inicio) {
      return 0;
    }

    let totalMs = 0;
    const cursor = this.inicioDoDia(inicio);
    const fimDia = this.inicioDoDia(fim);

    while (cursor <= fimDia) {
      if (this.ehDiaUtil(cursor)) {
        const inicioExpediente = this.comHora(cursor, this.START_HOUR);
        const fimExpediente = this.comHora(cursor, this.END_HOUR);
        const inicioIntervalo = this.maiorData(inicio, inicioExpediente);
        const fimIntervalo = this.menorData(fim, fimExpediente);

        if (fimIntervalo > inicioIntervalo) {
          totalMs += fimIntervalo.getTime() - inicioIntervalo.getTime();
        }
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return Number((totalMs / 36e5).toFixed(2));
  }

  static calcularDiasUteis(inicio: Date, fim: Date): number {
    return Number(
      (this.calcularHoras(inicio, fim) / this.HOURS_PER_BUSINESS_DAY).toFixed(2),
    );
  }

  private static ehDiaUtil(data: Date): boolean {
    const dia = data.getDay();
    return dia !== 0 && dia !== 6;
  }

  private static inicioDoDia(data: Date): Date {
    const copia = new Date(data);
    copia.setHours(0, 0, 0, 0);
    return copia;
  }

  private static comHora(data: Date, hora: number): Date {
    const copia = new Date(data);
    copia.setHours(hora, 0, 0, 0);
    return copia;
  }

  private static maiorData(a: Date, b: Date): Date {
    return a > b ? a : b;
  }

  private static menorData(a: Date, b: Date): Date {
    return a < b ? a : b;
  }
}
