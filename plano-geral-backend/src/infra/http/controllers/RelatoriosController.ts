import { Request, Response } from 'express';
import { GetTempoTarefaPorResponsavel } from '../../../application/use-cases/relatorio/GetTempoTarefaPorResponsavel';
import {GetAlteracoesDatasTarefa} from '../../../application/use-cases/relatorio/GetAlteracoesDatasTarefa';
import {GetResumoProjeto} from '../../../application/use-cases/relatorio/GetResumoProjeto';
import {GetCargaUsuarios} from '../../../application/use-cases/relatorio/GetCargaUsuarios';
import {GetDashboardRelatorio} from '../../../application/use-cases/relatorio/GetDashboardRelatorio';
import { GetMetricasProjetos } from "../../../application/use-cases/relatorio/GetMetricasProjetos";
import { GetCalendarioTarefas } from '../../../application/use-cases/relatorio/GetCalendarioTarefas';
import {GetTempoConclusaoPorTitulo} from '../../../application/use-cases/relatorio/GetTempoConclusaoPorTitulo';
import { GetTempoMedioPorTitulo } from '../../../application/use-cases/relatorio/GetTempoMedioPorTitulo';
import {GetLeadTimeRelatorio} from '../../../application/use-cases/GetLeadTimeRelatorio';

type Deps = {
  getTempoTarefaPorResponsavel: GetTempoTarefaPorResponsavel;
  getAlteracoesDatasTarefa: GetAlteracoesDatasTarefa;
  getResumoProjeto: GetResumoProjeto;
  getCargaUsuarios: GetCargaUsuarios;
  getDashboardRelatorio: GetDashboardRelatorio;
  getMetricasProjetos: GetMetricasProjetos;
  getCalendarioTarefas: GetCalendarioTarefas;
  getTempoConclusaoPorTitulo: GetTempoConclusaoPorTitulo;
  getTempoMedioPorTitulo: GetTempoMedioPorTitulo;
  getLeadTimeRelatorio: GetLeadTimeRelatorio;
};

export class RelatoriosController {
  constructor(private deps: Deps) {}

  async tempoTarefaPorResponsavel(req: Request, res: Response) {
    try {
      const resultado = await this.deps.getTempoTarefaPorResponsavel.execute(
        req.params.tarefaId,
      );

      return res.json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async alteracoesDatasTarefa(req: Request, res: Response) {
    try {
      const resultado = await this.deps.getAlteracoesDatasTarefa.execute(
        req.params.tarefaId,
      );
      return res.json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async resumoProjeto(req: Request, res: Response) {
    try {
      const resultado = await this.deps.getResumoProjeto.execute(
        req.params.projetoId,
      );

      return res.json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async cargaUsuarios(req: Request, res: Response) {
    try {
      const resultado = await this.deps.getCargaUsuarios.execute();

      return res.json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async dashboard(req: Request, res: Response) {
    try {
      const periodo = this.getQueryParam(req.query.periodo);

      const periodoValido =
        periodo === '15d' ||
        periodo === '30d' ||
        periodo === '90d' ||
        periodo === 'ano'
          ? periodo
          : '15d';

      const resultado = await this.deps.getDashboardRelatorio.execute(periodoValido);

      return res.json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async metricasProjetos(req: Request, res: Response) {
    try {
      const resultado = await this.deps.getMetricasProjetos.execute();

      return res.json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async tempoMedioPorTitulo(req: Request, res: Response) {
    try {
      const resultado = await this.deps.getTempoMedioPorTitulo.execute();

      return res.json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async calendarioTarefas(req: Request, res: Response) {
    try {
      const resultado = await this.deps.getCalendarioTarefas.execute({
        projetoId: this.getQueryParam(req.query.projetoId),
        inicio: this.getQueryParam(req.query.inicio),
        fim: this.getQueryParam(req.query.fim),
      });

      return res.json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  private getQueryParam(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  async tempoConclusaoPorTitulo(req: Request, res: Response) {
    try {
      const resultado = await this.deps.getTempoConclusaoPorTitulo.execute(
        this.getQueryParam(req.query.titulo) ?? '',
      );

      return res.json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async leadTime(req: Request, res: Response) {
    try {
      const resultado = await this.deps.getLeadTimeRelatorio.execute();
      return res.json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
