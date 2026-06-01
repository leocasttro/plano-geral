import cors from "cors";
import express from "express";
import "reflect-metadata";
import tarefasRoutes from "./infra/http/routes/tarefas.routes";
import usersRoutes from "./infra/http/routes/users.route";
import { AppDataSource } from "./infra/database/data-source";
import authRoutes from './infra/http/routes/auth.routes';
import {ensureAuthenticated} from './infra/http/middlewares/ensureAuthenticated';
import projetosRoutes from './infra/http/routes/projetos.routes';
import relatoriosRoutes from './infra/http/routes/relatorios.routes';

async function bootstrap() {
  await AppDataSource.initialize();

  const app = express();
  app.use(express.json());

  app.use(
    cors({
      origin: "http://localhost:4200",
    })
  );

  app.use('/auth', authRoutes);

  app.use(ensureAuthenticated);

  app.use('/tarefas', tarefasRoutes);
  app.use('/projetos', projetosRoutes);
  app.use('/users', usersRoutes);
  app.use('/relatorios', relatoriosRoutes);

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
