// src/domain/value-objects/Periodo.ts
export class Periodo {
  constructor(
    private readonly inicio?: Date,
    private readonly fim?: Date
  ) {
    this.validar();
  }

  validar(): void {
    if (this.inicio && this.fim && this.inicio > this.fim) {
      throw new Error('Data de início não pode ser maior que data de fim');
    }
  }

  getInicio(): Date | null {
    return this.inicio ?? null;
  }

  getFim(): Date | null {
    return this.fim ?? null;
  }

  getInicioOptional(): Date | undefined {
    return this.inicio;
  }

  getFimOptional(): Date | undefined {
    return this.fim;
  }

  estaAtrasado(dataReferencia: Date = new Date()): boolean {
    if (!this.fim) return false;
    return dataReferencia > this.fim;
  }

  diasRestantes(): number | null {
    if (!this.fim) return null;
    const diff = this.fim.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Método para verificar se tem datas definidas
  temDatas(): boolean {
    return !!(this.inicio || this.fim);
  }
}
