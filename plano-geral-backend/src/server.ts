import express from "express";
import cors from "cors";
import { AppDataSource } from "./database/data-source";
import tarefaRoutes from "./routes/tarefas.routes";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/tarefas", tarefaRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Banco de dados conectado com sucesso!");
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("Erro ao conectar ao banco:", err));
