import {ProjetoTypeORMRepository} from '../../database/typeorm/entities/repositories/ProjetoTypeORMRepository';
import {ProjetosController} from '../controllers/ProjetosController';
import {CreateProjeto} from '../../../application/use-cases/projeto/CreateProjeto';
import {GetAllProjetos} from '../../../application/use-cases/projeto/GetAllProjetos';
import {GetProjetoById} from '../../../application/use-cases/projeto/GetProjetoById';
import {UpdateProjetoStatus} from '../../../application/use-cases/projeto/UpdateProjetoStatus';
import {UserTypeORMRepository} from '../../database/typeorm/entities/repositories/UserTypeORMRepository';

export function makeProjetoController() {
  const repo = new ProjetoTypeORMRepository();
  const userRepo = new UserTypeORMRepository();

  return new ProjetosController({
    createProjeto: new CreateProjeto(repo, userRepo),
    getAllProjetos: new GetAllProjetos(repo),
    getProjetoById: new GetProjetoById(repo),
    updateProjetoStatus: new UpdateProjetoStatus(repo),
  });
}
