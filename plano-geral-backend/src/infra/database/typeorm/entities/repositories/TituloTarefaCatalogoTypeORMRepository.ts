import { Brackets, Repository } from 'typeorm';
import {
  ListarTitulosTarefaCatalogoFiltro,
  TituloTarefaCatalogoRepository,
} from '../../../../../domain/repositories/TituloTarefaCatalogoRepository';
import {
  normalizarTexto,
  TituloTarefaCatalogo,
} from '../../../../../domain/entities/TituloTarefaCatalogo';
import { AppDataSource } from '../../../data-source';
import { TituloTarefaCatalogoORM } from '../TituloTarefaCatalogoORM';
import { TituloTarefaCatalogoMapper } from '../../mappers/TituloTarefaCatalogoMapper';

export class TituloTarefaCatalogoTypeORMRepository
  implements TituloTarefaCatalogoRepository {
  private repository: Repository<TituloTarefaCatalogoORM>;

  constructor() {
    this.repository = AppDataSource.getRepository(TituloTarefaCatalogoORM);
  }

  async save(titulo: TituloTarefaCatalogo): Promise<void> {
    await this.repository.save(TituloTarefaCatalogoMapper.toORM(titulo));
  }

  async findById(id: string): Promise<TituloTarefaCatalogo | null> {
    const row = await this.repository.findOne({ where: { id } });

    return row ? TituloTarefaCatalogoMapper.toDomain(row) : null;
  }

  async list(
    filtro: ListarTitulosTarefaCatalogoFiltro = {},
  ): Promise<TituloTarefaCatalogo[]> {
    const query = this.repository.createQueryBuilder('titulo');

    if (filtro.ativo !== undefined) {
      query.andWhere('titulo.ativo = :ativo', { ativo: filtro.ativo });
    }

    if (filtro.acao) {
      query.andWhere('titulo.acao = :acao', { acao: filtro.acao });
    }

    if (filtro.componente) {
      query.andWhere('titulo.componente = :componente', {
        componente: filtro.componente,
      });
    }

    if (filtro.atividadePrincipal) {
      query.andWhere('titulo.atividadePrincipal = :atividadePrincipal', {
        atividadePrincipal: filtro.atividadePrincipal,
      });
    }

    if (filtro.subatividade) {
      query.andWhere('titulo.subatividade = :subatividade', {
        subatividade: filtro.subatividade,
      });
    }

    if (filtro.busca?.trim()) {
      const busca = `%${normalizarTexto(filtro.busca)}%`;

      query.andWhere(
        new Brackets((qb) => {
          qb.where('titulo.tituloNormalizado LIKE :busca', { busca })
            .orWhere('LOWER(titulo.acao) LIKE :busca', { busca })
            .orWhere('LOWER(titulo.componente) LIKE :busca', { busca })
            .orWhere('LOWER(titulo.atividadePrincipal) LIKE :busca', { busca })
            .orWhere('LOWER(titulo.subatividade) LIKE :busca', { busca });
        }),
      );
    }

    const rows = await query
      .orderBy('titulo.createdAt', 'ASC')
      .addOrderBy('titulo.componente', 'ASC', 'NULLS LAST')
      .addOrderBy('titulo.atividadePrincipal', 'ASC', 'NULLS LAST')
      .addOrderBy('titulo.subatividade', 'ASC', 'NULLS LAST')
      .limit(1000)
      .getMany();

    return rows.map(TituloTarefaCatalogoMapper.toDomain);
  }
}
