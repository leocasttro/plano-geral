// src/domain/entities/TarefaComPrazo.ts
import { randomUUID } from 'crypto';
import { Tarefa } from './Tarefa';
import { Periodo } from '../value-objects/Periodo';
import { Atividade } from './Atividade';
import { TipoAtividade } from '../value-objects/TipoAtividade';
import { StatusTarefa } from '../value-objects/StatusTarefa';

export class TarefaComPrazo extends Tarefa {
  constructor(
    id: string,
    titulo: string,
    descricao: string | undefined,
    projetoId: string,
    private periodo: Periodo  // Agora é mutável (remova o readonly)
  ) {
    super(id, titulo, descricao, projetoId);
  }

  // Método para alterar as datas de uma tarefa existente
  alterarDatas(novaDataInicio?: Date, novaDataFim?: Date, usuario?: string, justificativa?: string,): void {
    // Validações
    if (this.obterStatus() === StatusTarefa.CONCLUIDA) {
      throw new Error('Não é possível alterar datas de uma tarefa concluída');
    }

    const periodoAntigo = this.periodo;

    const novoPeriodo = new Periodo(
      novaDataInicio ?? periodoAntigo.getInicioOptional(),
      novaDataFim ?? periodoAntigo.getFimOptional()
    );

    const houveAlteracao =
      periodoAntigo.getInicioOptional()?.getTime() !== novoPeriodo.getInicioOptional()?.getTime() ||
      periodoAntigo.getFimOptional()?.getTime() !== novoPeriodo.getFimOptional()?.getTime();

    if (!houveAlteracao) {
      return;
    }

    if (!justificativa || !justificativa.trim()) {
      throw new Error('Justificativa é obrigatória para alterar datas');
    }

    this.periodo = novoPeriodo;

    if (usuario) {
      this.registrarAtividade(
        new Atividade(
          randomUUID(),
          TipoAtividade.ALTERACAO_DATAS,
          usuario,
          `Datas alteradas: ${this.formatarPeriodo(periodoAntigo)} -> ${this.formatarPeriodo(novoPeriodo)}. Justificativa: ${justificativa.trim()}`
        )
      );
    }
  }

  // Método para apenas definir data de início
  definirDataInicio(data: Date, usuario?: string): void {
    const novaDataFim = this.periodo.getFimOptional();
    this.alterarDatas(data, novaDataFim, usuario);
  }

  // Método para apenas definir data de fim
  definirDataFim(data: Date, usuario?: string): void {
    const novaDataInicio = this.periodo.getInicioOptional();
    this.alterarDatas(novaDataInicio, data, usuario);
  }

  // Método para remover as datas
  removerDatas(usuario?: string): void {
    this.alterarDatas(undefined, undefined, usuario);
  }

  private formatarPeriodo(periodo: Periodo): string {
    const inicio = periodo.getInicioOptional();
    const fim = periodo.getFimOptional();

    if (!inicio && !fim) return 'sem prazo';
    if (inicio && !fim) return `início: ${inicio.toLocaleDateString()}`;
    if (!inicio && fim) return `fim: ${fim.toLocaleDateString()}`;
    return `${inicio?.toLocaleDateString()} até ${fim?.toLocaleDateString()}`;
  }

  getPeriodo(): Periodo {
    return this.periodo;
  }

  // Verificar se está atrasada
  estaAtrasada(): boolean {
    return this.periodo.estaAtrasado();
  }

  // Dias restantes
  diasRestantes(): number | null {
    return this.periodo.diasRestantes();
  }
}
