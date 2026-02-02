"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdicionarComentario = void 0;
class AdicionarComentario {
    constructor(repo) {
        this.repo = repo;
    }
    async execute(input) {
        const tarefa = await this.repo.findById(input.tarefaId);
        if (!tarefa)
            throw new Error('Tarefa não encontrada');
        tarefa.adicionarComentario(input.comentario, input.usuario);
        await this.repo.save(tarefa);
        return tarefa;
    }
}
exports.AdicionarComentario = AdicionarComentario;
