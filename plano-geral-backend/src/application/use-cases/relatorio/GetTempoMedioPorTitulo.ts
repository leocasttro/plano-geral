import { TarefaRepository } from '../../../domain/repositories/TarefaRepository';
import { Tarefa } from '../../../domain/entities/Tarefa';
import { TarefaComPrazo } from '../../../domain/entities/TarefaComPrazo';
import {
  normalizarTexto,
  TituloTarefaCatalogo,
} from '../../../domain/entities/TituloTarefaCatalogo';
import { TituloTarefaCatalogoRepository } from '../../../domain/repositories/TituloTarefaCatalogoRepository';
import { filtrarTarefasRelatorio, RelatorioFiltros } from './RelatorioFiltros';

type TarefaTituloDetalheDTO = {
  tarefaId: string;
  status: string;
  prioridade: string;
  projetoNome: string | null;
  criadaEm: Date | null;
  iniciadaEm: Date | null;
  concluidaEm: Date | null;
  duracaoHoras: number | null;
  tempoEsperaHoras: number | null;
  tempoExecucaoHoras: number | null;
  dataInicio: Date | null;
  dataFim: Date | null;
};

type RelatorioTempoMedioPorTituloItemDTO = {
  titulo: string;
  componente: string | null;
  atividadePrincipal: string | null;
  subatividade: string | null;
  totalTarefas: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  tarefasComTempoCalculado: number;
  tempoMedioHoras: number | null;
  percentualConclusao: number;
  tarefas: TarefaTituloDetalheDTO[];
};

export type RelatorioTempoMedioPorTituloDTO = {
  totalTitulos: number;
  componentes: RelatorioGrupoCatalogoDTO[];
  atividadesPrincipais: RelatorioGrupoCatalogoDTO[];
  subatividades: RelatorioGrupoCatalogoDTO[];
  titulos: RelatorioTempoMedioPorTituloItemDTO[];
};

type RelatorioGrupoCatalogoDTO = {
  nome: string;
  totalTarefas: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  percentualConclusao: number;
  tempoMedioHoras: number | null;
};

type CatalogoResumo = {
  componente: string | null;
  atividadePrincipal: string | null;
  subatividade: string | null;
};

export class GetTempoMedioPorTitulo {
  constructor(
    private tarefaRepository: TarefaRepository,
    private tituloTarefaCatalogoRepository?: TituloTarefaCatalogoRepository,
  ) {}

  async execute(filtros: RelatorioFiltros = {}): Promise<RelatorioTempoMedioPorTituloDTO> {
    const todasTarefas = await this.tarefaRepository.list();
    const catalogos = await this.listarCatalogos();
    const catalogoPorTitulo = this.indexarCatalogoPorTitulo(catalogos);
    const tarefas = filtrarTarefasRelatorio(
      todasTarefas,
      filtros,
      (tarefa) => this.resolverCatalogoTarefa(tarefa, catalogoPorTitulo),
    );
    const grupos = new Map<string, typeof tarefas>();

    tarefas.forEach((tarefa) => {
      const titulo = tarefa.titulo.trim();

      if (!titulo) {
        return;
      }

      const lista = grupos.get(titulo) ?? [];
      lista.push(tarefa);
      grupos.set(titulo, lista);
    });

    const titulos = Array.from(grupos.entries()).map(([titulo, tarefasTitulo]) => {
      const totalTarefas = tarefasTitulo.length;
      const catalogo =
        tarefasTitulo.find((tarefa) => tarefa.obterTituloCatalogo())
          ?.obterTituloCatalogo() ??
        catalogoPorTitulo.get(normalizarTexto(titulo))?.[0] ??
        null;
      const pendentes = tarefasTitulo.filter(
        (tarefa) => tarefa.obterStatus() === 'PENDENTE',
      ).length;
      const emAndamento = tarefasTitulo.filter(
        (tarefa) => tarefa.obterStatus() === 'EM_ANDAMENTO',
      ).length;
      const concluidas = tarefasTitulo.filter(
        (tarefa) => tarefa.obterStatus() === 'CONCLUIDA',
      ).length;

      const tarefasDetalhe = tarefasTitulo.map((tarefa) =>
        this.toTarefaDetalhe(tarefa),
      );

      const temposConclusao = tarefasDetalhe
        .map((tarefa) => tarefa.duracaoHoras)
        .filter((tempo): tempo is number => tempo !== null);

      const tempoMedioHoras = temposConclusao.length
        ? Number(
            (
              temposConclusao.reduce((total, tempo) => total + tempo, 0) /
              temposConclusao.length
            ).toFixed(2),
          )
        : null;

      return {
        titulo,
        componente: catalogo?.componente ?? null,
        atividadePrincipal: catalogo?.atividadePrincipal ?? null,
        subatividade: catalogo?.subatividade ?? null,
        totalTarefas,
        pendentes,
        emAndamento,
        concluidas,
        tarefasComTempoCalculado: temposConclusao.length,
        tempoMedioHoras,
        percentualConclusao: totalTarefas
          ? Math.round((concluidas / totalTarefas) * 100)
          : 0,
        tarefas: tarefasDetalhe.sort((a, b) =>
          (b.criadaEm?.getTime() ?? 0) - (a.criadaEm?.getTime() ?? 0),
        ),
      };
    });

    return {
      totalTitulos: titulos.length,
      componentes: this.agruparCatalogoPorTarefa(
        tarefas,
        catalogos,
        catalogoPorTitulo,
        'componente',
      ),
      atividadesPrincipais: this.agruparCatalogoPorTarefa(
        tarefas,
        catalogos,
        catalogoPorTitulo,
        'atividadePrincipal',
      ),
      subatividades: this.agruparCatalogoPorTarefa(
        tarefas,
        catalogos,
        catalogoPorTitulo,
        'subatividade',
      ),
      titulos: titulos.sort(
        (a, b) =>
          b.totalTarefas - a.totalTarefas ||
          a.titulo.localeCompare(b.titulo),
      ),
    };
  }

  private agruparCatalogoPorTarefa(
    tarefas: Tarefa[],
    catalogos: TituloTarefaCatalogo[],
    catalogoPorTitulo: Map<string, TituloTarefaCatalogo[]>,
    campo: 'componente' | 'atividadePrincipal' | 'subatividade',
  ): RelatorioGrupoCatalogoDTO[] {
    const grupos = new Map<string, Tarefa[]>();

    catalogos.forEach((catalogo) => {
      const nome = catalogo[campo]?.trim() || 'Sem catálogo';
      grupos.set(nome, grupos.get(nome) ?? []);
    });

    tarefas.forEach((tarefa) => {
      const catalogo = this.resolverCatalogoTarefa(tarefa, catalogoPorTitulo);
      const nome = catalogo?.[campo]?.trim() || 'Sem catálogo';
      grupos.set(nome, [...(grupos.get(nome) ?? []), tarefa]);
    });

    return Array.from(grupos.entries())
      .map(([nome, itens]) => {
        const detalhes = itens.map((tarefa) => this.toTarefaDetalhe(tarefa));
        const totalTarefas = itens.length;
        const pendentes = itens.filter(
          (tarefa) => tarefa.obterStatus() === 'PENDENTE',
        ).length;
        const emAndamento = itens.filter(
          (tarefa) => tarefa.obterStatus() === 'EM_ANDAMENTO',
        ).length;
        const concluidas = itens.filter(
          (tarefa) => tarefa.obterStatus() === 'CONCLUIDA',
        ).length;
        const temposConclusao = detalhes
          .map((tarefa) => tarefa.duracaoHoras)
          .filter((tempo): tempo is number => tempo !== null);

        return {
          nome,
          totalTarefas,
          pendentes,
          emAndamento,
          concluidas,
          percentualConclusao: totalTarefas ? Math.round((concluidas / totalTarefas) * 100) : 0,
          tempoMedioHoras: temposConclusao.length
            ? Number(
                (
                  temposConclusao.reduce((total, tempo) => total + tempo, 0) /
                  temposConclusao.length
                ).toFixed(2),
              )
            : null,
        };
      })
      .filter((grupo) => grupo.totalTarefas > 0)
      .sort((a, b) => b.totalTarefas - a.totalTarefas || a.nome.localeCompare(b.nome));
  }

  private async listarCatalogos(): Promise<TituloTarefaCatalogo[]> {
    if (!this.tituloTarefaCatalogoRepository) {
      return [];
    }

    return this.tituloTarefaCatalogoRepository.list({ ativo: true });
  }

  private indexarCatalogoPorTitulo(
    catalogos: TituloTarefaCatalogo[],
  ): Map<string, TituloTarefaCatalogo[]> {
    const mapa = new Map<string, TituloTarefaCatalogo[]>();

    catalogos.forEach((catalogo) => {
      const titulo = catalogo.obterTituloExibicao();

      if (!titulo) {
        return;
      }

      const chave = normalizarTexto(titulo);
      mapa.set(chave, [...(mapa.get(chave) ?? []), catalogo]);
    });

    return mapa;
  }

  private resolverCatalogoTarefa(
    tarefa: Tarefa,
    catalogoPorTitulo: Map<string, TituloTarefaCatalogo[]>,
  ): CatalogoResumo | null {
    const catalogoVinculado = tarefa.obterTituloCatalogo();

    if (catalogoVinculado) {
      return catalogoVinculado;
    }

    return catalogoPorTitulo.get(normalizarTexto(tarefa.titulo))?.[0] ?? null;
  }

  private toTarefaDetalhe(tarefa: Tarefa): TarefaTituloDetalheDTO {
    const atividades = tarefa
      .obterAtividades()
      .sort((a, b) => a.data.getTime() - b.data.getTime());

    const criacao = atividades.find((a) => a.tipo === 'CRIACAO');
    const inicio = atividades.find(
      (a) =>
        a.tipo === 'ALTERACAO_STATUS' &&
        a.descricao.toLowerCase().includes('inici'),
    );
    const conclusao = atividades.find(
      (a) =>
        a.tipo === 'ALTERACAO_STATUS' &&
        a.descricao.toLowerCase().includes('conclu'),
    );

    const criadaEm = criacao?.data ?? null;
    const iniciadaEm = inicio?.data ?? null;
    const concluidaEm = conclusao?.data ?? null;
    const duracaoHoras =
      criadaEm && concluidaEm
        ? Number(((concluidaEm.getTime() - criadaEm.getTime()) / 36e5).toFixed(2))
        : null;
    const agora = new Date();
    const tempoEsperaHoras =
      criadaEm && iniciadaEm
        ? this.calcularHoras(criadaEm, iniciadaEm)
        : criadaEm && !iniciadaEm
          ? this.calcularHoras(criadaEm, concluidaEm ?? agora)
          : null;
    const tempoExecucaoHoras =
      iniciadaEm && concluidaEm
        ? this.calcularHoras(iniciadaEm, concluidaEm)
        : iniciadaEm && !concluidaEm
          ? this.calcularHoras(iniciadaEm, agora)
          : null;

    let dataInicio: Date | null = null;
    let dataFim: Date | null = null;

    if (tarefa instanceof TarefaComPrazo) {
      dataInicio = tarefa.getPeriodo().getInicio();
      dataFim = tarefa.getPeriodo().getFim();
    }

    return {
      tarefaId: tarefa.id,
      status: tarefa.obterStatus(),
      prioridade: tarefa.obterPrioridade(),
      projetoNome: tarefa.obterProjeto()?.nome ?? null,
      criadaEm,
      iniciadaEm,
      concluidaEm,
      duracaoHoras,
      tempoEsperaHoras,
      tempoExecucaoHoras,
      dataInicio,
      dataFim,
    };
  }

  private calcularHoras(inicio: Date, fim: Date): number {
    return Number(Math.max(0, (fim.getTime() - inicio.getTime()) / 36e5).toFixed(2));
  }
}
