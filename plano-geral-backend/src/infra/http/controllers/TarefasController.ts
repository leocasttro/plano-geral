import { AdicionarChecklistItem } from './../../../application/use-cases/tarefa/AdicionarChecklistItem';
import { Request, Response } from 'express';
import { TarefaDTO } from '../../../application/dtos/TarefaDTO';
import { AtividadeDTO } from '../../../application/dtos/AtividadeDTO';
import { CreateTarefa } from '../../../application/use-cases/tarefa/CreateTarefa';
import { GetTarefaById } from '../../../application/use-cases/tarefa/GetTarefaById';
import { GetAllTarefas } from '../../../application/use-cases/tarefa/GetAllTarefas';
import { AdicionarComentario } from '../../../application/use-cases/tarefa/AdicionarComentario';
import { AlterarStatusTarefa } from '../../../application/use-cases/tarefa/AlterarStatusTarefa';
import { GetAtividadeByTarefa } from '../../../application/use-cases/tarefa/GetAtividadeByTarefa';
import { ToggleChecklistItem } from '../../../application/use-cases/tarefa/ToggleChecklistItem';
import { AlterarPrioridadeTarefa } from '../../../application/use-cases/tarefa/AlterarPrioridadeTarefa';
import { Prioridade } from '../../../domain/value-objects/Prioridade';
import { StatusTarefa } from '../../../domain/value-objects/StatusTarefa';
import { ResponsavelTarefa } from '../../../application/use-cases/tarefa/ResponsavelTarefa';
import { AlterarDatasTarefaUseCase } from '../../../application/use-cases/tarefa/AlterarDatasTarefaUseCase';
import {getAuthenticatedUser, getAuthenticatedUserId} from '../helpers/getAuthenticatedUser';


interface CriarTarefaBody {
  titulo: string;
  descricao?: string;
  projetoId: string;
}

type Deps = {
  createTarefa: CreateTarefa;
  getById: GetTarefaById;
  getAllTarefas: GetAllTarefas;
  addComentario: AdicionarComentario;
  alterarStatus: AlterarStatusTarefa;
  getAtividadeByTarefa: GetAtividadeByTarefa;
  adicionarChecklistItem: AdicionarChecklistItem;
  toggleChecklistItem: ToggleChecklistItem;
  alterarPrioridade: AlterarPrioridadeTarefa;
  responsavelTarefa: ResponsavelTarefa;
  alterarDatas: AlterarDatasTarefaUseCase; // NOVO
};

function parseDateOnly(value?: string): Date | undefined {
  if (!value) return undefined;

  const [ano, mes, dia] = value.split('T')[0].split('-').map(Number);

  return new Date(ano, mes - 1, dia);
}

function isPrioridade(valor: any): valor is Prioridade {
  return (
    valor === 'BAIXA' ||
    valor === 'NORMAL' ||
    valor === 'ALTA' ||
    valor === 'CRITICA'
  );
}

function isStatusTarefa(valor: any): valor is StatusTarefa {
  return (
    valor === StatusTarefa.PENDENTE ||
    valor === StatusTarefa.EM_ANDAMENTO ||
    valor === StatusTarefa.CONCLUIDA
  );
}

export class TarefasController {
  constructor(private deps: Deps) {}

  async criar(req: Request<{}, {}, CriarTarefaBody>, res: Response) {
    const { titulo, descricao, projetoId } = req.body;

    const tarefa = await this.deps.createTarefa.execute({
      titulo,
      descricao,
      projetoId,
      usuario: getAuthenticatedUserId(req),
      usuarioNome: getAuthenticatedUser(req),
    });

    return res.status(201).json(TarefaDTO.fromDomain(tarefa));
  }

  async buscarTodas(req: Request, res: Response) {
    const tarefas = await this.deps.getAllTarefas.execute({
      usuarioId: req.user.id,
      usuarioNome: req.user.nome,
      perfil: req.user.perfil,
    });
    return res.json(tarefas);
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const tarefa = await this.deps.getById.execute({
        id: req.params.id,
        usuarioId: req.user.id,
        usuarioNome: req.user.nome,
        perfil: req.user.perfil,
      });
      return res.json(tarefa);
    } catch (error: any) {
      return res.status(403).json({ error: error.message });
    }
  }

  async adicionarComentario(req: Request, res: Response) {
    const tarefa = await this.deps.addComentario.execute({
      tarefaId: req.params.id,
      comentario: req.body.comentario,
      usuario: req.body.usuario,
    });

    return res.json(TarefaDTO.fromDomain(tarefa));
  }

  async buscarAtividades(req: Request, res: Response) {
    try {
      await this.deps.getById.execute({
        id: req.params.id,
        usuarioId: req.user.id,
        usuarioNome: req.user.nome,
        perfil: req.user.perfil,
      });

      const atividades = await this.deps.getAtividadeByTarefa.execute({
        tarefaId: req.params.id,
      });

      return res.json(atividades.map(AtividadeDTO.fromDomain));
    } catch (error: any) {
      return res.status(403).json({ error: error.message });
    }
  }

  async AdicionarChecklistLitem(req: Request, res: Response) {
    const tarefa = await this.deps.adicionarChecklistItem.execute({
      tarefaId: req.params.id,
      nome: req.body.nome,
    });

    return res.json(TarefaDTO.fromDomain(tarefa));
  }

  async toggleChecklistItem(req: Request, res: Response) {
    const tarefa = await this.deps.toggleChecklistItem.execute({
      tarefaId: req.params.id,
      checklistItemId: req.params.itemId,
    });

    return res.json(TarefaDTO.fromDomain(tarefa));
  }

  async alterarPrioridade(req: Request, res: Response) {
    const { novaPrioridade } = req.body;

    if (!isPrioridade(novaPrioridade)) {
      return res.status(400).json({ message: 'Prioridade inválida' });
    }

    const tarefa = await this.deps.alterarPrioridade.execute({
      tarefaId: req.params.id,
      novaPrioridade,
      usuario: getAuthenticatedUser(req),
    });

    return res.json(TarefaDTO.fromDomain(tarefa));
  }

  async alterarStatus(req: Request, res: Response) {
    const { novoStatus } = req.body;

    if (!isStatusTarefa(novoStatus)) {
      return res.status(400).json({ message: 'Status inválido' });
    }

    const tarefa = await this.deps.alterarStatus.execute({
      tarefaId: req.params.id,
      novoStatus,
      usuario: getAuthenticatedUser(req),
    });

    return res.json(TarefaDTO.fromDomain(tarefa));
  }

  async atribuirResponsavel(req: Request, res: Response) {
    try {
      const { responsavelId } = req.body;

      if (!responsavelId || !String(responsavelId).trim()) {
        return res.status(400).json({
          error: 'Responsável é obrigatório',
        });
      }

      const result = await this.deps.responsavelTarefa.execute({
        tarefaId: req.params.id,
        responsavelId,
        usuario: getAuthenticatedUserId(req),
      });

      return res.json(TarefaDTO.fromDomain(result.tarefa, result.responsavel));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async alterarDatas(req: Request, res: Response): Promise<Response> {
    try {
      const { dataInicio, dataFim, justificativa } = req.body;

      if (dataInicio === undefined && dataFim === undefined) {
        return res.status(400).json({
          error: 'Forneça pelo menos uma data (dataInicio ou dataFim)',
        });
      }

      const tarefa = await this.deps.alterarDatas.execute({
        tarefaId: req.params.id,
        dataInicio: parseDateOnly(dataInicio),
        dataFim: parseDateOnly(dataFim),
        usuario: getAuthenticatedUser(req),
        justificativa,
      });

      return res.status(200).json(TarefaDTO.fromDomain(tarefa));
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
