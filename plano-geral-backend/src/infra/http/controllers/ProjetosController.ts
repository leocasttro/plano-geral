import { Request, Response } from 'express';
import { ProjetoDTO } from '../../../application/dtos/ProjetoDTO';
import { CreateProjeto } from '../../../application/use-cases/projeto/CreateProjeto';
import { StatusProjeto } from '../../../domain/value-objects/StatusProjeto';
import {GetAllProjetos} from '../../../application/use-cases/projeto/GetAllProjetos';
import {GetProjetoById} from '../../../application/use-cases/projeto/GetProjetoById';
import {UpdateProjetoStatus} from '../../../application/use-cases/projeto/UpdateProjetoStatus';

interface CriarProjetoBody {
  nome: string;
  descricao?: string;
}

interface AtualizarStatus {
  status: string;
  usuario: string;
}

interface AdicionarTarefaBody {
  tarefaId: string;
  usuario: string;
}

type Deps = {
  createProjeto: CreateProjeto;
  getAllProjetos: GetAllProjetos;
  getProjetoById: GetProjetoById;
  updateProjetoStatus: UpdateProjetoStatus;
};

function isStatusProjeto(valor: any): valor is StatusProjeto {
  return (
    valor === 'ATIVO' ||
    valor === 'PAUSADO' ||
    valor === 'CONCLUIDO' ||
    valor === 'CANCELADO'
  );
}

export class ProjetosController {
  constructor(private deps: Deps) {}

  async criar(req: Request<{}, {}, CriarProjetoBody>, res: Response) {
    try {
      const { nome, descricao } = req.body;

      if (!nome || nome.trim().length === 0) {
        return res.status(400).json({ error: 'Nome do projeto é obrigatório' });
      }

      const projeto = await this.deps.createProjeto.execute({
        nome,
        descricao,
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
    const { status } = req.body;

    if (!isStatusProjeto(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const projeto = await this.deps.updateProjetoStatus.execute({
      projetoId: req.params.id,
      status,
      usuario: req.user!.id,
    });

    return res.json(ProjetoDTO.fromDomain(projeto));
  }
}
