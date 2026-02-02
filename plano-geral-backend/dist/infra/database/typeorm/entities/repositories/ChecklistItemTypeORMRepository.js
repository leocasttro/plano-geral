"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistItemTypeORMRepository = void 0;
const ChecklistItemORM_1 = require("../ChecklistItemORM");
const data_source_1 = require("../../../data-source");
const ChecklistItemMapper_1 = require("../../mappers/ChecklistItemMapper");
class ChecklistItemTypeORMRepository {
    constructor() {
        this.ormRepo = data_source_1.AppDataSource.getRepository(ChecklistItemORM_1.ChecklistItemORM);
    }
    async listByTarefaId(tarefaId) {
        const rows = await this.ormRepo.find({
            where: { tarefa_id: tarefaId },
            order: { createdAt: 'DESC' },
        });
        return rows.map(ChecklistItemMapper_1.ChecklistItemMapper.toDomain);
    }
    async findById(id) {
        const row = await this.ormRepo.findOne({ where: { id } });
        if (!row)
            return null;
        return {
            item: ChecklistItemMapper_1.ChecklistItemMapper.toDomain(row),
            tarefaId: row.tarefa_id,
        };
    }
    async save(item, tarefaId) {
        const row = ChecklistItemMapper_1.ChecklistItemMapper.toORM(item, tarefaId);
        await this.ormRepo.save(row);
    }
    async delete(id) {
        await this.ormRepo.delete({ id });
    }
}
exports.ChecklistItemTypeORMRepository = ChecklistItemTypeORMRepository;
