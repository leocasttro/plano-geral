import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_titulos_tarefa_catalogo')
export class TituloTarefaCatalogoORM {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  acao!: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  componente!: string | null;

  @Column({ name: 'atividade_principal', type: 'varchar', length: 255, nullable: true })
  atividadePrincipal!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subatividade!: string | null;

  @Column({ type: 'text', nullable: true })
  descricao!: string | null;

  @Column({ name: 'titulo_normalizado', type: 'varchar', length: 600 })
  tituloNormalizado!: string;

  @Column({ type: 'boolean', default: true })
  ativo!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
