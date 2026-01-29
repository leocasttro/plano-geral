import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TarefaORM } from './TarefaORM';

@Entity('tb_tarefa_atividades')
export class AtividadeORM {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tarefa_id!: string;

  @Column()
  tipo!: string;

  @Column()
  usuario!: string;

  @Column()
  descricao!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => TarefaORM, (tarefa) => tarefa.atividades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tarefa_id' })
  tarefa!: TarefaORM;
}
