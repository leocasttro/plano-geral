"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TarefaService = void 0;
const data_source_1 = require("../infra/database/data-source");
const tarefa_entity_1 = require("../entities/tarefa.entity");
class TarefaService {
    constructor() {
        this.repo = data_source_1.AppDataSource.getRepository(tarefa_entity_1.Tarefa);
    }
    async listar() {
        return this.repo.find();
    }
    async obterPorId(id) {
        return this.repo.findOneBy({ id });
    }
    async criar(data) {
        const tarefa = this.repo.create(data);
        return this.repo.save(tarefa);
    }
    async atualizar(id, data) {
        await this.repo.update(id, data);
        return this.obterPorId(id);
    }
    async remover(id) {
        await this.repo.delete(id);
    }
}
exports.TarefaService = TarefaService;
