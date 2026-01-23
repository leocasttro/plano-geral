import cors from "cors";
import express from "express";
import "reflect-metadata";
import tarefasRoutes from "./infra/http/routes/tarefas.routes";
import { AppDataSource } from "./infra/database/data-source"; // ajuste esse caminho

async function bootstrap() {
  await AppDataSource.initialize();
  console.log("✅ Database connected");

  const app = express();

  app.use(
    cors({
      origin: "http://localhost:4200",
    })
  );

  app.use(express.json());
  app.use("/tarefas", tarefasRoutes);

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
