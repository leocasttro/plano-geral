import { AdicionarChecklistLitem } from './../../../application/use-cases/tarefa/AdicionarChecklistItem';
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
import { TarefaComPrazo } from '../../../domain/entities/TarefaComPrazo'; // NOVO
import { AlterarDatasTarefaUseCase } from '../../../application/use-cases/tarefa/AlterarDatasTarefaUseCase';

interface CriarTarefaBody {
  titulo: string;
  descricao?: string;
}

type Deps = {
  createTarefa: CreateTarefa;
  getById: GetTarefaById;
  getAllTarefas: GetAllTarefas;
  addComentario: AdicionarComentario;
  alterarStatus: AlterarStatusTarefa;
  getAtividadeByTarefa: GetAtividadeByTarefa;
  adicionarChecklistItem: AdicionarChecklistLitem;
  toggleChecklistItem: ToggleChecklistItem;
  alterarPrioridade: AlterarPrioridadeTarefa;
  responsavelTarefa: ResponsavelTarefa;
  alterarDatas: AlterarDatasTarefaUseCase; // NOVO
};

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
    const { titulo, descricao } = req.body;

    const tarefa = await this.deps.createTarefa.execute({ titulo, descricao });

    return res.status(201).json(TarefaDTO.fromDomain(tarefa));
  }

  async buscarTodas(req: Request, res: Response) {
    const tarefas = await this.deps.getAllTarefas.execute();
    return res.json(tarefas.map(TarefaDTO.fromDomain));
  }

  async buscarPorId(req: Request, res: Response) {
    const tarefa = await this.deps.getById.execute(req.params.id);
    return res.json(TarefaDTO.fromDomain(tarefa));
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
    const atividades = await this.deps.getAtividadeByTarefa.execute({
      tarefaId: req.params.id,
    });

    return res.json(atividades.map(AtividadeDTO.fromDomain));
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
    const { novaPrioridade, usuario } = req.body;

    if (!isPrioridade(novaPrioridade)) {
      return res.status(400).json({ message: 'Prioridade inválida' });
    }
    if (!usuario || !String(usuario).trim()) {
      return res.status(400).json({ message: 'Usuário é obrigatório' });
    }

    const tarefa = await this.deps.alterarPrioridade.execute({
      tarefaId: req.params.id,
      novaPrioridade,
      usuario,
    });

    return res.json(TarefaDTO.fromDomain(tarefa));
  }

  async alterarStatus(req: Request, res: Response) {
    const { novoStatus, usuario } = req.body;

    if (!isStatusTarefa(novoStatus)) {
      return res.status(400).json({ message: 'Status inválido' });
    }

    if (!usuario || !String(usuario).trim()) {
      return res.status(400).json({ message: 'Usuário é obrigatório' });
    }

    const tarefa = await this.deps.alterarStatus.execute({
      tarefaId: req.params.id,
      novoStatus,
      usuario,
    });

    return res.json(TarefaDTO.fromDomain(tarefa));
  }

  async atribuirResponsavel(req: Request, res: Response) {
    try {
      const { responsavel, usuario } = req.body;

      const result = await this.deps.responsavelTarefa.execute({
        tarefaId: req.params.id,
        responsavel,
        usuario,
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async alterarDatas(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { dataInicio, dataFim, usuario } = req.body;

      if (!usuario || !String(usuario).trim()) {
        return res.status(400).json({ error: 'Usuário é obrigatório' });
      }

      if (dataInicio === undefined && dataFim === undefined) {
        return res.status(400).json({
          error: 'Forneça pelo menos uma data (dataInicio ou dataFim)'
        });
      }

      const tarefa = await this.deps.alterarDatas.execute({
        tarefaId: id,
        dataInicio: dataInicio ? new Date(dataInicio) : undefined,
        dataFim: dataFim ? new Date(dataFim) : undefined,
        usuario,
      });

      return res.status(200).json({
        message: 'Datas alteradas com sucesso',
        tarefa: {
          id: tarefa.id,
          titulo: tarefa.titulo,
          dataInicio: tarefa instanceof TarefaComPrazo ? tarefa.getPeriodo().getInicio() : null,
          dataFim: tarefa instanceof TarefaComPrazo ? tarefa.getPeriodo().getFim() : null,
        },
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
