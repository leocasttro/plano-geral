import cors from 'cors';
import express from 'express';
import tarefasRoutes from './infra/http/routes/tarefas.routes';

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
}));

app.use(express.json());
app.use('/tarefas', tarefasRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
