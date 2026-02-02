"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTarefaById = void 0;
class GetTarefaById {
    constructor(repo) {
        this.repo = repo;
    }
    async execute(id) {
        const tarefa = await this.repo.findById(id);
        if (!tarefa) {
            throw new Error('Tarefa não encontrada');
        }
        return tarefa;
    }
}
exports.GetTarefaById = GetTarefaById;
