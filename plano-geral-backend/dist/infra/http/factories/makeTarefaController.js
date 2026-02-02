"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeTarefaController = makeTarefaController;
const AdicionarChecklistItem_1 = require("../../../application/use-cases/tarefa/AdicionarChecklistItem");
const AdicionarComentario_1 = require("../../../application/use-cases/tarefa/AdicionarComentario");
const AlterarPrioridadeTarefa_1 = require("../../../application/use-cases/tarefa/AlterarPrioridadeTarefa");
const AlterarStatusTarefa_1 = require("../../../application/use-cases/tarefa/AlterarStatusTarefa");
const CreateTarefa_1 = require("../../../application/use-cases/tarefa/CreateTarefa");
const GetAllTarefas_1 = require("../../../application/use-cases/tarefa/GetAllTarefas");
const GetAtividadeByTarefa_1 = require("../../../application/use-cases/tarefa/GetAtividadeByTarefa");
const GetTarefaById_1 = require("../../../application/use-cases/tarefa/GetTarefaById");
const ToggleChecklistItem_1 = require("../../../application/use-cases/tarefa/ToggleChecklistItem");
const AtividadeTypeORMRepository_1 = require("../../database/typeorm/entities/repositories/AtividadeTypeORMRepository");
const TarefaTypeORMRepository_1 = require("../../database/typeorm/entities/repositories/TarefaTypeORMRepository");
const TarefasController_1 = require("../controllers/TarefasController");
function makeTarefaController() {
    const repo = new TarefaTypeORMRepository_1.TarefaTypeORMRepository();
    const repoAtividade = new AtividadeTypeORMRepository_1.AtividadeTypeORMRepository();
    return new TarefasController_1.TarefasController({
        createTarefa: new CreateTarefa_1.CreateTarefa(repo),
        getById: new GetTarefaById_1.GetTarefaById(repo),
        getAllTarefas: new GetAllTarefas_1.GetAllTarefas(repo),
        addComentario: new AdicionarComentario_1.AdicionarComentario(repo),
        alterarStatus: new AlterarStatusTarefa_1.AlterarStatusTarefa(repo),
        getAtividadeByTarefa: new GetAtividadeByTarefa_1.GetAtividadeByTarefa(repoAtividade),
        adicionarChecklistItem: new AdicionarChecklistItem_1.AdicionarChecklistLitem(repo),
        toggleChecklistItem: new ToggleChecklistItem_1.ToggleChecklistItem(repo),
        alterarPrioridade: new AlterarPrioridadeTarefa_1.AlterarPrioridadeTarefa(repo),
    });
}
