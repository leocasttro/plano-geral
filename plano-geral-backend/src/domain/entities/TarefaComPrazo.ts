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
    private periodo: Periodo  // Agora é mutável (remova o readonly)
  ) {
    super(id, titulo, descricao);
  }

  // Método para alterar as datas de uma tarefa existente
  alterarDatas(novaDataInicio?: Date, novaDataFim?: Date, usuario?: string): void {
    // Validações
    if (this.obterStatus() === StatusTarefa.CONCLUIDA) {
      throw new Error('Não é possível alterar datas de uma tarefa concluída');
    }

    const periodoAntigo = this.periodo;

    // Criar novo período com as novas datas (ou manter as antigas)
    const novoPeriodo = new Periodo(
      novaDataInicio ?? periodoAntigo.getInicioOptional(),
      novaDataFim ?? periodoAntigo.getFimOptional()
    );

    // Validar o novo período
    novoPeriodo.validar(); // Adicione este método no Periodo

    // Atualizar
    this.periodo = novoPeriodo;

    // Registrar atividade se tiver usuário
    if (usuario) {
      this.registrarAtividade(
        new Atividade(
          randomUUID(),
          TipoAtividade.ALTERACAO_DATAS,
          usuario,
          `Datas alteradas: ${this.formatarPeriodo(periodoAntigo)} -> ${this.formatarPeriodo(novoPeriodo)}`
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
