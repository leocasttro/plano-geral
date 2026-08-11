import assert from 'assert';
import { CreateTarefa } from '../src/application/use-cases/tarefa/CreateTarefa';
import { Projeto } from '../src/domain/entities/Projeto';
import { Tarefa } from '../src/domain/entities/Tarefa';
import { AlterarStatusTarefa } from '../src/application/use-cases/tarefa/AlterarStatusTarefa';
import { TituloTarefaCatalogo } from '../src/domain/entities/TituloTarefaCatalogo';
import { StatusTarefa } from '../src/domain/value-objects/StatusTarefa';
import { User } from '../src/domain/entities/User';
import { GestorProjetoNotificacaoService } from '../src/application/services/GestorProjetoNotificacaoService';
import { AdicionarComentario } from '../src/application/use-cases/tarefa/AdicionarComentario';
import { SolicitarAlteracaoDatas } from '../src/application/use-cases/tarefa/SolicitarAlteracaoDatas';
import {
  ehSubatividadeTituloManual,
  montarTituloAutomaticoTarefa,
  subatividadeUnicaExigeTituloManual,
} from '../../plano-geral-frontend/src/app/domain/titulo-tarefa/titulo-tarefa-manual-title';

const manualMarker = TituloTarefaCatalogo.SUBATIVIDADE_TITULO_MANUAL;

function catalogo(input: {
  id: string;
  atividadePrincipal: string;
  subatividade: string | null;
}) {
  return TituloTarefaCatalogo.reconstituir({
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

function makeUseCase(tituloCatalogo: TituloTarefaCatalogo) {
  const projeto = new Projeto('projeto-1', 'Projeto teste');
  let saved: Tarefa | null = null;

  const useCase = new CreateTarefa(
    {
      save: async (tarefa: Tarefa) => {
        saved = tarefa;
      },
      findById: async () => null,
      list: async () => [],
      delete: async () => undefined,
    },
    {
      save: async () => undefined,
      findById: async () => projeto,
      findAll: async () => [projeto],
      delete: async () => undefined,
      findByStatus: async () => [],
    },
    {
      save: async () => undefined,
      findById: async (id: string) => (id === tituloCatalogo.id ? tituloCatalogo : null),
      list: async () => [tituloCatalogo],
    },
  );

  return {
    useCase,
    getSaved: () => saved,
  };
}

async function assertRejectsMessage(
  action: () => Promise<unknown>,
  expected: string,
) {
  let error: Error | null = null;

  try {
    await action();
  } catch (err: any) {
    error = err;
  }

  assert(error, `Esperava erro: ${expected}`);
  assert(
    error!.message.includes(expected),
    `Mensagem esperada contendo "${expected}", recebida "${error!.message}"`,
  );
}

async function run() {
  assert.strictEqual(
    montarTituloAutomaticoTarefa('Relatório Mensal', 'Conferência'),
    'Relatório Mensal - Conferência',
    'subatividade comum deve gerar título automático',
  );

  assert.strictEqual(
    subatividadeUnicaExigeTituloManual([{ subatividade: manualMarker }]),
    true,
    'marcador como única subatividade deve exigir título manual',
  );

  assert.strictEqual(
    ehSubatividadeTituloManual(`  ABRIR   CAMPO PARA PREENCHIMENTO PELO RESPONSAVEL  `),
    true,
    'comparação deve tolerar caixa, espaços e acentuação',
  );

  assert.strictEqual(
    subatividadeUnicaExigeTituloManual([
      { subatividade: 'Conferência' },
      { subatividade: manualMarker },
    ]),
    false,
    'marcador entre várias opções não deve ocultar o seletor',
  );

  assert.strictEqual(
    montarTituloAutomaticoTarefa('Relatório Mensal', manualMarker),
    '',
    'marcador selecionado deve apagar título automático anterior',
  );

  assert.strictEqual(
    montarTituloAutomaticoTarefa('Relatório Mensal', 'Conferência'),
    'Relatório Mensal - Conferência',
    'trocar do marcador para subatividade comum deve voltar a gerar título',
  );

  const manualCatalogo = catalogo({
    id: 'manual',
    atividadePrincipal: 'Relatório Mensal',
    subatividade: manualMarker,
  });

  await assertRejectsMessage(
    () =>
      makeUseCase(manualCatalogo).useCase.execute({
        titulo: 'Tarefa sem catálogo',
        tituloCatalogoId: null,
        descricao: '',
        projetoId: 'projeto-1',
        usuario: 'usuario-1',
        usuarioNome: 'Usuário',
      }),
    'Selecione um item do catálogo',
  );

  await assertRejectsMessage(
    () =>
      makeUseCase(manualCatalogo).useCase.execute({
        titulo: '',
        tituloCatalogoId: 'manual',
        descricao: '',
        projetoId: 'projeto-1',
        usuario: 'usuario-1',
        usuarioNome: 'Usuário',
      }),
    'Título manual é obrigatório',
  );

  await assertRejectsMessage(
    () =>
      makeUseCase(manualCatalogo).useCase.execute({
        titulo: 'Relatório Mensal - Abrir campo para preenchimento pelo responsável',
        tituloCatalogoId: 'manual',
        descricao: '',
        projetoId: 'projeto-1',
        usuario: 'usuario-1',
        usuarioNome: 'Usuário',
      }),
    'Informe um título manual válido',
  );

  const manualUseCase = makeUseCase(manualCatalogo);
  await manualUseCase.useCase.execute({
    titulo: 'Relatório de drenagem norte',
    tituloCatalogoId: 'manual',
    descricao: '',
    projetoId: 'projeto-1',
    usuario: 'usuario-1',
    usuarioNome: 'Usuário',
  });

  assert.strictEqual(
    manualUseCase.getSaved()?.titulo,
    'Relatório de drenagem norte',
    'backend deve aceitar título manual válido',
  );

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

  assert.strictEqual(
    comumUseCase.getSaved()?.titulo,
    'Relatório Mensal - Conferência',
    'backend deve manter fallback automático para subatividade comum',
  );

  assert.strictEqual(
    comumUseCase.getSaved()?.obterTituloCatalogoId(),
    'comum',
    'backend deve salvar o id do catálogo na tarefa criada',
  );

  const tarefaComCatalogo = new Tarefa(
    'tarefa-catalogo',
    'Relatório Mensal - Conferência',
    '',
    'projeto-1',
    'comum',
  );
  const tarefaComPrazo = tarefaComCatalogo.converterParaPrazo(
    new Date(2026, 7, 10),
    new Date(2026, 7, 14),
  );

  assert.strictEqual(
    tarefaComPrazo.obterTituloCatalogoId(),
    'comum',
    'converter para prazo deve preservar o id do catálogo',
  );

  tarefaComPrazo.alterarDatas(
    new Date(2026, 7, 11),
    new Date(2026, 7, 15),
    'Usuário',
    'Replanejamento de teste',
  );

  assert.strictEqual(
    tarefaComPrazo.obterTituloCatalogoId(),
    'comum',
    'alterar datas novamente deve preservar o id do catálogo',
  );

  await assertRejectsMessage(
    async () => {
      const tarefaSemResponsavel = tarefaComCatalogo.converterParaPrazo(
        new Date(2026, 7, 10),
        new Date(2026, 7, 14),
      );

      const useCase = new AlterarStatusTarefa({
        save: async () => undefined,
        findById: async () => tarefaSemResponsavel,
        list: async () => [],
        delete: async () => undefined,
      });

      await useCase.execute({
        tarefaId: tarefaSemResponsavel.id,
        novoStatus: StatusTarefa.EM_ANDAMENTO,
        usuario: 'Usuário',
      });
    },
    'Defina um responsável',
  );

  await assertRejectsMessage(
    async () => {
      const tarefaSemDatas = new Tarefa(
        'tarefa-sem-datas',
        'Relatório Mensal - Conferência',
        '',
        'projeto-1',
        'comum',
      );
      tarefaSemDatas.atribuirResponsavel('usuario-1', 'Usuário', 'Usuário');

      const useCase = new AlterarStatusTarefa({
        save: async () => undefined,
        findById: async () => tarefaSemDatas,
        list: async () => [],
        delete: async () => undefined,
      });

      await useCase.execute({
        tarefaId: tarefaSemDatas.id,
        novoStatus: StatusTarefa.CONCLUIDA,
        usuario: 'Usuário',
      });
    },
    'Defina data de início e fim',
  );

  const tarefaMovimentavel = new Tarefa(
    'tarefa-movimentavel',
    'Relatório Mensal - Conferência',
    '',
    'projeto-1',
    'comum',
  ).converterParaPrazo(new Date(2026, 7, 10), new Date(2026, 7, 14));
  tarefaMovimentavel.atribuirResponsavel('usuario-1', 'Usuário', 'Usuário');

  const alterarStatusUseCase = new AlterarStatusTarefa({
    save: async () => undefined,
    findById: async () => tarefaMovimentavel,
    list: async () => [],
    delete: async () => undefined,
  });

  await alterarStatusUseCase.execute({
    tarefaId: tarefaMovimentavel.id,
    novoStatus: StatusTarefa.EM_ANDAMENTO,
    usuario: 'Usuário',
  });

  assert.strictEqual(
    tarefaMovimentavel.obterStatus(),
    StatusTarefa.EM_ANDAMENTO,
    'deve permitir mover quando há responsável, início e fim',
  );

  const gestor = new User(
    'gestor-1',
    'Gestor Projeto',
    'gestor.projeto@prosul.com',
    'hash',
  );
  const projetoComGestor = new Projeto(
    'projeto-com-gestor',
    'Projeto com gestor',
    '',
    null,
    gestor.id,
  );
  const tarefaComGestor = new Tarefa(
    'tarefa-com-gestor',
    'Relatório Mensal - Conferência',
    '',
    projetoComGestor.id,
    'comum',
  ).converterParaPrazo(new Date(2026, 7, 10), new Date(2026, 7, 14));
  tarefaComGestor.atribuirResponsavel('usuario-1', 'Usuário', 'Usuário');

  let notificacaoEnviada = false;
  let emailEnviado = false;

  const alterarStatusComNotificacaoUseCase = new AlterarStatusTarefa(
    {
      save: async () => undefined,
      findById: async () => tarefaComGestor,
      list: async () => [],
      delete: async () => undefined,
    },
    {
      gestorProjetoNotificacaoService: new GestorProjetoNotificacaoService(
        {
          save: async () => undefined,
          findById: async () => projetoComGestor,
          findAll: async () => [projetoComGestor],
          delete: async () => undefined,
          findByStatus: async () => [],
        },
        {
          save: async () => undefined,
          findById: async () => gestor,
          findByEmail: async () => null,
          findAll: async () => [gestor],
          findAllActive: async () => [gestor],
          delete: async () => undefined,
        },
        {
          notificarUsuario: async (input: { usuarioId: string; tipo: string }) => {
            assert.strictEqual(input.usuarioId, gestor.id);
            assert.strictEqual(input.tipo, 'TAREFA_ANDAMENTO');
            notificacaoEnviada = true;
          },
        } as any,
        {
          send: async (input: { to: string; subject: string }) => {
            assert.strictEqual(input.to, gestor.email);
            assert.ok(input.subject.includes('Andamento de tarefa'));
            emailEnviado = true;
          },
        } as any,
      ),
    },
  );

  await alterarStatusComNotificacaoUseCase.execute({
    tarefaId: tarefaComGestor.id,
    novoStatus: StatusTarefa.EM_ANDAMENTO,
    usuario: 'Usuário executor',
    usuarioId: 'usuario-executor',
  });

  assert.strictEqual(
    notificacaoEnviada,
    true,
    'deve gerar notificação interna para o gestor do projeto',
  );
  assert.strictEqual(
    emailEnviado,
    true,
    'deve enviar email para o gestor do projeto',
  );

  const responsavel = new User(
    'responsavel-1',
    'Responsável Tarefa',
    'responsavel@prosul.com',
    'hash',
  );
  const tarefaComentario = new Tarefa(
    'tarefa-comentario',
    'Relatório Mensal - Comentário',
    '',
    projetoComGestor.id,
    'comum',
  );
  tarefaComentario.atribuirResponsavel(responsavel.id, 'Usuário', responsavel.nome);

  let emailComentarioGestor = false;
  const gestorProjetoNotificacaoComentario = new GestorProjetoNotificacaoService(
    {
      save: async () => undefined,
      findById: async () => projetoComGestor,
      findAll: async () => [projetoComGestor],
      delete: async () => undefined,
      findByStatus: async () => [],
    },
    {
      save: async () => undefined,
      findById: async (id: string) => (id === gestor.id ? gestor : responsavel),
      findByEmail: async () => null,
      findAll: async () => [gestor, responsavel],
      findAllActive: async () => [gestor, responsavel],
      delete: async () => undefined,
    },
    { notificarUsuario: async () => undefined } as any,
    {
      send: async (input: { to: string; subject: string; text?: string }) => {
        assert.strictEqual(input.to, gestor.email);
        assert.ok(input.subject.includes('Comentário em tarefa'));
        emailComentarioGestor = true;
      },
    } as any,
  );

  const adicionarComentarioUseCase = new AdicionarComentario(
    {
      save: async () => undefined,
      findById: async () => tarefaComentario,
      list: async () => [],
      delete: async () => undefined,
    },
    { notificarUsuario: async () => undefined } as any,
    {
      save: async () => undefined,
      findById: async () => responsavel,
      findByEmail: async () => null,
      findAll: async () => [responsavel],
      findAllActive: async () => [responsavel],
      delete: async () => undefined,
    },
    gestorProjetoNotificacaoComentario,
  );

  await adicionarComentarioUseCase.execute({
    tarefaId: tarefaComentario.id,
    comentario: 'Comentário do responsável',
    usuarioId: responsavel.id,
    usuarioNome: responsavel.nome,
  });

  assert.strictEqual(
    emailComentarioGestor,
    true,
    'comentário feito pelo responsável deve enviar email ao gestor do projeto',
  );

  let emailSolicitacaoGestor = false;
  const gestorProjetoNotificacaoDatas = new GestorProjetoNotificacaoService(
    {
      save: async () => undefined,
      findById: async () => projetoComGestor,
      findAll: async () => [projetoComGestor],
      delete: async () => undefined,
      findByStatus: async () => [],
    },
    {
      save: async () => undefined,
      findById: async () => gestor,
      findByEmail: async () => null,
      findAll: async () => [gestor],
      findAllActive: async () => [gestor],
      delete: async () => undefined,
    },
    { notificarUsuario: async () => undefined } as any,
    {
      send: async (input: { to: string; subject: string }) => {
        assert.strictEqual(input.to, gestor.email);
        assert.ok(input.subject.includes('Solicitação de alteração de datas'));
        emailSolicitacaoGestor = true;
      },
    } as any,
  );
  const solicitarDatasUseCase = new SolicitarAlteracaoDatas(
    {
      save: async () => undefined,
      findById: async () => tarefaComentario,
      list: async () => [],
      delete: async () => undefined,
    },
    {
      save: async () => undefined,
      findById: async () => gestor,
      findByEmail: async () => null,
      findAll: async () => [gestor],
      findAllActive: async () => [gestor],
      delete: async () => undefined,
    },
    {
      save: async () => undefined,
      findById: async () => null,
      findPendenteByTarefaAndSolicitante: async () => null,
    },
    { notificarUsuarios: async () => undefined } as any,
    gestorProjetoNotificacaoDatas,
  );

  await solicitarDatasUseCase.execute({
    tarefaId: tarefaComentario.id,
    dataInicio: new Date(2026, 7, 12),
    dataFim: new Date(2026, 7, 16),
    justificativa: 'Ajuste necessário',
    solicitanteId: responsavel.id,
    solicitanteNome: responsavel.nome,
  });

  assert.strictEqual(
    emailSolicitacaoGestor,
    true,
    'solicitação de alteração de datas deve enviar email ao gestor do projeto',
  );
}

run()
  .then(() => {
    console.log('manual-title-rule tests passed');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
