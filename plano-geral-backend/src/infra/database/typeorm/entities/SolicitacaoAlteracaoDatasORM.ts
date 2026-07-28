import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_solicitacoes_alteracao_datas')
export class SolicitacaoAlteracaoDatasORM {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'tarefa_id', type: 'uuid' })
  tarefaId!: string;

  @Column({ name: 'solicitante_id', type: 'uuid' })
  solicitanteId!: string;

  @Column({ name: 'solicitante_nome', type: 'varchar', length: 120 })
  solicitanteNome!: string;

  @Column({ name: 'data_inicio', type: 'date', nullable: true })
  dataInicio!: Date | string | null;

  @Column({ name: 'data_fim', type: 'date', nullable: true })
  dataFim!: Date | string | null;

  @Column({ type: 'text' })
  justificativa!: string;

  @Column({ type: 'varchar', length: 20 })
  status!: string;

  @Column({ name: 'aprovador_id', type: 'uuid', nullable: true })
  aprovadorId!: string | null;

  @Column({ name: 'aprovador_nome', type: 'varchar', length: 120, nullable: true })
  aprovadorNome!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
