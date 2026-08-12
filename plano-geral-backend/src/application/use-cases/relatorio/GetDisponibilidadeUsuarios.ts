import { TarefaComPrazo } from '../../../domain/entities/TarefaComPrazo';
import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { StatusTarefa } from '../../../domain/value-objects/StatusTarefa';
import {
  DisponibilidadeUsuarioDTO,
  RelatorioDisponibilidadeUsuariosDTO,
} from '../../dtos/RelatorioDisponibilidadeUsuariosDTO';
import { RelatorioFiltros } from './RelatorioFiltros';

type Intervalo = {
  tarefaId: string;
  titulo: string;
  inicio: Date;
  fim: Date;
};

export class GetDisponibilidadeUsuarios {
  constructor(
    private tarefaRepository: TarefaRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(filtros: RelatorioFiltros = {}): Promise<RelatorioDisponibilidadeUsuariosDTO> {
    const [tarefas, usuarios] = await Promise.all([
      this.tarefaRepository.list(),
      this.userRepository.findAllActive(),
    ]);

    const hoje = this.inicioDoDia(new Date());

    const usuariosDisponibilidade = usuarios
      .filter((usuario) => !filtros.usuarioId || usuario.id === filtros.usuarioId)
      .map((usuario): DisponibilidadeUsuarioDTO => {
      const tarefasDoUsuario = tarefas.filter(
        (tarefa) =>
          tarefa.obterResponsavel() === usuario.id &&
          tarefa.obterStatus() !== StatusTarefa.CONCLUIDA,
      );

      const intervalos: Intervalo[] = [];
      let tarefasSemData = 0;
      let tarefasAtrasadas = 0;

      tarefasDoUsuario.forEach((tarefa) => {
        if (!(tarefa instanceof TarefaComPrazo)) {
          tarefasSemData += 1;
          return;
        }

        const periodo = tarefa.getPeriodo();
        const dataInicio = periodo.getInicio();
        const dataFim = periodo.getFim();

        if (!dataInicio && !dataFim) {
          tarefasSemData += 1;
          return;
        }

        const inicio = this.inicioDoDia(dataInicio ?? hoje);
        const fim = this.inicioDoDia(dataFim ?? dataInicio ?? hoje);

        if (fim < hoje) {
          tarefasAtrasadas += 1;
          intervalos.push({
            tarefaId: tarefa.id,
            titulo: tarefa.titulo,
            inicio: hoje,
            fim: hoje,
          });
          return;
        }

        intervalos.push({
          tarefaId: tarefa.id,
          titulo: tarefa.titulo,
          inicio: inicio < hoje ? hoje : inicio,
          fim,
        });
      });

      const disponibilidade = this.calcularDisponibilidade(intervalos, hoje);
      const proximaTarefaProgramada = this.obterProximaTarefaProgramada(intervalos, hoje);

      return {
        usuarioId: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tarefasAbertas: tarefasDoUsuario.length,
        tarefasComData: intervalos.length,
        tarefasSemData,
        tarefasAtrasadas,
        ocupadoAte: disponibilidade.ocupadoAte
          ? this.formatDateOnly(disponibilidade.ocupadoAte)
          : null,
        disponivelEm: this.formatDateOnly(disponibilidade.disponivelEm),
        proximaTarefaProgramada: proximaTarefaProgramada
          ? {
            tarefaId: proximaTarefaProgramada.tarefaId,
            titulo: proximaTarefaProgramada.titulo,
            dataInicio: this.formatDateOnly(proximaTarefaProgramada.inicio),
            dataFim: this.formatDateOnly(proximaTarefaProgramada.fim),
          }
          : null,
        statusDisponibilidade: this.definirStatus(
          disponibilidade.disponivelEm,
          hoje,
          tarefasSemData,
          intervalos.length,
        ),
      };
    });

    return {
      totalUsuarios: usuariosDisponibilidade.length,
      usuarios: usuariosDisponibilidade.sort((a, b) =>
        a.disponivelEm.localeCompare(b.disponivelEm),
      ),
    };
  }

  private obterProximaTarefaProgramada(
    intervalos: Intervalo[],
    hoje: Date,
  ): Intervalo | null {
    return [...intervalos]
      .filter((intervalo) => intervalo.inicio > hoje)
      .sort((a, b) => a.inicio.getTime() - b.inicio.getTime())[0] ?? null;
  }

  private calcularDisponibilidade(intervalos: Intervalo[], hoje: Date) {
    if (intervalos.length === 0) {
      return {
        ocupadoAte: null,
        disponivelEm: hoje,
      };
    }

    const ordenados = [...intervalos].sort(
      (a, b) => a.inicio.getTime() - b.inicio.getTime(),
    );

    let cursor = hoje;
    let ocupadoAte: Date | null = null;

    for (const intervalo of ordenados) {
      if (intervalo.inicio > cursor) {
        return {
          ocupadoAte,
          disponivelEm: cursor,
        };
      }

      if (intervalo.fim >= cursor) {
        ocupadoAte = intervalo.fim;
        cursor = this.adicionarDias(intervalo.fim, 1);
      }
    }

    return {
      ocupadoAte,
      disponivelEm: cursor,
    };
  }

  private definirStatus(
    disponivelEm: Date,
    hoje: Date,
    tarefasSemData: number,
    tarefasComData: number,
  ) {
    if (tarefasComData === 0 && tarefasSemData > 0) {
      return 'SEM_DADOS';
    }

    if (disponivelEm.getTime() === hoje.getTime()) {
      return 'DISPONIVEL';
    }

    return 'OCUPADO';
  }

  private inicioDoDia(data: Date): Date {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
  }

  private adicionarDias(data: Date, dias: number): Date {
    const novaData = new Date(data);
    novaData.setDate(novaData.getDate() + dias);
    return novaData;
  }

  private formatDateOnly(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }
}
