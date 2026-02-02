"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistItemMapper = void 0;
const ChecklistItem_1 = require("../../../../domain/entities/ChecklistItem");
const ChecklistItemORM_1 = require("../entities/ChecklistItemORM");
class ChecklistItemMapper {
    static toDomain(row) {
        return ChecklistItem_1.CheckListItem.reconstituir ? ChecklistItem_1.CheckListItem.reconstituir({
            id: row.id,
            nome: row.nome,
            concluido: row.concluido,
        }) : new ChecklistItem_1.CheckListItem(row.id, row.nome, row.concluido);
    }
    static toORM(item, tarefaId) {
        const row = new ChecklistItemORM_1.ChecklistItemORM();
        row.id = item.id;
        row.tarefa_id = tarefaId;
        row.nome = item.nome;
        row.concluido = item.isConcluido();
        return row;
    }
}
exports.ChecklistItemMapper = ChecklistItemMapper;
