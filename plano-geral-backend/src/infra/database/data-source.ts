// import "reflect-metadata";
// import { DataSource } from "typeorm";
// import { Tarefa } from "../entities/tarefa.entity";
// import dotenv from "dotenv";

// dotenv.config();

// export const AppDataSource = new DataSource({
//   type: "postgres",
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT),
//   username: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   synchronize: false, // muito importante: deve estar false!
//   logging: true,
//   entities: [Tarefa],
//   migrations: ["src/database/migrations/*.ts"],
// });
