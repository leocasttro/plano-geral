"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tarefa = void 0;
const crypto_1 = require("crypto");
const Prioridade_1 = require("../value-objects/Prioridade");
const StatusTarefa_1 = require("../value-objects/StatusTarefa");
const TipoAtividade_1 = require("../value-objects/TipoAtividade");
const Atividade_1 = require("./Atividade");
const ChecklistItem_1 = require("./ChecklistItem");
class Tarefa {
    constructor(id, titulo, descricao) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.checklist = [];
        this.atividades = [];
        if (!titulo || titulo.trim().length === 0) {
            throw new Error('Tarefa precisa de um título válido');
        }
        this.status = StatusTarefa_1.StatusTarefa.PENDENTE;
        this.prioridade = Prioridade_1.Prioridade.BAIXA;
    }
    static reconstituir(props) {
        const tarefa = new Tarefa(props.id, props.titulo, props.descricao);
        tarefa.status = props.status;
        tarefa.prioridade = props.prioridade;
        tarefa.responsavel = props.reponsavel;
        tarefa.checklist = props.checklist ?? [];
        tarefa.atividades = props.atividades ?? [];
        return tarefa;
    }
    iniciar(usuario) {
        if (this.status !== StatusTarefa_1.StatusTarefa.PENDENTE) {
            throw new Error('Só é possível iniciar uma tarefa PENDENTE');
        }
        this.status = StatusTarefa_1.StatusTarefa.EM_ANDAMENTO;
        this.registrarAtividade(new Atividade_1.Atividade((0, crypto_1.randomUUID)(), TipoAtividade_1.TipoAtividade.ALTERACAO_STATUS, usuario, 'Tarefa iniciada'));
    }
    concluir(usuario) {
        if (this.status !== StatusTarefa_1.StatusTarefa.EM_ANDAMENTO) {
            throw new Error('Só é possível concluir uma tarefa EM ANDAMENTO');
        }
        if (this.existeChecklistPendente()) {
            throw new Error('Não é possível concluir a tarefa com itens pendentes no checklist');
        }
        this.status = StatusTarefa_1.StatusTarefa.CONCLUIDA;
        this.registrarAtividade(new Atividade_1.Atividade((0, crypto_1.randomUUID)(), TipoAtividade_1.TipoAtividade.ALTERACAO_STATUS, usuario, 'Tarefa concluída'));
    }
    alterarPrioridade(nova, usuario) {
        this.prioridade = nova;
        this.registrarAtividade(new Atividade_1.Atividade((0, crypto_1.randomUUID)(), TipoAtividade_1.TipoAtividade.ALTERACAO_PRIORIDADE, usuario, `Prioridade alterada para ${nova}`));
    }
    atribuirResponsavel(usuarioAlvo, usuarioAcao) {
        this.responsavel = usuarioAlvo;
        this.registrarAtividade(new Atividade_1.Atividade((0, crypto_1.randomUUID)(), TipoAtividade_1.TipoAtividade.ATRIBUICAO_RESPONSAVEL, usuarioAcao, `Responsável atribuído: ${usuarioAlvo}`));
    }
    adicionarChecklist(item) {
        this.checklist.push(item);
    }
    adicionarComentario(comentario, usuario) {
        if (!comentario || comentario.trim().length === 0) {
            throw new Error('Comentário não pode ser vazio');
        }
        this.registrarAtividade(new Atividade_1.Atividade((0, crypto_1.randomUUID)(), TipoAtividade_1.TipoAtividade.COMENTARIO, usuario, comentario));
    }
    existeChecklistPendente() {
        return this.checklist.some((item) => !item.isConcluido());
    }
    adicionarCheckListItem(nome) {
        const clean = (nome ?? '').trim();
        if (!clean) {
            throw new Error('Check list do item não pode ser vazio');
        }
        if (clean.length > 250) {
            throw new Error('Check list deve ter no máximo 250 caracteres');
        }
        this.checklist.push(new ChecklistItem_1.CheckListItem((0, crypto_1.randomUUID)(), clean, false));
    }
    toggleChecklistItem(itemId) {
        const item = this.checklist.find((i) => i.id === itemId);
        if (!item)
            throw new Error('Item do checklist não encontrado');
        item.toggle();
    }
    registrarAtividade(atividade) {
        this.atividades.push(atividade);
    }
    obterStatus() {
        return this.status;
    }
    obterChecklist() {
        return [...this.checklist];
    }
    obterAtividades() {
        return [...this.atividades];
    }
    obterPrioridade() {
        return this.prioridade;
    }
    obterResponsavel() {
        return this.responsavel;
    }
}
exports.Tarefa = Tarefa;
