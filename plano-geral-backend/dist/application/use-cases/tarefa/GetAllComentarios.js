"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllAtividades = void 0;
class GetAllAtividades {
    constructor(repo) {
        this.repo = repo;
    }
    async execute() {
        const atividades = await this.repo.list();
        if (!atividades) {
            throw new Error('Atividades não encontradas');
        }
        return atividades;
    }
}
exports.GetAllAtividades = GetAllAtividades;
