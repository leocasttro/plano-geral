import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity('tb_notificacoes')
export class NotificacaoORM {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId!: string;

  @Column({ length: 50 })
  tipo!: string;

  @Column({ length: 120 })
  titulo!: string;

  @Column({ type: 'text' })
  mensagem!: string;

  @Column({ type: 'text', nullable: true })
  link!: string | null;

  @Column({ default: false })
  lida!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
