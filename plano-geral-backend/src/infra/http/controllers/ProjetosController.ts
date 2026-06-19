import { Request, Response } from 'express';
import { ProjetoDTO } from '../../../application/dtos/ProjetoDTO';
import { CreateProjeto } from '../../../application/use-cases/projeto/CreateProjeto';
import {GetAllProjetos} from '../../../application/use-cases/projeto/GetAllProjetos';
import {GetProjetoById} from '../../../application/use-cases/projeto/GetProjetoById';
import {UpdateProjetoStatus} from '../../../application/use-cases/projeto/UpdateProjetoStatus';
import {isStatusProjeto} from '../validators/projetoValidators';
import {getAuthenticatedUser} from '../helpers/getAuthenticatedUser';

interface CriarProjetoBody {
  nome: string;
  descricao?: string;
  centroCusto?: string;
  coordenadorId?: string;
}

type Deps = {
  createProjeto: CreateProjeto;
  getAllProjetos: GetAllProjetos;
  getProjetoById: GetProjetoById;
  updateProjetoStatus: UpdateProjetoStatus;
};

export class ProjetosController {
  constructor(private deps: Deps) {}

  async criar(req: Request<{}, {}, CriarProjetoBody>, res: Response) {
    try {
      const projeto = await this.deps.createProjeto.execute({
        nome: req.body.nome,
        descricao: req.body.descricao,
        centroCusto: req.body.centroCusto,
        coordenadorId: req.body.coordenadorId,
      });

      return res.status(201).json(ProjetoDTO.fromDomain(projeto));
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async listar(req: Request, res: Response) {
    const projetos = await this.deps.getAllProjetos.execute();
    return res.json(projetos.map(ProjetoDTO.fromDomain));
  }

  async buscarPorId(req: Request, res: Response) {
    const projeto = await this.deps.getProjetoById.execute(req.params.id);
    return res.json(ProjetoDTO.fromDomain(projeto));
  }

  async atualizarStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;

      if (!isStatusProjeto(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }

      const projeto = await this.deps.updateProjetoStatus.execute({
        projetoId: req.params.id,
        status,
        usuario: getAuthenticatedUser(req),
      });

      return res.json(ProjetoDTO.fromDomain(projeto));
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async criarVarios(req: Request, res: Response) {
    try {
      if (!Array.isArray(req.body)) {
        return res.status(400).json({ error: 'Envie uma lista de projetos' });
      }

      const projetos = [];

      for (const item of req.body) {
        const projeto = await this.deps.createProjeto.execute({
          nome: item.nome,
          descricao: item.descricao,
          centroCusto: item.centroCusto,
          coordenadorId: item.coordenadorId,
        });

        projetos.push(ProjetoDTO.fromDomain(projeto));
      }

      return res.status(201).json(projetos);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
