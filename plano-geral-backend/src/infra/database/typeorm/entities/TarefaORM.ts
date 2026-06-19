import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AtividadeORM } from './AtividadeORM';
import { ChecklistItemORM } from './ChecklistItemORM';
import { ProjetoORM } from './ProjetoORM';
import {UserORM} from './UserOrm';

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

  @Column({ name: 'responsavel_id', type: 'uuid', nullable: true })
  responsavel?: string | null;

  @Column({ name: 'criador_id', type: 'uuid', nullable: true })
  criadorId?: string | null;

  @ManyToOne(() => UserORM, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'responsavel_id' })
  responsavelUsuario?: UserORM | null;

  @ManyToOne(() => UserORM, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'criador_id' })
  criadorUsuario?: UserORM | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'data_inicio', type: 'date', nullable: true })
  dataInicio!: Date | string | null;

  @Column({ name: 'data_fim', type: 'date', nullable: true })
  dataFim!: Date | string | null;

  @OneToMany(() => AtividadeORM, (a) => a.tarefa, { cascade: ['insert'] })
  atividades!: AtividadeORM[];

  @OneToMany(() => ChecklistItemORM, (c) => c.tarefa, {
    cascade: ['insert', 'update'],
  })
  checklist!: ChecklistItemORM[];

  @ManyToOne(() => ProjetoORM, (projeto) => projeto.tarefas, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'projeto_id' })
  projeto!: ProjetoORM | null
}
