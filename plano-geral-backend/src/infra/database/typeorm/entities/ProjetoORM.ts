import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { TarefaORM } from "./TarefaORM";

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
}
