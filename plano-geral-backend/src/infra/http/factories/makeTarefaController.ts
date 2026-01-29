import { AdicionarComentario } from "../../../application/use-cases/AdicionarComentario";
import { AlterarStatusTarefa } from "../../../application/use-cases/AlterarStatusTarefa";
import { CreateTarefa } from "../../../application/use-cases/CreateTarefa";
import { GetAllTarefas } from "../../../application/use-cases/GetAllTarefas";
import { GetAtividadeByTarefa } from "../../../application/use-cases/GetAtividadeByTarefa";
import { GetTarefaById } from "../../../application/use-cases/GetTarefaById";
import { AtividadeTypeORMRepository } from "../../database/typeorm/entities/repositories/AtividadeTypeORMRepository";
import { TarefaTypeORMRepository } from "../../database/typeorm/entities/repositories/TarefaTypeORMRepository";
import { TarefasController } from "../controllers/TarefasController";

export function makeTarefaController() {
  const repo = new TarefaTypeORMRepository();
  const repoAtividade = new AtividadeTypeORMRepository();

  return new TarefasController({
    createTarefa: new CreateTarefa(repo),
    getById: new GetTarefaById(repo),
    getAllTarefas: new GetAllTarefas(repo),
    addComentario: new AdicionarComentario(repo),
    alterarStatus: new AlterarStatusTarefa(repo),
    getAtividadeByTarefa: new GetAtividadeByTarefa(repoAtividade)
  })
}
