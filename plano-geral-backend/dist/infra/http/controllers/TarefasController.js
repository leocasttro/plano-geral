"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TarefasController = void 0;
const TarefaDTO_1 = require("../../../application/dtos/TarefaDTO");
const AtividadeDTO_1 = require("../../../application/dtos/AtividadeDTO");
const StatusTarefa_1 = require("../../../domain/value-objects/StatusTarefa");
function isPrioridade(valor) {
    return (valor === 'BAIXA' ||
        valor === 'NORMAL' ||
        valor === 'ALTA' ||
        valor === 'CRITICA');
}
function isStatusTarefa(valor) {
    return (valor === StatusTarefa_1.StatusTarefa.PENDENTE ||
        valor === StatusTarefa_1.StatusTarefa.EM_ANDAMENTO ||
        valor === StatusTarefa_1.StatusTarefa.CONCLUIDA);
}
class TarefasController {
    constructor(deps) {
        this.deps = deps;
    }
    async criar(req, res) {
        const { titulo, descricao } = req.body;
        const tarefa = await this.deps.createTarefa.execute({ titulo, descricao });
        return res.status(201).json(TarefaDTO_1.TarefaDTO.fromDomain(tarefa));
    }
    async buscarTodas(req, res) {
        const tarefas = await this.deps.getAllTarefas.execute();
        return res.json(tarefas.map(TarefaDTO_1.TarefaDTO.fromDomain));
    }
    async buscarPorId(req, res) {
        const tarefa = await this.deps.getById.execute(req.params.id);
        return res.json(TarefaDTO_1.TarefaDTO.fromDomain(tarefa));
    }
    async adicionarComentario(req, res) {
        const tarefa = await this.deps.addComentario.execute({
            tarefaId: req.params.id,
            comentario: req.body.comentario,
            usuario: req.body.usuario,
        });
        return res.json(TarefaDTO_1.TarefaDTO.fromDomain(tarefa));
    }
    async buscarAtividades(req, res) {
        const atividades = await this.deps.getAtividadeByTarefa.execute({
            tarefaId: req.params.id,
        });
        return res.json(atividades.map(AtividadeDTO_1.AtividadeDTO.fromDomain));
    }
    async AdicionarChecklistLitem(req, res) {
        const tarefa = await this.deps.adicionarChecklistItem.execute({
            tarefaId: req.params.id,
            nome: req.body.nome,
        });
        return res.json(TarefaDTO_1.TarefaDTO.fromDomain(tarefa));
    }
    async toggleChecklistItem(req, res) {
        const tarefa = await this.deps.toggleChecklistItem.execute({
            tarefaId: req.params.id,
            checklistItemId: req.params.itemId,
        });
        return res.json(TarefaDTO_1.TarefaDTO.fromDomain(tarefa));
    }
    async alterarPrioridade(req, res) {
        const { novaPrioridade, usuario } = req.body;
        if (!isPrioridade(novaPrioridade)) {
            return res.status(400).json({ message: 'Prioridade inválida' });
        }
        if (!usuario || !String(usuario).trim()) {
            return res.status(400).json({ message: 'Usuário é obrigatório' });
        }
        const tarefa = await this.deps.alterarPrioridade.execute({
            tarefaId: req.params.id,
            novaPrioridade,
            usuario,
        });
        return res.json(TarefaDTO_1.TarefaDTO.fromDomain(tarefa));
    }
    async alterarStatus(req, res) {
        const { novoStatus, usuario } = req.body;
        if (!isStatusTarefa(novoStatus)) {
            return res.status(400).json({ message: 'Status inválido' });
        }
        if (!usuario || !String(usuario).trim()) {
            return res.status(400).json({ message: 'Usuário é obrigatório' });
        }
        const tarefa = await this.deps.alterarStatus.execute({
            tarefaId: req.params.id,
            novoStatus,
            usuario,
        });
        return res.json(TarefaDTO_1.TarefaDTO.fromDomain(tarefa));
    }
}
exports.TarefasController = TarefasController;
