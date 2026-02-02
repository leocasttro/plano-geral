"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TarefaTypeORMRepository = void 0;
const TarefaORM_1 = require("../TarefaORM");
const data_source_1 = require("../../../data-source");
const TarefaMapper_1 = require("../../mappers/TarefaMapper");
class TarefaTypeORMRepository {
    constructor() {
        this.ormRepo = data_source_1.AppDataSource.getRepository(TarefaORM_1.TarefaORM);
    }
    async save(tarefa) {
        const row = TarefaMapper_1.TarefaMapper.toORM(tarefa);
        await this.ormRepo.save(row);
    }
    async findById(id) {
        const row = await this.ormRepo.findOne({ where: { id }, relations: { atividades: true, checklist: true }, });
        if (!row)
            return null;
        return TarefaMapper_1.TarefaMapper.toDomain(row);
    }
    async list() {
        const rows = await this.ormRepo.find({
            relations: { atividades: true, checklist: true },
            order: { createdAt: 'DESC' },
        });
        return rows.map(TarefaMapper_1.TarefaMapper.toDomain);
    }
    async delete(id) {
        await this.ormRepo.delete({ id });
    }
}
exports.TarefaTypeORMRepository = TarefaTypeORMRepository;
