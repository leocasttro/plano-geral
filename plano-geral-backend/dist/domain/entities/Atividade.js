"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Atividade = void 0;
class Atividade {
    constructor(id, tipo, usuario, descricao, data) {
        this.id = id;
        this.tipo = tipo;
        this.usuario = usuario;
        this.descricao = descricao;
        this.data = data ?? new Date();
        if (!descricao || descricao.trim().length === 0) {
            throw new Error('Atividade precisa de uma descrição válida');
        }
    }
    static reconstituir(props) {
        return new Atividade(props.id, props.tipo, props.usuario, props.descricao, props.data);
    }
}
exports.Atividade = Atividade;
