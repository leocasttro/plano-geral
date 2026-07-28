import {Notificacao} from '../entities/Notificacao';

export interface NotificacaoRepository {
  save(notificacao: Notificacao): Promise<void>;
  saveMany(notificacao: Notificacao[]): Promise<void>;
  findByUsuario(ususarioId: string): Promise<Notificacao[]>;
  findById(id: string): Promise<Notificacao | null>;
  countNaoLidas(usuarioId: string): Promise<number>;
}
