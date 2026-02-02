"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdicionarChecklistLitem = void 0;
class AdicionarChecklistLitem {
    constructor(tarefarepo) {
        this.tarefarepo = tarefarepo;
    }
    async execute(input) {
        const tarefa = await this.tarefarepo.findById(input.tarefaId);
        if (!tarefa)
            throw new Error('Tarefa não encontrada');
        tarefa.adicionarCheckListItem(input.nome);
        await this.tarefarepo.save(tarefa);
        return tarefa;
    }
}
exports.AdicionarChecklistLitem = AdicionarChecklistLitem;
