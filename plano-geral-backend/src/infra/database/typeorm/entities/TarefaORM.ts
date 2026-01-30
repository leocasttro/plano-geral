import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AtividadeORM } from './AtividadeORM';
import { ChecklistItemORM } from './ChecklistItemORM';

@Entity('tb_tarefas')
export class TarefaORM {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string | null;

  @Column({ length: 30 })
  status!: string;

  @Column({ length: 30 })
  prioridade!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  responsavel?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => AtividadeORM, (a) => a.tarefa, { cascade: ['insert'] })
  atividades!: AtividadeORM[];

  @OneToMany(() => ChecklistItemORM, (c) => c.tarefa, {
    cascade: ['insert', 'update'],
  })
  checklist!: ChecklistItemORM[];
}
