"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllTarefas = void 0;
class GetAllTarefas {
    constructor(repo) {
        this.repo = repo;
    }
    async execute() {
        const tarefas = await this.repo.list();
        if (!tarefas) {
            throw new Error('Tarefas não encontrada');
        }
        return tarefas;
    }
}
exports.GetAllTarefas = GetAllTarefas;
