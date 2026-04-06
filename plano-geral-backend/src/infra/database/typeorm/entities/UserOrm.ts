import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('tb_usuarios')
export class UserORM {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  nome!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  senha_hash?: string;

  @Column({ default: 'USER' })
  perfil_id?: string;

  @Column({ default: true })
  ativo!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;
}
