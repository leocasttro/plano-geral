"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtividadeMapper = void 0;
const Atividade_1 = require("../../../../domain/entities/Atividade");
const AtividadeORM_1 = require("../entities/AtividadeORM");
class AtividadeMapper {
    constructor() { }
    static toDomain(row) {
        return Atividade_1.Atividade.reconstituir({
            id: row.id,
            tipo: row.tipo,
            usuario: row.usuario,
            descricao: row.descricao,
            data: row.createdAt,
        });
    }
    static toORM(atividade) {
        const row = new AtividadeORM_1.AtividadeORM();
        row.id = atividade.id;
        row.tipo = atividade.tipo;
        row.usuario = atividade.usuario;
        row.descricao = atividade.descricao;
        return row;
    }
}
exports.AtividadeMapper = AtividadeMapper;
