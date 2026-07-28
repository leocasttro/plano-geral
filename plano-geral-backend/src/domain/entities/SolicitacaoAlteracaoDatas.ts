import { randomUUID } from 'crypto';

export type StatusSolicitacaoAlteracaoDatas =
  | 'PENDENTE'
  | 'APROVADA'
  | 'REPROVADA';

export class SolicitacaoAlteracaoDatas {
  constructor(
    public readonly id: string,
    public readonly tarefaId: string,
    public readonly solicitanteId: string,
    public readonly solicitanteNome: string,
    public readonly dataInicio: Date | null,
    public readonly dataFim: Date | null,
    public readonly justificativa: string,
    private status: StatusSolicitacaoAlteracaoDatas,
    public aprovadorId: string | null,
    public aprovadorNome: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static criar(input: {
    tarefaId: string;
    solicitanteId: string;
    solicitanteNome: string;
    dataInicio?: Date;
    dataFim?: Date;
    justificativa: string;
  }): SolicitacaoAlteracaoDatas {
    return new SolicitacaoAlteracaoDatas(
      randomUUID(),
      input.tarefaId,
      input.solicitanteId,
      input.solicitanteNome,
      input.dataInicio ?? null,
      input.dataFim ?? null,
      input.justificativa,
      'PENDENTE',
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  aprovar(aprovadorId: string, aprovadorNome: string): void {
    this.validarPendente();
    this.status = 'APROVADA';
    this.aprovadorId = aprovadorId;
    this.aprovadorNome = aprovadorNome;
    this.updatedAt = new Date();
  }

  reprovar(aprovadorId: string, aprovadorNome: string): void {
    this.validarPendente();
    this.status = 'REPROVADA';
    this.aprovadorId = aprovadorId;
    this.aprovadorNome = aprovadorNome;
    this.updatedAt = new Date();
  }

  obterStatus(): StatusSolicitacaoAlteracaoDatas {
    return this.status;
  }

  private validarPendente(): void {
    if (this.status !== 'PENDENTE') {
      throw new Error('Solicitação já foi avaliada');
    }
  }
}
