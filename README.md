# Plano Geral Prosul

Sistema web para gestão de projetos, tarefas, calendário, relatórios e usuários. O projeto é dividido em duas aplicações:

- `plano-geral-backend`: API REST em Node.js, Express, TypeScript, TypeORM e PostgreSQL.
- `plano-geral-frontend`: aplicação Angular para uso do Kanban, calendário, relatórios, projetos e configurações.

## Funcionalidades

- Login com JWT.
- Kanban de tarefas por status.
- Criação, listagem, atualização e exclusão de tarefas.
- Comentários e histórico de atividades da tarefa.
- Checklist por tarefa.
- Alteração de prioridade, responsável, status e datas.
- Pesquisa no Kanban por título da tarefa ou responsável.
- Calendário visual com modos de visualização por mês, semana, dia e ano.
- Visualização contínua das tarefas no calendário entre data inicial e data final.
- Gestão de projetos e status do projeto.
- Relatórios e indicadores de tarefas, projetos, usuários e calendário.
- Configurações administrativas para criação de usuários, alteração de perfil e ativação/desativação.
- Toasts no frontend para feedback de alterações, erros e validações.

## Tecnologias

### Backend

- Node.js
- Express 5
- TypeScript
- TypeORM
- PostgreSQL
- JWT com `jsonwebtoken`
- `bcryptjs` para senha
- `dotenv` para variáveis de ambiente
- CORS configurado para o frontend local

### Frontend

- Angular 20
- TypeScript
- Angular Router
- Angular Forms
- Angular HTTP Client
- Bootstrap
- ng-bootstrap
- Font Awesome
- CoreUI
- ApexCharts / ng-apexcharts
- RxJS

## Arquitetura

O backend segue uma organização próxima de Clean Architecture, separando regras de domínio, casos de uso, infraestrutura e interface HTTP.

```text
plano-geral-backend/src
├── application
│   ├── dtos
│   ├── services
│   └── use-cases
├── domain
│   ├── entities
│   ├── policies
│   ├── repositories
│   ├── services
│   └── value-objects
├── infra
│   ├── database
│   │   └── typeorm
│   └── http
│       ├── controllers
│       ├── factories
│       ├── middlewares
│       └── routes
└── server.ts
```

Camadas principais:

- `domain`: entidades, regras de negócio, políticas de acesso, status, prioridades e contratos de repositório.
- `application`: casos de uso e DTOs que coordenam as operações do sistema.
- `infra/database`: implementação TypeORM, entidades ORM, mappers e migrations.
- `infra/http`: rotas, controllers, middlewares de autenticação/autorização e factories.
- `server.ts`: inicialização do Express, banco, CORS e rotas.

O frontend é organizado por domínio, features e componentes compartilhados.

```text
plano-geral-frontend/src/app
├── domain
│   ├── auth
│   ├── projeto
│   ├── relatorio
│   ├── tarefa
│   └── usuario
├── feature
│   ├── calendario
│   ├── configuracoes
│   ├── login
│   ├── planoGeral
│   ├── projeto
│   └── relatorio
└── shared
    ├── components
    ├── dashboard
    ├── drawers
    ├── modals
    ├── nav-bar
    ├── services
    ├── side-bar
    └── toast
```

Camadas principais:

- `domain`: serviços de API, modelos e autenticação.
- `feature`: telas principais do sistema.
- `shared`: componentes reutilizáveis, drawer de tarefa, modal de cadastro, menu, navbar, dashboards e toasts.

## Requisitos

- Node.js compatível com Angular 20.
- npm.
- PostgreSQL.
- Banco de dados criado para a aplicação.

## Configuração do Backend

Entre na pasta do backend:

```bash
cd plano-geral-backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Configure as variáveis:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=plano_geral

TYPEORM_SYNCHRONIZE=true
TYPEORM_LOGGING=false

JWT_SECRET=sua_chave_segura
JWT_EXPIRES_IN=8h
```

Observações:

- Em desenvolvimento, `TYPEORM_SYNCHRONIZE=true` cria/sincroniza as tabelas automaticamente.
- Em produção, prefira `TYPEORM_SYNCHRONIZE=false` e use migrations.
- Gere uma chave JWT segura, por exemplo:

```bash
openssl rand -base64 64
```

Execute o backend em desenvolvimento:

```bash
npm run dev
```

A API sobe em:

```text
http://localhost:3000
```

Build do backend:

```bash
npm run build
```

Executar versão compilada:

```bash
npm start
```

## Configuração do Frontend

Entre na pasta do frontend:

```bash
cd plano-geral-frontend
```

Instale as dependências:

```bash
npm install
```

Confirme a URL da API nos environments:

```ts
apiUrl: 'http://localhost:3000'
```

Execute o frontend:

```bash
npm start
```

A aplicação sobe em:

```text
http://localhost:4200
```

Build do frontend:

```bash
npm run build
```

## Como Executar o Sistema

1. Inicie o PostgreSQL.
2. Crie o banco configurado em `DB_DATABASE`.
3. Configure `plano-geral-backend/.env`.
4. Execute o backend com `npm run dev`.
5. Execute o frontend com `npm start`.
6. Acesse `http://localhost:4200`.
7. Faça login com um usuário cadastrado no banco.

## Como Usar

### Login

Acesse `/login`, informe e-mail e senha. Após autenticar, o token JWT é salvo no navegador e enviado automaticamente nas requisições protegidas.

### Plano Geral / Kanban

Rota:

```text
/planoGeral
```

Use esta tela para:

- Visualizar tarefas por status.
- Criar novas tarefas.
- Mover tarefas entre colunas.
- Pesquisar tarefas pelo título ou pelo responsável.
- Abrir o drawer da tarefa ao clicar em uma tarefa.

No drawer da tarefa é possível:

- Ver descrição, responsável, projeto, datas e participantes.
- Alterar prioridade.
- Atribuir responsável.
- Alterar datas de início e fim.
- Adicionar comentários.
- Adicionar e concluir itens de checklist.
- Ver atividades da tarefa.
- Apagar a tarefa pelo botão fixo no rodapé do drawer.

### Calendário

Rota:

```text
/calendario
```

Use esta tela para visualizar tarefas por período. O calendário usa a data de início e fim da tarefa para exibir uma linha contínua entre as datas.

Modos disponíveis:

- Mês
- Semana
- Dia
- Ano

### Projetos

Rota:

```text
/projetos
```

Use esta tela para:

- Criar projetos.
- Listar projetos.
- Ver tarefas vinculadas ao projeto.
- Alterar status do projeto.

Status de projeto usados pelo sistema:

- `ATIVO`
- `PAUSADO`
- `CONCLUIDO`
- `CANCELADO`

### Relatórios

Rota:

```text
/relatorios
```

Use esta tela para acompanhar indicadores como:

- Dashboard geral.
- Carga por usuário.
- Métricas por projeto.
- Status de tarefas.
- Alterações de datas.
- Tempo de tarefa por responsável.

Alguns relatórios exigem perfil administrativo.

### Configurações

Rota:

```text
/configuracoes
```

Use esta tela para:

- Criar usuários.
- Alterar perfil de usuário.
- Ativar ou desativar usuários.
- Ver resumo dos perfis.

Perfis usados no sistema:

- `ADMIN`: acesso administrativo.
- `USER`: usuário operacional.
- `MANAGER`: perfil gerencial.
- `VIEWER`: perfil de visualização.

No frontend, os perfis são apresentados em português para melhorar a experiência do usuário.

## Rotas da API

### Autenticação

Base:

```text
/auth
```

Endpoints:

- `POST /auth/login`

### Tarefas

Base:

```text
/tarefas
```

Endpoints:

- `POST /tarefas`
- `GET /tarefas`
- `GET /tarefas/:id`
- `POST /tarefas/:id/comentarios`
- `GET /tarefas/:id/atividades`
- `POST /tarefas/:id/checklist`
- `PATCH /tarefas/:id/checklist/:itemId/toggle`
- `PATCH /tarefas/:id/prioridade`
- `POST /tarefas/:id/status`
- `POST /tarefas/:id/atribuirResponsavel`
- `PATCH /tarefas/:id/datas`
- `DELETE /tarefas/:id`

### Projetos

Base:

```text
/projetos
```

Endpoints:

- `POST /projetos`
- `GET /projetos`
- `GET /projetos/:id`
- `PATCH /projetos/:id/status`
- `POST /projetos/bulk`

### Usuários

Base:

```text
/users
```

Endpoints:

- `GET /users`
- `GET /users/admin/all`
- `POST /users/createUser`
- `PATCH /users/:id/perfil`
- `PATCH /users/:id/status`

### Relatórios

Base:

```text
/relatorios
```

Endpoints:

- `GET /relatorios/dashboard`
- `GET /relatorios/calendario`
- `GET /relatorios/usuarios/carga`
- `GET /relatorios/projetos/metricas`
- `GET /relatorios/projetos/:projetoId/resumo`
- `GET /relatorios/tarefas/:tarefaId/alteracoes-datas`
- `GET /relatorios/tarefas/:tarefaId/tempo-responsavel`

## Autenticação e Autorização

- O login retorna um JWT e os dados do usuário.
- O frontend salva o token no `localStorage`.
- O interceptor HTTP adiciona `Authorization: Bearer <token>` nas requisições.
- Rotas protegidas no Angular usam `authGuard`.
- No backend, `ensureAuthenticated` valida o token.
- Rotas administrativas usam `ensureAdmin`.

## Status e Prioridades

Status de tarefa:

- `PENDENTE`
- `EM_ANDAMENTO`
- `CONCLUIDA`

Prioridades:

- `BAIXA`
- `NORMAL`
- `ALTA`
- `CRITICA`

## Scripts Úteis

Backend:

```bash
npm run dev
npm run build
npm start
npm run migration:run
```

Frontend:

```bash
npm start
npm run build
npm test
```

Checagem TypeScript do frontend:

```bash
npx tsc --noEmit
```
