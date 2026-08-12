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
import { DeleteTarefa } from '../../../application/use-cases/tarefa/DeleteTarefa';
import { SolicitarAlteracaoDatas } from '../../../application/use-cases/tarefa/SolicitarAlteracaoDatas';
import { AprovarAlteracaoDatas } from '../../../application/use-cases/tarefa/AprovarAlteracaoDatas';
import { ReprovarAlteracaoDatas } from '../../../application/use-cases/tarefa/ReprovarAlteracaoDatas';
import { GetSolicitacaoAlteracaoDatas } from '../../../application/use-cases/tarefa/GetSolicitacaoAlteracaoDatas';
import { GetSolicitacaoAlteracaoDatasPendente } from '../../../application/use-cases/tarefa/GetSolicitacaoAlteracaoDatasPendente';
import { SolicitacaoAlteracaoDatasDTO } from '../../../application/dtos/SolicitacaoAlteracaoDatasDTO';


interface CriarTarefaBody {
  titulo: string;
  tituloCatalogoId?: string | null;
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
  solicitarAlteracaoDatas: SolicitarAlteracaoDatas;
  getSolicitacaoAlteracaoDatas: GetSolicitacaoAlteracaoDatas;
  getSolicitacaoAlteracaoDatasPendente: GetSolicitacaoAlteracaoDatasPendente;
  aprovarAlteracaoDatas: AprovarAlteracaoDatas;
  reprovarAlteracaoDatas: ReprovarAlteracaoDatas;
  deleteTarefa: DeleteTarefa;
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

function podeAprovarAlteracaoDatas(perfil?: string): boolean {
  return ['ADMIN', 'MANAGER', 'GESTOR'].includes(
    String(perfil ?? '').toUpperCase(),
  );
}

export class TarefasController {
  constructor(private deps: Deps) {}

  async criar(req: Request<{}, {}, CriarTarefaBody>, res: Response) {
    const { titulo, descricao, projetoId, tituloCatalogoId  } = req.body;

    const tarefa = await this.deps.createTarefa.execute({
      titulo,
      tituloCatalogoId,
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
    try {
      await this.validarAcessoTarefa(req, req.params.id);

      const tarefa = await this.deps.addComentario.execute({
        tarefaId: req.params.id,
        comentario: req.body.comentario,
        usuarioId: getAuthenticatedUserId(req),
        usuarioNome: getAuthenticatedUser(req),
      });

      return res.json(TarefaDTO.fromDomain(tarefa));
    } catch (error: any) {
      return res.status(403).json({ error: error.message });
    }
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
    try {
      await this.validarAcessoTarefa(req, req.params.id);

      const tarefa = await this.deps.adicionarChecklistItem.execute({
        tarefaId: req.params.id,
        nome: req.body.nome,
      });

      return res.json(TarefaDTO.fromDomain(tarefa));
    } catch (error: any) {
      return res.status(403).json({ error: error.message });
    }
  }

  async toggleChecklistItem(req: Request, res: Response) {
    try {
      await this.validarAcessoTarefa(req, req.params.id);

      const tarefa = await this.deps.toggleChecklistItem.execute({
        tarefaId: req.params.id,
        checklistItemId: req.params.itemId,
      });

      return res.json(TarefaDTO.fromDomain(tarefa));
    } catch (error: any) {
      return res.status(403).json({ error: error.message });
    }
  }

  async alterarPrioridade(req: Request, res: Response) {
    try {
      const { novaPrioridade } = req.body;

      if (!isPrioridade(novaPrioridade)) {
        return res.status(400).json({ message: 'Prioridade inválida' });
      }

      await this.validarAcessoTarefa(req, req.params.id);

      const tarefa = await this.deps.alterarPrioridade.execute({
        tarefaId: req.params.id,
        novaPrioridade,
        usuario: getAuthenticatedUser(req),
      });

      return res.json(TarefaDTO.fromDomain(tarefa));
    } catch (error: any) {
      return res.status(403).json({ error: error.message });
    }
  }

  async alterarStatus(req: Request, res: Response) {
    try {
      const { novoStatus } = req.body;

      if (!isStatusTarefa(novoStatus)) {
        return res.status(400).json({ message: 'Status inválido' });
      }

      await this.validarAcessoTarefa(req, req.params.id);

      const tarefa = await this.deps.alterarStatus.execute({
        tarefaId: req.params.id,
        novoStatus,
        usuario: getAuthenticatedUser(req),
        usuarioId: getAuthenticatedUserId(req),
      });

      return res.json(TarefaDTO.fromDomain(tarefa));
    } catch (error: any) {
      return res.status(403).json({ error: error.message });
    }
  }

  async atribuirResponsavel(req: Request, res: Response) {
    try {
      const { responsavelId } = req.body;

      if (!responsavelId || !String(responsavelId).trim()) {
        return res.status(400).json({
          error: 'Responsável é obrigatório',
        });
      }

      await this.validarAcessoTarefa(req, req.params.id);

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
      await this.validarAcessoTarefa(req, req.params.id);

      if (!podeAprovarAlteracaoDatas(req.user?.perfil)) {
        const tarefaAtual = await this.deps.getById.execute({
          id: req.params.id,
          usuarioId: req.user.id,
          usuarioNome: req.user.nome,
          perfil: req.user.perfil,
        });

        if (tarefaAtual.dataInicio || tarefaAtual.dataFim) {
          return res.status(403).json({
            error: 'Alteração de datas precisa ser aprovada por um gestor ou administrador',
          });
        }
      }

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

  async solicitarAlteracaoDatas(req: Request, res: Response): Promise<Response> {
    try {
      const { dataInicio, dataFim, justificativa } = req.body;

      await this.validarAcessoTarefa(req, req.params.id);

      const solicitacao = await this.deps.solicitarAlteracaoDatas.execute({
        tarefaId: req.params.id,
        dataInicio: parseDateOnly(dataInicio),
        dataFim: parseDateOnly(dataFim),
        justificativa,
        solicitanteId: getAuthenticatedUserId(req),
        solicitanteNome: getAuthenticatedUser(req),
      });

      return res.status(201).json({
        id: solicitacao.id,
        status: solicitacao.obterStatus(),
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async buscarSolicitacaoAlteracaoDatas(req: Request, res: Response): Promise<Response> {
    try {
      const solicitacao = await this.deps.getSolicitacaoAlteracaoDatas.execute({
        solicitacaoId: req.params.solicitacaoId,
      });

      if (!podeAprovarAlteracaoDatas(req.user?.perfil)) {
        await this.validarAcessoTarefa(req, solicitacao.tarefaId);
      }

      return res.json(SolicitacaoAlteracaoDatasDTO.fromDomain(solicitacao));
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  async buscarSolicitacaoAlteracaoDatasPendente(req: Request, res: Response): Promise<Response> {
    try {
      await this.deps.getById.execute({
        id: req.params.id,
        usuarioId: req.user.id,
        usuarioNome: req.user.nome,
        perfil: req.user.perfil,
      });

      const solicitacao =
        await this.deps.getSolicitacaoAlteracaoDatasPendente.execute({
          tarefaId: req.params.id,
          solicitanteId: getAuthenticatedUserId(req),
        });

      return res.json(
        solicitacao ? SolicitacaoAlteracaoDatasDTO.fromDomain(solicitacao) : null,
      );
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async aprovarAlteracaoDatas(req: Request, res: Response): Promise<Response> {
    try {
      if (!podeAprovarAlteracaoDatas(req.user?.perfil)) {
        return res.status(403).json({
          error: 'Aprovação permitida apenas para gestor ou administrador',
        });
      }

      const tarefa = await this.deps.aprovarAlteracaoDatas.execute({
        solicitacaoId: req.params.solicitacaoId,
        aprovadorId: getAuthenticatedUserId(req),
        aprovadorNome: getAuthenticatedUser(req),
      });

      return res.json(TarefaDTO.fromDomain(tarefa));
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async reprovarAlteracaoDatas(req: Request, res: Response): Promise<Response> {
    try {
      if (!podeAprovarAlteracaoDatas(req.user?.perfil)) {
        return res.status(403).json({
          error: 'Reprovação permitida apenas para gestor ou administrador',
        });
      }

      await this.deps.reprovarAlteracaoDatas.execute({
        solicitacaoId: req.params.solicitacaoId,
        aprovadorId: getAuthenticatedUserId(req),
        aprovadorNome: getAuthenticatedUser(req),
      });

      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async excluir(req: Request, res: Response): Promise<Response> {
    try {
      await this.deps.getById.execute({
        id: req.params.id,
        usuarioId: req.user.id,
        usuarioNome: req.user.nome,
        perfil: req.user.perfil,
      });

      await this.deps.deleteTarefa.execute({
        tarefaId: req.params.id,
        usuarioId: req.user.id,
      });

      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  private async validarAcessoTarefa(req: Request, tarefaId: string): Promise<void> {
    await this.deps.getById.execute({
      id: tarefaId,
      usuarioId: req.user.id,
      usuarioNome: req.user.nome,
      perfil: req.user.perfil,
    });
  }
}
