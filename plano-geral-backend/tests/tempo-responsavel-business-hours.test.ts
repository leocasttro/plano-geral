import assert from 'assert';
import { GetTempoTarefaPorResponsavel } from '../src/application/use-cases/relatorio/GetTempoTarefaPorResponsavel';
import { Tarefa } from '../src/domain/entities/Tarefa';
import { Atividade } from '../src/domain/entities/Atividade';
import { TipoAtividade } from '../src/domain/value-objects/TipoAtividade';
import { StatusTarefa } from '../src/domain/value-objects/StatusTarefa';

function atividade(
  id: string,
  tipo: TipoAtividade,
  descricao: string,
  data: string,
): Atividade {
  return Atividade.reconstituir({
    id,
    tipo,
    usuario: 'admin',
    descricao,
    data: new Date(data),
  });
}

function tarefaComAtividades(atividades: Atividade[], status = StatusTarefa.EM_ANDAMENTO): Tarefa {
  return Tarefa.reconstituir({
    id: 'tarefa-1',
    titulo: 'Tarefa teste',
    descricao: '',
    projetoId: 'projeto-1',
    status,
    prioridade: 'BAIXA',
    atividades,
  });
}

function makeUseCase(tarefa: Tarefa): GetTempoTarefaPorResponsavel {
  return new GetTempoTarefaPorResponsavel({
    save: async () => undefined,
    findById: async () => tarefa,
    list: async () => [tarefa],
    delete: async () => undefined,
  });
}

async function run() {
  const atribuidaSemInicio = tarefaComAtividades([
    atividade(
      'a1',
      TipoAtividade.ATRIBUICAO_RESPONSAVEL,
      'Responsável atribuído: Leonardo',
      '2026-08-10T09:00:00',
    ),
  ]);

  assert.deepStrictEqual(
    await makeUseCase(atribuidaSemInicio).execute('tarefa-1'),
    [],
    'tarefa atribuída mas não iniciada não deve contar tempo para colaborador',
  );

  const executada = tarefaComAtividades([
    atividade(
      'a1',
      TipoAtividade.ATRIBUICAO_RESPONSAVEL,
      'Responsável atribuído: Leonardo',
      '2026-08-10T07:00:00',
    ),
    atividade(
      'a2',
      TipoAtividade.ALTERACAO_STATUS,
      'Tarefa iniciada',
      '2026-08-10T17:00:00',
    ),
    atividade(
      'a3',
      TipoAtividade.ALTERACAO_STATUS,
      'Tarefa concluída',
      '2026-08-11T09:00:00',
    ),
  ], StatusTarefa.CONCLUIDA);

  const tempos = await makeUseCase(executada).execute('tarefa-1');

  assert.strictEqual(tempos.length, 1);
  assert.strictEqual(
    tempos[0].duracaoHoras,
    2,
    'tempo do colaborador deve contar só de em andamento até conclusão dentro de 08h-18h',
  );
}

run().then(() => console.log('Tempo responsavel business hours tests passed.'));
