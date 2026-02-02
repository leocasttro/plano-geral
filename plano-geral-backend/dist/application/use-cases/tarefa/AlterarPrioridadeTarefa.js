"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlterarPrioridadeTarefa = void 0;
class AlterarPrioridadeTarefa {
    constructor(repo) {
        this.repo = repo;
    }
    async execute(input) {
        const tarefa = await this.repo.findById(input.tarefaId);
        if (!tarefa) {
            throw new Error('Tarefa não encontrada');
        }
        tarefa.alterarPrioridade(input.novaPrioridade, input.usuario);
        await this.repo.save(tarefa);
        return tarefa;
    }
}
exports.AlterarPrioridadeTarefa = AlterarPrioridadeTarefa;
