"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleChecklistItem = void 0;
class ToggleChecklistItem {
    constructor(tarefaRepo) {
        this.tarefaRepo = tarefaRepo;
    }
    async execute(input) {
        const tarefa = await this.tarefaRepo.findById(input.tarefaId);
        if (!tarefa) {
            throw new Error('Tarefa não encontrada');
        }
        tarefa.toggleChecklistItem(input.checklistItemId);
        await this.tarefaRepo.save(tarefa);
        return tarefa;
    }
}
exports.ToggleChecklistItem = ToggleChecklistItem;
