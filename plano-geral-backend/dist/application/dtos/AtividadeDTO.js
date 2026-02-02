"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtividadeDTO = void 0;
class AtividadeDTO {
    static fromDomain(atividade) {
        return {
            id: atividade.id,
            tipo: String(atividade.tipo),
            usuario: atividade.usuario,
            descricao: atividade.descricao,
            data: atividade.data,
        };
    }
}
exports.AtividadeDTO = AtividadeDTO;
