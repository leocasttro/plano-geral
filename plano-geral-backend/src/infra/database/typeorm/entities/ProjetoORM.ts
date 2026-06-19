import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { TarefaORM } from "./TarefaORM";
import { ManyToOne, JoinColumn } from 'typeorm';
import { UserORM } from './UserOrm';

@Entity('tb_projetos')
export class ProjetoORM {
  @PrimaryColumn()
  id!: string;

  @Column()
  nome!: string;

  @Column({ nullable: true })
  descricao!: string;

  @Column()
  status!: string;

  @CreateDateColumn({ name: 'created_at'})
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => TarefaORM, tarefa => tarefa.projeto)
  tarefas!: TarefaORM[];

  @Column({ name: 'centro_custo', type: 'varchar', nullable: true })
  centroCusto!: string | null;

  @Column({ name: 'coordenador_id', type: 'uuid', nullable: true })
  coordenadorId!: string | null;

  @ManyToOne(() => UserORM, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'coordenador_id' })
  coordenadorUsuario?: UserORM | null;
}
