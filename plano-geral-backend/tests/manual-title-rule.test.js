"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const CreateTarefa_1 = require("../src/application/use-cases/tarefa/CreateTarefa");
const Projeto_1 = require("../src/domain/entities/Projeto");
const TituloTarefaCatalogo_1 = require("../src/domain/entities/TituloTarefaCatalogo");
const titulo_tarefa_manual_title_1 = require("../../plano-geral-frontend/src/app/domain/titulo-tarefa/titulo-tarefa-manual-title");
const manualMarker = TituloTarefaCatalogo_1.TituloTarefaCatalogo.SUBATIVIDADE_TITULO_MANUAL;
function catalogo(input) {
    return TituloTarefaCatalogo_1.TituloTarefaCatalogo.reconstituir({
        id: input.id,
        acao: null,
        componente: 'Componente',
        atividadePrincipal: input.atividadePrincipal,
        subatividade: input.subatividade,
        descricao: null,
        tituloNormalizado: 'titulo',
        ativo: true,
    });
}
function makeUseCase(tituloCatalogo) {
    const projeto = new Projeto_1.Projeto('projeto-1', 'Projeto teste');
    let saved = null;
    const useCase = new CreateTarefa_1.CreateTarefa({
        save: async (tarefa) => {
            saved = tarefa;
        },
        findById: async () => null,
        list: async () => [],
        delete: async () => undefined,
    }, {
        save: async () => undefined,
        findById: async () => projeto,
        findAll: async () => [projeto],
        delete: async () => undefined,
        findByStatus: async () => [],
    }, {
        save: async () => undefined,
        findById: async (id) => (id === tituloCatalogo.id ? tituloCatalogo : null),
        list: async () => [tituloCatalogo],
    });
    return {
        useCase,
        getSaved: () => saved,
    };
}
async function assertRejectsMessage(action, expected) {
    let error = null;
    try {
        await action();
    }
    catch (err) {
        error = err;
    }
    (0, assert_1.default)(error, `Esperava erro: ${expected}`);
    (0, assert_1.default)(error.message.includes(expected), `Mensagem esperada contendo "${expected}", recebida "${error.message}"`);
}
async function run() {
    assert_1.default.strictEqual((0, titulo_tarefa_manual_title_1.montarTituloAutomaticoTarefa)('Relatório Mensal', 'Conferência'), 'Relatório Mensal - Conferência', 'subatividade comum deve gerar título automático');
    assert_1.default.strictEqual((0, titulo_tarefa_manual_title_1.subatividadeUnicaExigeTituloManual)([{ subatividade: manualMarker }]), true, 'marcador como única subatividade deve exigir título manual');
    assert_1.default.strictEqual((0, titulo_tarefa_manual_title_1.ehSubatividadeTituloManual)(`  ABRIR   CAMPO PARA PREENCHIMENTO PELO RESPONSAVEL  `), true, 'comparação deve tolerar caixa, espaços e acentuação');
    assert_1.default.strictEqual((0, titulo_tarefa_manual_title_1.subatividadeUnicaExigeTituloManual)([
        { subatividade: 'Conferência' },
        { subatividade: manualMarker },
    ]), false, 'marcador entre várias opções não deve ocultar o seletor');
    assert_1.default.strictEqual((0, titulo_tarefa_manual_title_1.montarTituloAutomaticoTarefa)('Relatório Mensal', manualMarker), '', 'marcador selecionado deve apagar título automático anterior');
    assert_1.default.strictEqual((0, titulo_tarefa_manual_title_1.montarTituloAutomaticoTarefa)('Relatório Mensal', 'Conferência'), 'Relatório Mensal - Conferência', 'trocar do marcador para subatividade comum deve voltar a gerar título');
    const manualCatalogo = catalogo({
        id: 'manual',
        atividadePrincipal: 'Relatório Mensal',
        subatividade: manualMarker,
    });
    await assertRejectsMessage(() => makeUseCase(manualCatalogo).useCase.execute({
        titulo: '',
        tituloCatalogoId: 'manual',
        descricao: '',
        projetoId: 'projeto-1',
        usuario: 'usuario-1',
        usuarioNome: 'Usuário',
    }), 'Título manual é obrigatório');
    await assertRejectsMessage(() => makeUseCase(manualCatalogo).useCase.execute({
        titulo: 'Relatório Mensal - Abrir campo para preenchimento pelo responsável',
        tituloCatalogoId: 'manual',
        descricao: '',
        projetoId: 'projeto-1',
        usuario: 'usuario-1',
        usuarioNome: 'Usuário',
    }), 'Informe um título manual válido');
    const manualUseCase = makeUseCase(manualCatalogo);
    await manualUseCase.useCase.execute({
        titulo: 'Relatório de drenagem norte',
        tituloCatalogoId: 'manual',
        descricao: '',
        projetoId: 'projeto-1',
        usuario: 'usuario-1',
        usuarioNome: 'Usuário',
    });
    assert_1.default.strictEqual(manualUseCase.getSaved()?.titulo, 'Relatório de drenagem norte', 'backend deve aceitar título manual válido');
    const comumCatalogo = catalogo({
        id: 'comum',
        atividadePrincipal: 'Relatório Mensal',
        subatividade: 'Conferência',
    });
    const comumUseCase = makeUseCase(comumCatalogo);
    await comumUseCase.useCase.execute({
        titulo: '',
        tituloCatalogoId: 'comum',
        descricao: '',
        projetoId: 'projeto-1',
        usuario: 'usuario-1',
        usuarioNome: 'Usuário',
    });
    assert_1.default.strictEqual(comumUseCase.getSaved()?.titulo, 'Relatório Mensal - Conferência', 'backend deve manter fallback automático para subatividade comum');
}
run()
    .then(() => {
    console.log('manual-title-rule tests passed');
})
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
