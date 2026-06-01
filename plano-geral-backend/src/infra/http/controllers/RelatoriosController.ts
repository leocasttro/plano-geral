import { Request, Response } from 'express';
import { GetTempoTarefaPorResponsavel } from '../../../application/use-cases/relatorio/GetTempoTarefaPorResponsavel';
import {GetAlteracoesDatasTarefa} from '../../../application/use-cases/relatorio/GetAlteracoesDatasTarefa';
import {GetResumoProjeto} from '../../../application/use-cases/relatorio/GetResumoProjeto';
import {GetCargaUsuarios} from '../../../application/use-cases/relatorio/GetCargaUsuarios';
import {GetDashboardRelatorio} from '../../../application/use-cases/relatorio/GetDashboardRelatorio';

type Deps = {
  getTempoTarefaPorResponsavel: GetTempoTarefaPorResponsavel;
  getAlteracoesDatasTarefa: GetAlteracoesDatasTarefa;
  getResumoProjeto: GetResumoProjeto;
  getCargaUsuarios: GetCargaUsuarios;
  getDashboardRelatorio: GetDashboardRelatorio;
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
      const resultado = await this.deps.getDashboardRelatorio.execute();

      return res.json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
