import { AdicionarComentario } from "../../../application/use-cases/AdicionarComentario";
import { AlterarStatusTarefa } from "../../../application/use-cases/AlterarStatusTarefa";
import { CreateTarefa } from "../../../application/use-cases/CreateTarefa";
import { GetTarefaById } from "../../../application/use-cases/GetTarefaById";
import { TarefaTypeORMRepository } from "../../database/typeorm/entities/repositories/TarefaTypeORMRepository";
import { TarefasController } from "../controllers/TarefasController";

export function makeTarefaController() {
  const repo = new TarefaTypeORMRepository();

  return new TarefasController({
    createTarefa: new CreateTarefa(repo),
    getById: new GetTarefaById(repo),
    addComentario: new AdicionarComentario(repo),
    alterarStatus: new AlterarStatusTarefa(repo),
  })
}
