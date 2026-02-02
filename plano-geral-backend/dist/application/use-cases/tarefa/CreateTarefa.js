"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTarefa = void 0;
const Tarefa_1 = require("../../../domain/entities/Tarefa");
class CreateTarefa {
    constructor(repo) {
        this.repo = repo;
    }
    async execute(input) {
        const tarefa = new Tarefa_1.Tarefa(crypto.randomUUID(), input.titulo, input.descricao);
        await this.repo.save(tarefa);
        return tarefa;
    }
}
exports.CreateTarefa = CreateTarefa;
