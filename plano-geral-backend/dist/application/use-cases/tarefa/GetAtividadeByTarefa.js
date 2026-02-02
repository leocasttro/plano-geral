"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAtividadeByTarefa = void 0;
class GetAtividadeByTarefa {
    constructor(repo) {
        this.repo = repo;
    }
    async execute(params) {
        return this.repo.listByTarefaId(params.tarefaId);
    }
}
exports.GetAtividadeByTarefa = GetAtividadeByTarefa;
