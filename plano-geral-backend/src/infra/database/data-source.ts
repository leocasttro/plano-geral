import path from "path";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'plano_geral',
  synchronize: false,
  logging: true,
  entities: [path.join(__dirname, 'typeorm/entities/**/*.{ts,js}')],
  migrations: [path.join(__dirname, 'typeorm/migrations/**/*.{ts,js}')],
})
