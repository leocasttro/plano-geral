import { Request, Response } from 'express';
import { TituloTarefaCatalogoDTO } from '../../../application/dtos/TituloTarefaCatalogoDTO';
import { ListarTitulosTarefaCatalogo } from '../../../application/use-cases/titulo-tarefa/ListarTitulosTarefaCatalogo';

type Deps = {
  listarTitulos: ListarTitulosTarefaCatalogo;
};

export class TitulosTarefaController {
  constructor(private deps: Deps) {}

  async listar(req: Request, res: Response) {
    try {
      const titulos = await this.deps.listarTitulos.execute({
        busca: this.getQueryParam(req.query.busca),
        acao: this.getQueryParam(req.query.acao),
        componente: this.getQueryParam(req.query.componente),
        atividadePrincipal: this.getQueryParam(req.query.atividadePrincipal),
        subatividade: this.getQueryParam(req.query.subatividade),
      });

      return res.json(titulos.map(TituloTarefaCatalogoDTO.fromDomain));
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  private getQueryParam(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }
}
