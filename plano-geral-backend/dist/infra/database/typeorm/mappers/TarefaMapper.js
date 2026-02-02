"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TarefaMapper = void 0;
const Atividade_1 = require("../../../../domain/entities/Atividade");
const Tarefa_1 = require("../../../../domain/entities/Tarefa");
const ChecklistItem_1 = require("../../../../domain/entities/ChecklistItem");
const AtividadeORM_1 = require("../entities/AtividadeORM");
const ChecklistItemORM_1 = require("../entities/ChecklistItemORM");
const TarefaORM_1 = require("../entities/TarefaORM");
class TarefaMapper {
    static toORM(tarefa) {
        const row = new TarefaORM_1.TarefaORM();
        row.id = tarefa.id;
        row.titulo = tarefa.titulo;
        row.descricao = tarefa.descricao ?? null;
        row.status = tarefa.obterStatus();
        row.prioridade = tarefa.obterPrioridade();
        row.responsavel = tarefa.obterResponsavel() ?? null;
        // ✅ atividades
        row.atividades = tarefa.obterAtividades().map((a) => {
            const act = new AtividadeORM_1.AtividadeORM();
            act.id = a.id;
            act.tipo = a.tipo;
            act.usuario = a.usuario;
            act.descricao = a.descricao;
            act.tarefa_id = row.id;
            return act;
        });
        row.checklist = tarefa.obterChecklist().map((c) => {
            const item = new ChecklistItemORM_1.ChecklistItemORM();
            item.id = c.id;
            item.nome = c.nome;
            item.concluido = c.isConcluido();
            item.tarefa = row;
            item.tarefa_id = row.id;
            return item;
        });
        return row;
    }
    static toDomain(row) {
        const atividades = (row.atividades ?? []).map((a) => Atividade_1.Atividade.reconstituir?.({
            id: a.id,
            tipo: a.tipo,
            usuario: a.usuario,
            descricao: a.descricao,
            data: a.createdAt,
        }) ?? new Atividade_1.Atividade(a.id, a.tipo, a.usuario, a.descricao));
        const checklist = (row.checklist ?? []).map((c) => ChecklistItem_1.CheckListItem.reconstituir
            ? ChecklistItem_1.CheckListItem.reconstituir({
                id: c.id,
                nome: c.nome,
                concluido: c.concluido,
            })
            : new ChecklistItem_1.CheckListItem(c.id, c.nome, c.concluido));
        return Tarefa_1.Tarefa.reconstituir({
            id: row.id,
            titulo: row.titulo,
            descricao: row.descricao ?? null,
            status: row.status,
            prioridade: row.prioridade,
            checklist,
            atividades,
        });
    }
}
exports.TarefaMapper = TarefaMapper;
