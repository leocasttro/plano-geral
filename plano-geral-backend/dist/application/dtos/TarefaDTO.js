"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TarefaDTO = void 0;
class TarefaDTO {
    static fromDomain(tarefa) {
        return {
            id: tarefa.id,
            titulo: tarefa.titulo,
            descricao: tarefa.descricao,
            status: tarefa.obterStatus(),
            prioridade: tarefa.obterPrioridade(), // acesso controlado via DTO
            responsavel: tarefa.obterResponsavel(),
            checklist: tarefa.obterChecklist().map((item) => ({
                id: item.id,
                nome: item.nome,
                concluido: item.isConcluido(),
            })),
            atividades: tarefa.obterAtividades().map((atividade) => ({
                id: atividade.id,
                tipo: atividade.tipo,
                usuario: atividade.usuario,
                descricao: atividade.descricao,
                data: atividade.data,
            })),
        };
    }
}
exports.TarefaDTO = TarefaDTO;
