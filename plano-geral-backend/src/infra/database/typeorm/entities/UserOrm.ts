import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('tb_usuarios')
export class UserORM {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'nome', default: '' })
  nome!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  senha_hash!: string;

  @Column({ default: 'USER' })
  perfil_id?: string;

  @Column({ default: true })
  ativo!: boolean;

  @Column({ name: 'must_change_password', default: false })
  must_change_password!: boolean;

  @Column({ name: 'password_change_token_hash', type: 'varchar', length: 255, nullable: true })
  password_change_token_hash?: string | null;

  @Column({ name: 'password_change_token_expires_at', type: 'timestamp', nullable: true })
  password_change_token_expires_at?: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;
}
