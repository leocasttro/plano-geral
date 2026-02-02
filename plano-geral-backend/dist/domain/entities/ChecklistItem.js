"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckListItem = void 0;
class CheckListItem {
    constructor(id, nome, concluido = false) {
        this.id = id;
        this.nome = nome;
        if (!nome || nome.trim().length === 0) {
            throw new Error('CheckList precisa de um nome válido');
        }
        if (nome.length > 250) {
            throw new Error('Check list deve ter no máximo 250 caracteres');
        }
        this.concluido = concluido;
    }
    static reconstituir(props) {
        return new CheckListItem(props.id, props.nome, props.concluido);
    }
    marcarConcluido() {
        this.concluido = true;
    }
    marcarPendente() {
        this.concluido = false;
    }
    toggle() {
        this.concluido = !this.concluido;
    }
    isConcluido() {
        return this.concluido;
    }
}
exports.CheckListItem = CheckListItem;
