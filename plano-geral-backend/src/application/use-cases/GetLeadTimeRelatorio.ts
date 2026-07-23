import {TarefaRepository} from '../../domain/repositories/TarefaRepository';
import {UserRepository} from '../../domain/repositories/UserRepository';
import {LeadTimeResumoDTO, RelatorioLeadTimeDTO} from '../dtos/RelatorioLeadTimeDTO';

type Item = {
  projetoId: string | null;
  projetoNome: string;
  responsavelId: string | null;
  responsavelNome: string;
  concluidaEm: Date | null;
  duracaoHoras: number | null;
};

export class GetLeadTimeRelatorio {
  constructor(
    private tarefaRepository: TarefaRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(): Promise<RelatorioLeadTimeDTO> {
    const usuarios = await this.userRepository.findAll();
    const usuariosMap = new Map(usuarios.map((u) => [u.id, u.nome]));

    const itens = (await this.tarefaRepository.list()).map((tarefa): Item => {
      const atividades = tarefa
        .obterAtividades()
        .sort((a, b) => a.data.getTime() - b.data.getTime());

      const criacao = atividades.find((a) => a.tipo === 'CRIACAO');
      const conclusao = atividades.find(
        (a) =>
          a.tipo === 'ALTERACAO_STATUS' &&
          a.descricao.toLowerCase().includes('conclu'),
      );

      const criadaEm = criacao?.data ?? null;
      const concluidaEm = conclusao?.data ?? null;

      const duracaoHoras =
        criadaEm && concluidaEm
          ? Number(((concluidaEm.getTime() - criadaEm.getTime()) / 36e5).toFixed(2))
          : null;

      const projeto = tarefa.obterProjeto();
      const responsavelId = tarefa.obterResponsavel() ?? null;

      return {
        projetoId: projeto?.id ?? tarefa.obterProjetoId() ?? null,
        projetoNome: projeto?.nome ?? 'Sem projeto',
        responsavelId,
        responsavelNome: responsavelId
          ? usuariosMap.get(responsavelId) ?? responsavelId
          : 'Sem responsável',
        concluidaEm,
        duracaoHoras,
      };
    });

    return {
      geral: this.resumir(itens),
      porProjeto: this.agrupar(itens, 'projeto'),
      porResponsavel: this.agrupar(itens, 'responsavel'),
      porPeriodo: this.agruparPorPeriodo(itens),
    };
  }

  private resumir(itens: Item[]): LeadTimeResumoDTO {
    const tempos = itens
      .map((i) => i.duracaoHoras)
      .filter((v): v is number => v !== null && v >= 0);

    const tempoMedioHoras = tempos.length
      ? Number((tempos.reduce((t, v) => t + v, 0) / tempos.length).toFixed(2))
      : null;

    return {
      totalTarefas: itens.length,
      tarefasComLeadTime: tempos.length,
      tarefasSemLeadTime: itens.length - tempos.length,
      tempoMedioHoras,
      tempoMedioDias:
        tempoMedioHoras === null ? null : Number((tempoMedioHoras / 24).toFixed(2)),
    };
  }

  private agrupar(itens: Item[], tipo: 'projeto' | 'responsavel'): any[] {
    const grupos = new Map<string, Item[]>();

    itens.forEach((item) => {
      const key =
        tipo === 'projeto'
          ? item.projetoId ?? 'sem-projeto'
          : item.responsavelId ?? 'sem-responsavel';

      grupos.set(key, [...(grupos.get(key) ?? []), item]);
    });

    return Array.from(grupos.entries()).map(([key, grupo]) => {
      const resumo = this.resumir(grupo);

      if (tipo === 'projeto') {
        return {
          projetoId: key === 'sem-projeto' ? null : key,
          projetoNome: grupo[0]?.projetoNome ?? 'Sem projeto',
          ...resumo,
        };
      }

      return {
        responsavelId: key === 'sem-responsavel' ? null : key,
        responsavelNome: grupo[0]?.responsavelNome ?? 'Sem responsável',
        ...resumo,
      };
    });
  }

  private agruparPorPeriodo(itens: Item[]) {
    const grupos = new Map<string, Item[]>();

    itens
      .filter((item) => item.concluidaEm)
      .forEach((item) => {
        const data = item.concluidaEm!;
        const key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        grupos.set(key, [...(grupos.get(key) ?? []), item]);
      });

    return Array.from(grupos.entries()).map(([periodo, grupo]) => ({
      periodo,
      periodoLabel: periodo,
      ...this.resumir(grupo),
    }));
  }
}
