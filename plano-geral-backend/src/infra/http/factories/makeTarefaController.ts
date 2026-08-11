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
import {NotificacaoTypeORMRepository} from '../../database/typeorm/entities/repositories/NotificacaoTypeORMRepository';
import {NotificacaoService} from '../../../application/services/NotificacaoService';
import { SolicitacaoAlteracaoDatasTypeORMRepository } from '../../database/typeorm/entities/repositories/SolicitacaoAlteracaoDatasTypeORMRepository';
import { SolicitarAlteracaoDatas } from '../../../application/use-cases/tarefa/SolicitarAlteracaoDatas';
import { AprovarAlteracaoDatas } from '../../../application/use-cases/tarefa/AprovarAlteracaoDatas';
import { ReprovarAlteracaoDatas } from '../../../application/use-cases/tarefa/ReprovarAlteracaoDatas';
import { GetSolicitacaoAlteracaoDatas } from '../../../application/use-cases/tarefa/GetSolicitacaoAlteracaoDatas';
import { GetSolicitacaoAlteracaoDatasPendente } from '../../../application/use-cases/tarefa/GetSolicitacaoAlteracaoDatasPendente';
import {
  TituloTarefaCatalogoTypeORMRepository
} from '../../database/typeorm/entities/repositories/TituloTarefaCatalogoTypeORMRepository';
import { MailService } from '../../../application/services/MailService';
import { GestorProjetoNotificacaoService } from '../../../application/services/GestorProjetoNotificacaoService';

export function makeTarefaController() {
  const repo = new TarefaTypeORMRepository();
  const projetoRepo = new ProjetoTypeORMRepository();
  const repoAtividade = new AtividadeTypeORMRepository();
  const userRepo = new UserTypeORMRepository();

  const notificacaoRepository = new NotificacaoTypeORMRepository();
  const notificacaoService = new NotificacaoService(notificacaoRepository);
  const mailService = new MailService();
  const gestorProjetoNotificacaoService = new GestorProjetoNotificacaoService(
    projetoRepo,
    userRepo,
    notificacaoService,
    mailService,
  );
  const solicitacaoAlteracaoDatasRepository =
    new SolicitacaoAlteracaoDatasTypeORMRepository();
  const tituloCatalogoRepo = new TituloTarefaCatalogoTypeORMRepository();


  return new TarefasController({
    createTarefa: new CreateTarefa(repo, projetoRepo, tituloCatalogoRepo),
    getById: new GetTarefaById(repo, userRepo),
    getAllTarefas: new GetAllTarefas(repo, userRepo),
    addComentario: new AdicionarComentario(
      repo,
      notificacaoService,
      userRepo,
      gestorProjetoNotificacaoService,
    ),
    alterarStatus: new AlterarStatusTarefa(repo, {
      gestorProjetoNotificacaoService,
    }),
    getAtividadeByTarefa: new GetAtividadeByTarefa(repoAtividade),
    adicionarChecklistItem: new AdicionarChecklistItem(repo),
    toggleChecklistItem: new ToggleChecklistItem(repo),
    alterarPrioridade: new AlterarPrioridadeTarefa(repo),
    responsavelTarefa: new ResponsavelTarefa(repo, userRepo, notificacaoService),
    alterarDatas: new AlterarDatasTarefaUseCase(repo),
    solicitarAlteracaoDatas: new SolicitarAlteracaoDatas(
      repo,
      userRepo,
      solicitacaoAlteracaoDatasRepository,
      notificacaoService,
      gestorProjetoNotificacaoService,
    ),
    getSolicitacaoAlteracaoDatas: new GetSolicitacaoAlteracaoDatas(
      solicitacaoAlteracaoDatasRepository,
    ),
    getSolicitacaoAlteracaoDatasPendente: new GetSolicitacaoAlteracaoDatasPendente(
      solicitacaoAlteracaoDatasRepository,
    ),
    aprovarAlteracaoDatas: new AprovarAlteracaoDatas(
      repo,
      solicitacaoAlteracaoDatasRepository,
      notificacaoService,
    ),
    reprovarAlteracaoDatas: new ReprovarAlteracaoDatas(
      repo,
      solicitacaoAlteracaoDatasRepository,
      notificacaoService,
    ),
    deleteTarefa: new DeleteTarefa(repo, notificacaoService),
  });
}
