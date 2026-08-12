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
import notificacoesRoutes from './infra/http/routes/notificacoes.routes';
import titulosTarefaRoutes from './infra/http/routes/titulos-tarefa.routes';
import { securityHeaders } from './infra/http/middlewares/securityHeaders';

async function bootstrap() {
  await AppDataSource.initialize();

  const app = express();
  app.use(securityHeaders);
  app.use(express.json({ limit: '1mb' }));

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "http://localhost:4200",
    })
  );

  app.use('/auth', authRoutes);

  app.use(ensureAuthenticated);

  app.use('/tarefas', tarefasRoutes);
  app.use('/projetos', projetosRoutes);
  app.use('/users', usersRoutes);
  app.use('/relatorios', relatoriosRoutes);
  app.use('/notificacoes', notificacoesRoutes);
  app.use('/titulos-tarefa', titulosTarefaRoutes);

  const PORT = Number(process.env.PORT ?? 3000);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
