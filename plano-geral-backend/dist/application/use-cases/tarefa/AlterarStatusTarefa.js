"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlterarStatusTarefa = void 0;
const StatusTarefa_1 = require("../../../domain/value-objects/StatusTarefa");
class AlterarStatusTarefa {
    constructor(repo) {
        this.repo = repo;
    }
    async execute(input) {
        const tarefa = await this.repo.findById(input.tarefaId);
        if (!tarefa) {
            throw new Error('Tarefa não encontrada');
        }
        if (input.novoStatus === StatusTarefa_1.StatusTarefa.EM_ANDAMENTO) {
            tarefa.iniciar(input.usuario);
        }
        if (input.novoStatus === StatusTarefa_1.StatusTarefa.CONCLUIDA) {
            tarefa.concluir(input.usuario);
        }
        await this.repo.save(tarefa);
        return tarefa;
    }
}
exports.AlterarStatusTarefa = AlterarStatusTarefa;
