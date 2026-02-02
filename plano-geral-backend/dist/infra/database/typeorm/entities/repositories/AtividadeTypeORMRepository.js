"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtividadeTypeORMRepository = void 0;
const AtividadeORM_1 = require("../AtividadeORM");
const data_source_1 = require("../../../data-source");
const AtvidadeMapper_1 = require("../../mappers/AtvidadeMapper");
class AtividadeTypeORMRepository {
    constructor() {
        this.ormRepo = data_source_1.AppDataSource.getRepository(AtividadeORM_1.AtividadeORM);
    }
    async save(atividade) {
        const row = AtvidadeMapper_1.AtividadeMapper.toORM(atividade);
        await this.ormRepo.save(row);
    }
    async findById(id) {
        const row = await this.ormRepo.findOne({ where: { id } });
        if (!row)
            return null;
        return AtvidadeMapper_1.AtividadeMapper.toDomain(row);
    }
    async list() {
        const rows = await this.ormRepo.find({
            order: { createdAt: 'DESC' },
        });
        return rows.map(AtvidadeMapper_1.AtividadeMapper.toDomain);
    }
    async listByTarefaId(tarefa_id) {
        const rows = await this.ormRepo.find({
            where: { tarefa_id },
            order: { createdAt: 'DESC' },
        });
        return rows.map(AtvidadeMapper_1.AtividadeMapper.toDomain);
    }
    async delete(id) {
        await this.ormRepo.delete({ id });
    }
}
exports.AtividadeTypeORMRepository = AtividadeTypeORMRepository;
