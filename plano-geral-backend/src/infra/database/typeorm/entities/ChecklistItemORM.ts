import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TarefaORM } from './TarefaORM';

@Entity('tb_tarefa_checklist_itens')
export class ChecklistItemORM {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tarefa_id!: string;

  @Column()
  nome!: string;

  @Column()
  concluido!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => TarefaORM, (tarefa) => tarefa.checklist, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tarefa_id' })
  tarefa!: TarefaORM;
}
