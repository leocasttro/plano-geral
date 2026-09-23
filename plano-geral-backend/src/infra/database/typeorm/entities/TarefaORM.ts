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
import { TituloTarefaCatalogoORM } from './TituloTarefaCatalogoORM';

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

  @Column({ name: 'responsaveis_ids', type: 'uuid', array: true, default: [] })
  responsaveis!: string[];

  @Column({ name: 'criador_id', type: 'uuid', nullable: true })
  criadorId?: string | null;

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

  @Column({ name: 'titulo_catalogo_id', type: 'uuid', nullable: true })
  tituloCatalogoId!: string | null;

  @Column({ name: 'is_macro_tarefa', type: 'boolean', default: false})
  isMacroTarefa!: boolean;

  @Column({ name: 'tarefa_pai_id', type: 'uuid', nullable: true })
  tarefaPaiId?: string | null;

  @ManyToOne(() => TarefaORM, (tarefa) => tarefa.subTarefas, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarefa_pai_id' })
  tarefaPai?: TarefaORM | null;

  @OneToMany(() => TarefaORM, (tarefa) => tarefa.tarefaPai)
  subTarefas?: TarefaORM[];

  @ManyToOne(() => TituloTarefaCatalogoORM, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'titulo_catalogo_id' })
  tituloCatalogo?: TituloTarefaCatalogoORM | null;

  @OneToMany(() => AtividadeORM, (a) => a.tarefa, { cascade: ['insert', 'update', 'remove'] })
  atividades!: AtividadeORM[];

  @OneToMany(() => ChecklistItemORM, (c) => c.tarefa, {
    cascade: ['insert', 'update', 'remove'],
  })
  checklist!: ChecklistItemORM[];

  @ManyToOne(() => ProjetoORM, (projeto) => projeto.tarefas, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'projeto_id' })
  projeto!: ProjetoORM | null
}
