import { Repository } from 'typeorm';
import { NotificacaoRepository } from '../../../../../domain/repositories/NotificacaoRepository';
import { Notificacao } from '../../../../../domain/entities/Notificacao';
import { AppDataSource } from '../../../data-source';
import { NotificacaoORM } from '../NotificacaoORM';
import { NotificacaoMapper } from '../../mappers/NotificacaoMapper';

export class NotificacaoTypeORMRepository implements NotificacaoRepository {
  private repository: Repository<NotificacaoORM>;

  constructor() {
    this.repository = AppDataSource.getRepository(NotificacaoORM);
  }

  async save(notificacao: Notificacao): Promise<void> {
    await this.repository.save(NotificacaoMapper.toORM(notificacao));
  }

  async saveMany(notificacoes: Notificacao[]): Promise<void> {
    await this.repository.save(
      notificacoes.map((notificacao) => NotificacaoMapper.toORM(notificacao)),
    );
  }

  async findByUsuario(usuarioId: string): Promise<Notificacao[]> {
    const rows = await this.repository.find({
      where: { usuarioId },
      order: { createdAt: 'DESC' },
    });

    return rows.map(NotificacaoMapper.toDomain);
  }

  async findById(id: string): Promise<Notificacao | null> {
    const row = await this.repository.findOne({ where: { id } });
    return row ? NotificacaoMapper.toDomain(row) : null;
  }

  async countNaoLidas(usuarioId: string): Promise<number> {
    return this.repository.count({
      where: {
        usuarioId,
        lida: false,
      },
    });
  }
}
