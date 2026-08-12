# Plano Geral Prosul

Sistema web para organizar projetos, tarefas, prazos, responsáveis, calendário, notificações e relatórios operacionais.

O projeto é dividido em duas aplicações:

- `plano-geral-backend`: API em Node.js, Express, TypeScript, TypeORM e PostgreSQL.
- `plano-geral-frontend`: aplicação Angular usada pelos usuários no navegador.

## Visão Geral

O Plano Geral centraliza o acompanhamento das atividades por projeto. A ideia principal é permitir que a equipe veja o que precisa ser feito, quem está responsável, quais tarefas estão em andamento, quais estão atrasadas e onde existe risco operacional.

Principais recursos:

- Login com controle de acesso por perfil.
- Cadastro de usuários pelo administrador.
- Primeiro acesso com troca obrigatória de senha.
- Envio de e-mail para definição ou confirmação de senha.
- Kanban de tarefas por status.
- Filtro de tarefas por projeto, usuário, componente, atividade, subatividade e período.
- Catálogo de títulos de tarefa por componente, atividade principal e subatividade.
- Cadastro de tarefa com título automático ou título manual quando o catálogo exigir.
- Vinculação de tarefas a projetos.
- Vinculação de coordenador/gestor ao projeto.
- Responsável por tarefa.
- Datas de início e fim.
- Trava para iniciar ou concluir tarefas sem responsável e sem datas.
- Solicitação e aprovação de alteração de datas.
- Comentários, checklist e histórico da tarefa.
- Notificações no sistema.
- Notificações por e-mail para gestor do projeto em eventos relevantes.
- Calendário por dia, semana, mês e ano.
- Relatório geral para gestão.
- Relatório pessoal para colaboradores.
- Configuração de usuários, perfis, ativação, desativação e exclusão.

## Perfis de Acesso

Os perfis controlam o que cada pessoa consegue visualizar ou alterar.

- `ADMIN`: administra usuários, configurações e acessa recursos gerenciais.
- `MANAGER` ou `GESTOR`: acompanha projetos, tarefas, filtros e relatórios gerenciais.
- `USER`: perfil operacional/colaborador, focado nas próprias tarefas e no relatório pessoal.
- `VIEWER`: perfil de visualização.

## Fluxo de Usuários e Senha

Quando um administrador cadastra um usuário, o sistema pode exigir a troca de senha no primeiro acesso.

O usuário recebe um link por e-mail para definir a senha. Esse link abre uma tela simples, no padrão da tela de login, sem menu lateral e sem navegação interna.

O sistema valida:

- se o token ainda existe;
- se o token não expirou;
- se a nova senha e a confirmação são iguais;
- se a senha atende ao tamanho mínimo configurado.

Depois da confirmação, o usuário passa a acessar normalmente com a nova senha.

## E-mail

O backend pode enviar e-mails usando SMTP, inclusive Gmail.

Variáveis usadas:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=sisinfo.ls@prosul.com
MAIL_PASS=sua_senha_ou_app_password
MAIL_FROM=sisinfo.ls@prosul.com
FRONTEND_URL=http://localhost:4200
```

Observações:

- `MAIL_USER` é a conta usada para autenticar no SMTP.
- `MAIL_FROM` é o remetente exibido no e-mail.
- Quando `MAIL_FROM` não for informado, o sistema usa `MAIL_USER`.
- Para Gmail, normalmente é necessário usar senha de aplicativo.

## Projetos

Na tela de projetos é possível:

- criar projetos;
- informar nome, centro de custo e coordenador;
- listar projetos cadastrados;
- acompanhar as tarefas vinculadas;
- alterar o status do projeto.

Status de projeto:

- `ATIVO`
- `PAUSADO`
- `CONCLUIDO`
- `CANCELADO`

O centro de custo aparece nos relatórios para facilitar a diferenciação entre projetos com nomes parecidos.

## Tarefas e Kanban

A tela de tarefas organiza o trabalho em colunas.

Status de tarefa:

- `PENDENTE`
- `EM_ANDAMENTO`
- `CONCLUIDA`

No Kanban é possível:

- criar tarefas;
- abrir o detalhe da tarefa;
- alterar responsável;
- alterar prioridade;
- alterar datas;
- adicionar comentários;
- adicionar checklist;
- acompanhar histórico;
- excluir tarefas quando permitido;
- mover tarefas entre status.

Para mover uma tarefa para `EM_ANDAMENTO` ou `CONCLUIDA`, ela precisa ter:

- responsável definido;
- data de início;
- data de fim.

Essa regra evita que uma tarefa entre em execução ou seja concluída sem dados mínimos para acompanhamento.

## Filtros de Tarefas

O botão de filtro no topo da tela de tarefas abre o mesmo componente de filtros usado nos relatórios.

Filtros disponíveis:

- projeto;
- usuário/responsável;
- componente;
- atividade principal;
- subatividade;
- período.

O filtro pode ser ativado e desativado pelo botão do topo. Ao desativar, os filtros aplicados são limpos.

Quando o quadro está filtrado, a movimentação por arrastar e soltar fica bloqueada. Isso evita mover uma tarefa sem visualizar o contexto completo das colunas.

## Catálogo de Tarefas

O catálogo padroniza os títulos das tarefas.

Cada item pode ter:

- componente;
- atividade principal;
- subatividade;
- título exibido.

Quando o item do catálogo é comum, o sistema gera o título automaticamente no formato:

```text
Atividade principal - Subatividade
```

Quando a subatividade for a opção de preenchimento manual, o sistema abre o campo de título para o responsável digitar. Nesse caso, a frase de instrução não vira título da tarefa.

Essa regra evita títulos como:

```text
Relatório Mensal - Abrir campo para preenchimento pelo responsável
```

## Solicitação de Alteração de Datas

Quando uma alteração de data exige aprovação, o responsável informa a justificativa e o gestor/coordenador do projeto recebe uma solicitação.

O gestor pode:

- aprovar a alteração;
- reprovar a alteração;
- abrir a tarefa diretamente pela notificação.

Durante a aprovação de alteração de datas, o objetivo é avaliar apenas a mudança de prazo. A alteração de responsável não faz parte desse fluxo.

## Notificações

O sistema possui notificações internas no sino do topo da tela.

Também pode enviar e-mails ao gestor do projeto quando ocorrerem eventos relevantes em tarefas vinculadas ao projeto.

Exemplos de eventos:

- solicitação de alteração de datas;
- comentário feito pelo responsável da tarefa;
- comentário feito por outro gestor;
- mudança de andamento da tarefa.

As notificações ajudam o gestor a acompanhar o projeto sem precisar procurar manualmente cada tarefa.

## Calendário

O calendário mostra as tarefas de acordo com as datas de início e fim.

Modos disponíveis:

- Dia
- Semana
- Mês
- Ano

Nas visualizações por dia e semana, o sistema exibe as tarefas de forma visual, incluindo o responsável pela atividade. Tarefas com vários dias aparecem no período correspondente.

## Contagem de Tempo

Os relatórios consideram tempo útil de trabalho.

Regra atual:

- conta apenas dias úteis;
- considera o expediente das 8h às 18h;
- ignora fins de semana;
- conta tempo de execução apenas depois que a tarefa entra em `EM_ANDAMENTO`;
- tarefas apenas planejadas ainda não pesam como execução.

Na visualização, tempos menores que 60 minutos aparecem em minutos. A partir de 60 minutos, o sistema apresenta em horas e minutos.

Exemplos:

- `30min`
- `1h`
- `1h 20min`

## Relatórios

A tela de relatórios foi pensada para leitura gerencial. Ela mostra onde está o maior volume de tarefas, onde o tempo está mais alto, quais projetos precisam de atenção e como está a carga dos usuários.

Os filtros no topo permitem analisar os dados por:

- projeto;
- usuário;
- componente;
- atividade principal;
- subatividade;
- período.

Os filtros são cumulativos. Por exemplo, é possível selecionar um projeto e depois um componente para enxergar apenas aquele recorte, sem perder a visão do projeto selecionado.

### Projetos

Mostra a situação geral dos projetos:

- total de tarefas;
- tarefas em andamento;
- tarefas atrasadas;
- avanço;
- respeito ao prazo;
- saúde do projeto;
- risco de atraso.

O projeto também exibe o centro de custo quando cadastrado.

### Risco Operacional por Projeto

Mostra quais projetos exigem mais atenção.

O índice vai de `0` a `10`:

- `0`: risco mínimo;
- `10`: risco máximo.

O risco considera principalmente:

- tarefas atrasadas;
- tarefas críticas abertas;
- tarefas que vencem nos próximos 7 dias;
- tarefas em andamento sem atualização recente;
- tarefas sem responsável ou sem data;
- tarefas concluídas, para dar contexto de avanço.

Como interpretar:

- barra baixa e índice baixo indicam menor atenção;
- barra alta e índice alto indicam maior atenção;
- tarefas atrasadas e críticas puxam o risco para cima;
- tarefas sem dados prejudicam a leitura porque dificultam prever prazo e carga;
- tarefas concluídas ajudam a entender se o projeto está avançando.

### Análise do Catálogo de Tarefas

Mostra onde o trabalho está consumindo mais tempo.

A análise é organizada em:

- maiores tempos por componente;
- maiores tempos por atividade principal;
- maiores tempos por subatividade;
- distribuição por atividade principal;
- títulos detalhados com busca.

Essa área ajuda a responder perguntas como:

- qual componente está levando mais tempo;
- qual atividade principal concentra maior esforço;
- qual subatividade está demorando mais;
- quais títulos aparecem com maior tempo médio;
- quais tarefas já têm tempo calculado e quais ainda não foram concluídas.

Ao clicar em um título, o sistema abre um detalhe com:

- total de tarefas;
- concluídas;
- percentual de conclusão;
- tempo médio;
- tarefas em andamento;
- tarefas pendentes;
- tempo de espera;
- tempo em execução.

O tempo usado nos gráficos considera principalmente o período em execução, e não o tempo parado apenas aguardando início.

### Desempenho por Usuário

Mostra a carga e o andamento por pessoa.

Ajuda a visualizar:

- total de tarefas por usuário;
- quantas estão em andamento;
- quantas estão atrasadas;
- quantas foram concluídas;
- percentual de conclusão.

Ao clicar em um usuário, o sistema abre detalhes das tarefas relacionadas.

### Disponibilidade dos Usuários

Mostra quando cada usuário tende a ficar disponível com base nas tarefas abertas e nas datas já planejadas.

O sistema considera:

- tarefas abertas;
- tarefas com data;
- tarefas sem data;
- tarefas atrasadas;
- tarefa futura já programada.

Exemplos de leitura:

- `Disponível`: não há tarefa ocupando o usuário hoje.
- `Ocupado`: há tarefas planejadas cobrindo o período atual.
- `Sem dados`: há tarefas sem datas suficientes para prever disponibilidade.

Quando existe uma tarefa futura, o relatório mostra a próxima tarefa programada mesmo que ela não esteja na semana atual.

### Relatório Pessoal

O colaborador possui uma tela própria para acompanhar seu desempenho básico.

Ela mostra:

- suas tarefas;
- status das tarefas;
- prioridades;
- desempenho geral;
- gráficos simples de acompanhamento.

## Configurações

Na tela de configurações, administradores podem:

- criar usuários;
- alterar perfil;
- ativar usuários;
- desativar usuários;
- excluir usuários criados;
- consultar resumo por perfil.

O sistema protege ações sensíveis, como impedir a remoção do próprio usuário logado e evitar deixar o sistema sem administrador ativo.

## Tecnologias

Backend:

- Node.js
- Express
- TypeScript
- TypeORM
- PostgreSQL
- JWT
- bcryptjs
- Nodemailer

Frontend:

- Angular
- TypeScript
- Angular Router
- Angular Forms
- Angular HTTP Client
- Bootstrap
- ng-bootstrap
- Font Awesome
- RxJS

## Como Executar

### Backend

Entre na pasta:

```bash
cd plano-geral-backend
```

Instale as dependências:

```bash
npm install
```

Configure o `.env`:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200
FRONTEND_URL=http://localhost:4200

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=plano_geral

TYPEORM_SYNCHRONIZE=true
TYPEORM_LOGGING=false

JWT_SECRET=sua_chave_segura
JWT_EXPIRES_IN=8h

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=sisinfo.ls@prosul.com
MAIL_PASS=sua_senha_ou_app_password
MAIL_FROM=sisinfo.ls@prosul.com
```

Execute:

```bash
npm run dev
```

A API fica disponível em:

```text
http://localhost:3000
```

### Frontend

Entre na pasta:

```bash
cd plano-geral-frontend
```

Instale as dependências:

```bash
npm install
```

Execute:

```bash
npm start
```

A aplicação fica disponível em:

```text
http://localhost:4200
```

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

## Observações de Ambiente

- Em desenvolvimento, `TYPEORM_SYNCHRONIZE=true` sincroniza o banco automaticamente.
- Em produção, use `TYPEORM_SYNCHRONIZE=false` e prefira migrations.
- O frontend com Angular exige uma versão de Node compatível com a versão instalada do Angular CLI.
- Para Gmail, configure uma senha de aplicativo quando a conta tiver autenticação em duas etapas.
