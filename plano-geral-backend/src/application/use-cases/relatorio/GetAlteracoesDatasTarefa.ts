import {TarefaRepository} from '../../../domain/repositories/TarefaRepository';
import {TarefaComPrazo} from '../../../domain/entities/TarefaComPrazo';
import {RelatorioAlteracoesDatasDTO} from '../../dtos/RelatorioAlteracoesDatasDTO';

export class GetAlteracoesDatasTarefa {
  constructor(private tarefaRepository: TarefaRepository) {}

  async execute(tarefaId: string): Promise<RelatorioAlteracoesDatasDTO> {
    const tarefa = await this.tarefaRepository.findById(tarefaId);

    if (!tarefa) {
      throw new Error('Tarefa não encontrada');
    }

    const alteracoes = tarefa.obterAtividades()
      .filter((atividade) => atividade.tipo === 'ALTERACAO_DATAS')
      .sort((a, b) => b.data.getTime() - a.data.getTime())
      .map((atividade) => ({
        id: atividade.id,
        usuario: atividade.usuario,
        descricao: atividade.descricao,
        dataAlteracao: atividade.data,
      }));

    let dataInicialAtual: Date | null = null;
    let dataFimAtual: Date | null = null;

    if (tarefa instanceof TarefaComPrazo) {
      dataInicialAtual = tarefa.getPeriodo().getInicio();
      dataFimAtual = tarefa.getPeriodo().getFim();
    }

    return {
      tarefaId: tarefa.id,
      titulo: tarefa.titulo,
      dataInicialAtual,
      dataFimAtual,
      totalAlteracoes: alteracoes.length,
      alteracoes,
    };
  }
}
