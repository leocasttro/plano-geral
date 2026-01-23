import { UUID } from "crypto";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";

@Entity("tb_tarefas")
export class TarefaORM {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 255 })
  titulo!: string;

  @Column({ type: "text", nullable: true })
  descricao?: string | null;

  @Column({ length: 30 })
  status!: string;

  @Column({ length: 30 })
  prioridade!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  responsavel?: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
