import { AdicionarChecklistItem } from '../../../application/use-cases/tarefa/AdicionarChecklistItem';
import { AdicionarComentario } from '../../../application/use-cases/tarefa/AdicionarComentario';
import { AlterarDatasTarefaUseCase } from '../../../application/use-cases/tarefa/AlterarDatasTarefaUseCase';
import { AlterarPrioridadeTarefa } from '../../../application/use-cases/tarefa/AlterarPrioridadeTarefa';
import { AlterarStatusTarefa } from '../../../application/use-cases/tarefa/AlterarStatusTarefa';
import { CreateTarefa } from '../../../application/use-cases/tarefa/CreateTarefa';
import { GetAllTarefas } from '../../../application/use-cases/tarefa/GetAllTarefas';
import { GetAtividadeByTarefa } from '../../../application/use-cases/tarefa/GetAtividadeByTarefa';
import { GetTarefaById } from '../../../application/use-cases/tarefa/GetTarefaById';
import { ResponsavelTarefa } from '../../../application/use-cases/tarefa/ResponsavelTarefa';
import { ToggleChecklistItem } from '../../../application/use-cases/tarefa/ToggleChecklistItem';
import { DeleteTarefa } from '../../../application/use-cases/tarefa/DeleteTarefa';
import { AtividadeTypeORMRepository } from '../../database/typeorm/entities/repositories/AtividadeTypeORMRepository';
import { TarefaTypeORMRepository } from '../../database/typeorm/entities/repositories/TarefaTypeORMRepository';
import { TarefasController } from '../controllers/TarefasController';
import {ProjetoTypeORMRepository} from '../../database/typeorm/entities/repositories/ProjetoTypeORMRepository';
import {UserTypeORMRepository} from '../../database/typeorm/entities/repositories/UserTypeORMRepository';

export function makeTarefaController() {
  const repo = new TarefaTypeORMRepository();
  const projetoRepo = new ProjetoTypeORMRepository();
  const repoAtividade = new AtividadeTypeORMRepository();
  const userRepo = new UserTypeORMRepository();

  return new TarefasController({
    createTarefa: new CreateTarefa(repo, projetoRepo),
    getById: new GetTarefaById(repo, userRepo),
    getAllTarefas: new GetAllTarefas(repo, userRepo),
    addComentario: new AdicionarComentario(repo),
    alterarStatus: new AlterarStatusTarefa(repo),
    getAtividadeByTarefa: new GetAtividadeByTarefa(repoAtividade),
    adicionarChecklistItem: new AdicionarChecklistItem(repo),
    toggleChecklistItem: new ToggleChecklistItem(repo),
    alterarPrioridade: new AlterarPrioridadeTarefa(repo),
    responsavelTarefa: new ResponsavelTarefa(repo, userRepo),
    alterarDatas: new AlterarDatasTarefaUseCase(repo),
    deleteTarefa: new DeleteTarefa(repo),
  });
}
