import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("tb_tarefas")
export class Tarefa {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  titulo!: string;

  @Column({ nullable: true })
  descricao?: string;

  @Column({ default: "pendente" })
  status!: string;

  @Column({ nullable: true })
  responsavel?: string;

  @CreateDateColumn()
  dataCriacao!: Date;

  @Column({ nullable: true })
  urlImagem?: string;

  @Column({ nullable: true })
  badgeClasseCor?: string;

  @Column({ nullable: true })
  badgeTexto?: string;

  @Column({ type: "jsonb", default: [] })
  checklist!: { nome: string; concluido: boolean }[];
}
