# Todoodle

[![CI](https://github.com/anddns/todoodle/actions/workflows/ci.yml/badge.svg)](https://github.com/anddns/todoodle/actions/workflows/ci.yml)

Aplicação de gerenciamento de tarefas, com uma API REST e um frontend web em React, organizada como um monorepo com arquitetura baseada em features. É um projeto de portfólio: o escopo da v1 e o que fica de fora estão em [docs/scope.md](docs/scope.md), e o motivo de cada escolha técnica está em [docs/decisions.md](docs/decisions.md).

**Em produção:** https://todoodle-rust.vercel.app

## Stack

### Geral

| Área              | Ferramenta                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| Runtime e pacotes | [Bun](https://bun.com) (workspaces, `bun check`)                                                       |
| Validação         | [Zod](https://zod.dev), compartilhado entre os pacotes                                                 |
| Lint e formatação | [Biome](https://biomejs.dev)                                                                           |
| Linguagem         | TypeScript em modo estrito                                                                             |
| Hospedagem        | [Vercel](https://vercel.com) (frontend na CDN e API como função) e [Turso](https://turso.tech) (banco) |

### API

| Área                 | Ferramenta                                                        |
| -------------------- | ----------------------------------------------------------------- |
| Framework HTTP       | [Elysia](https://elysiajs.com)                                    |
| Banco de dados e ORM | SQLite (libSQL) com [Drizzle ORM](https://orm.drizzle.team)       |
| Documentação da API  | OpenAPI com [Scalar](https://scalar.com), via `@elysiajs/openapi` |

### Frontend

| Área                  | Ferramenta                                                                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Interface e build     | [React](https://react.dev) com [Vite](https://vite.dev)                                                              |
| Componentes e estilos | [shadcn/ui](https://ui.shadcn.com) sobre [Base UI](https://base-ui.com), com [Tailwind CSS](https://tailwindcss.com) |
| Rotas                 | [TanStack Router](https://tanstack.com/router), com rotas baseadas em arquivos                                       |
| Dados do servidor     | [TanStack Query](https://tanstack.com/query)                                                                         |
| Cliente da API        | [Eden](https://elysiajs.com/eden/overview), com os tipos inferidos da própria API                                    |
| Formulários           | [React Hook Form](https://react-hook-form.com), com os schemas Zod compartilhados                                    |

## Como rodar

Pré-requisito: Bun 1.4 ou superior.

```sh
bun install
bun run db:migrate
bun run dev
```

O `bun run dev` sobe a API e o frontend juntos, em modo watch:

| Endereço                        | O que é                           |
| ------------------------------- | --------------------------------- |
| `http://localhost:5173`         | Frontend (abra este no navegador) |
| `http://localhost:3000`         | API                               |
| `http://localhost:3000/openapi` | Documentação interativa da API    |

Em desenvolvimento, o Vite repassa as requisições para `/v1` à API. Assim, o navegador vê um único endereço, e o cookie da sessão funciona sem configurar CORS.

### Variáveis de ambiente

Todas as variáveis têm valores padrão, então o arquivo `.env` é opcional. Para alterá-las, copie o exemplo:

```sh
cp apps/api/.env.example apps/api/.env
```

| Variável              | Padrão             | Descrição                                                                                           |
| --------------------- | ------------------ | --------------------------------------------------------------------------------------------------- |
| `PORT`                | `3000`             | Porta do servidor                                                                                   |
| `DATABASE_URL`        | `file:todoodle.db` | Arquivo local em desenvolvimento ou URL do banco no Turso (`libsql://...`)                          |
| `DATABASE_AUTH_TOKEN` | —                  | Token de acesso ao Turso (não é usado com arquivo local)                                            |
| `NODE_ENV`            | —                  | Com `production`, o cookie de sessão recebe o atributo `Secure` (só HTTPS)                          |
| `VERCEL`              | —                  | Definida pela própria Vercel. Com `1`, o limite de login lê o IP do visitante no header `x-real-ip` |

O frontend não tem variáveis de ambiente: ele chama a API no mesmo endereço da página.

## Deploy

O projeto roda na Vercel, com o banco no Turso. O `vercel.json` já define a instalação, o build (que aplica as migrations antes de gerar o frontend), a pasta publicada e as rotas: `/v1/*`, `/health` e `/openapi` vão para a função da API em `api/index.ts`, e os outros caminhos recebem o frontend. O motivo de cada escolha está na [decisão 22](docs/decisions.md#22-deploy-na-vercel-com-banco-no-turso).

Para publicar uma cópia do projeto:

1. Crie o banco e um token de acesso com a [CLI do Turso](https://docs.turso.tech/cli/introduction):

   ```sh
   turso db create todoodle
   turso db show --url todoodle     # valor de DATABASE_URL
   turso db tokens create todoodle  # valor de DATABASE_AUTH_TOKEN
   ```

2. Na Vercel, importe o repositório e escolha o preset **Other**. A Vercel sugere o preset "Services", que não funciona com este `vercel.json`.
3. Antes do primeiro deploy, defina `DATABASE_URL`, `DATABASE_AUTH_TOKEN` e `NODE_ENV=production` só para o ambiente **Production**.
4. Cada push na `main` gera um novo deploy de produção.

## Frontend

A interface é em português do Brasil e tem três páginas:

| Rota        | Página                                                               | Acesso          |
| ----------- | -------------------------------------------------------------------- | --------------- |
| `/login`    | Login                                                                | Só sem sessão   |
| `/register` | Cadastro, que já entra na conta                                      | Só sem sessão   |
| `/`         | Lista de tarefas, com filtro por status e criação, edição e exclusão | Exige sessão 🔒 |

- **Rotas protegidas:** quem abre uma página protegida sem sessão vai para `/login?redirect=...` e volta para ela depois de entrar. Quem já tem sessão e abre o login ou o cadastro vai para `/`. Se a sessão expirar com o app aberto, o próximo `401` leva de volta ao login.
- **Filtro na URL:** o status escolhido fica na URL (`/?status=pending`), então sobrevive a um recarregamento e funciona com o botão voltar. Um status inválido mostra todas as tarefas.
- **Tarefas:** a caixa de seleção alterna entre `pending` e `finished`, e o diálogo de edição permite escolher qualquer status. Uma tarefa não finalizada com a data de entrega no passado aparece como atrasada.
- **Validação:** os formulários usam os mesmos schemas Zod da API, com mensagens em português.
- **Tema:** segue o tema claro ou escuro do sistema. A tecla <kbd>D</kbd> alterna entre os dois, e a escolha fica salva no navegador.

## Endpoints

As rotas da API ficam sob o prefixo de versão `/v1`. As rotas `/health` e `/openapi` ficam na raiz, porque descrevem o serviço, e não o contrato da API.

### Autenticação

O cadastro e o login iniciam uma sessão de 30 dias, guardada no cookie `todoodle_session` (`HttpOnly` e `SameSite=Lax`, além de `Secure` em produção). O navegador envia o cookie sozinho, e o JavaScript da página não tem acesso ao token. As rotas marcadas com 🔒 exigem uma sessão válida. Cada usuário só vê e altera as próprias tarefas.

| Método | Rota                  | Descrição                              | Sucesso |
| ------ | --------------------- | -------------------------------------- | ------- |
| `POST` | `/v1/auth/register`   | Cadastra um usuário e inicia sessão    | `201`   |
| `POST` | `/v1/auth/login`      | Inicia uma sessão                      | `200`   |
| `POST` | `/v1/auth/logout`     | 🔒 Encerra a sessão atual              | `204`   |
| `POST` | `/v1/auth/logout-all` | 🔒 Encerra todas as sessões do usuário | `204`   |
| `GET`  | `/v1/auth/me`         | 🔒 Retorna o usuário da sessão         | `200`   |

A senha precisa ter de 8 a 128 caracteres, e o e-mail é salvo em minúsculas. Depois de 5 tentativas de login erradas para o mesmo e-mail e IP, o login fica bloqueado por até 15 minutos (`429`, com o header `Retry-After`).

### Tarefas

Todas as rotas de tarefas exigem autenticação 🔒.

| Método   | Rota            | Descrição                                        | Sucesso |
| -------- | --------------- | ------------------------------------------------ | ------- |
| `GET`    | `/health`       | Verifica se a API está no ar                     | `200`   |
| `POST`   | `/v1/tasks`     | Cria uma tarefa                                  | `201`   |
| `GET`    | `/v1/tasks`     | Lista as tarefas, com filtro opcional `?status=` | `200`   |
| `GET`    | `/v1/tasks/:id` | Busca uma tarefa                                 | `200`   |
| `PATCH`  | `/v1/tasks/:id` | Atualiza os campos enviados (pelo menos um)      | `200`   |
| `DELETE` | `/v1/tasks/:id` | Exclui uma tarefa                                | `204`   |

Uma tarefa tem `id` (UUID v7), `title`, `description`, `status` (`pending`, `in_progress` ou `finished`), `dueDate` (`YYYY-MM-DD`), `createdAt` e `updatedAt`. Para finalizar uma tarefa, envie `PATCH /v1/tasks/:id` com `{ "status": "finished" }`.

Exemplo:

```sh
# O -c guarda o cookie da sessão em um arquivo, e o -b o envia de volta
curl -X POST http://localhost:3000/v1/auth/register \
  -c cookies.txt \
  -H "content-type: application/json" \
  -d '{ "email": "ana@example.com", "password": "uma-senha-longa" }'

curl -X POST http://localhost:3000/v1/tasks \
  -b cookies.txt \
  -H "content-type: application/json" \
  -d '{ "title": "Escrever o README", "dueDate": "2026-11-05" }'
```

### Erros

Todos os erros seguem o mesmo formato:

```json
{
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Invalid request",
		"details": [
			{
				"path": "title",
				"message": "Too small: expected string to have >=1 characters"
			}
		]
	}
}
```

| Código              | HTTP | Quando                                                  |
| ------------------- | ---- | ------------------------------------------------------- |
| `VALIDATION_ERROR`  | 422  | Corpo, query ou parâmetros inválidos                    |
| `BAD_REQUEST`       | 400  | JSON malformado                                         |
| `UNAUTHORIZED`      | 401  | Sessão ausente, inválida ou expirada, ou login inválido |
| `NOT_FOUND`         | 404  | Tarefa ou rota inexistente                              |
| `CONFLICT`          | 409  | E-mail já cadastrado                                    |
| `TOO_MANY_REQUESTS` | 429  | Muitas tentativas de login erradas                      |
| `INTERNAL_ERROR`    | 500  | Erro inesperado (detalhes só no log do servidor)        |

## Estrutura

```
todoodle/
├── apps/
│   ├── api/                      # API HTTP (@todoodle/api)
│   │   ├── drizzle/              # migrations geradas pelo drizzle-kit
│   │   └── src/
│   │       ├── features/
│   │       │   ├── auth/         # usuários, sessões e o guard `auth`
│   │       │   └── tasks/        # uma pasta por feature
│   │       ├── shared/           # config, banco, erros, OpenAPI
│   │       ├── app.ts            # monta o app e registra as features
│   │       └── index.ts          # inicia o servidor
│   └── web/                      # frontend React (@todoodle/web)
│       └── src/
│           ├── components/
│           │   └── ui/           # componentes do shadcn/ui
│           ├── features/
│           │   ├── auth/         # formulários e queries da sessão
│           │   └── tasks/        # lista, diálogos e queries das tarefas
│           ├── lib/              # cliente Eden e tratamento de erros
│           ├── routes/           # páginas (rotas baseadas em arquivos)
│           ├── routeTree.gen.ts  # árvore de rotas gerada pelo plugin
│           └── main.tsx          # monta o app, o router e o QueryClient
├── api/
│   └── index.ts                  # função da Vercel, que reexporta o app da API
├── packages/
│   └── shared/                   # schemas Zod e tipos (@todoodle/shared)
├── docs/
│   ├── decisions.md
│   └── scope.md
├── biome.json
├── package.json                  # workspaces e scripts
├── tsconfig.base.json
└── vercel.json                   # build, rotas e runtime do deploy
```

### Arquitetura baseada em features

O código da API é agrupado por feature, e não por camada técnica. Cada feature tem os próprios arquivos:

| Arquivo               | Responsabilidade                                 |
| --------------------- | ------------------------------------------------ |
| `tasks.routes.ts`     | Rotas HTTP, validação e respostas                |
| `tasks.service.ts`    | Regras de negócio e conversão para o tipo da API |
| `tasks.repository.ts` | Acesso ao banco com Drizzle                      |
| `tasks.table.ts`      | Definição da tabela no Drizzle                   |
| `index.ts`            | Interface pública da feature                     |

Uma feature só expõe o que está no seu `index.ts`, e uma feature não importa arquivos internos de outra. A única exceção são os arquivos `*.table.ts`, que importam as tabelas de outras features diretamente para declarar chaves estrangeiras.

Os schemas Zod ficam em `packages/shared`, para que a API e o frontend usem a mesma validação e os mesmos tipos.

O frontend segue a mesma ideia. As páginas ficam em `routes/`, e cada feature em `features/` reúne os próprios componentes e as queries do TanStack Query, expostos pelo seu `index.ts`. As rotas com prefixo `_` são layouts sem segmento na URL: `_authenticated/` agrupa as páginas que exigem sessão, e `_guest/` as que só fazem sentido sem ela.

Os arquivos em `components/ui/` são gerados pelo `bunx shadcn add` e ficam fora do lint do Biome. Dois deles foram alterados à mão, e rodar o `shadcn add` de novo desfaz essas mudanças:

- `dialog.tsx`: o texto "Close", lido por leitores de tela, virou "Fechar".
- `sonner.tsx`: lê o tema do `components/theme-provider.tsx` do projeto, em vez do pacote `next-themes`.

## Scripts

Rode a partir da raiz do projeto:

| Script                | Descrição                                          |
| --------------------- | -------------------------------------------------- |
| `bun run dev`         | Inicia a API e o frontend em modo watch            |
| `bun run build`       | Gera o build de produção do frontend               |
| `bun run db:generate` | Gera uma migration a partir das tabelas do Drizzle |
| `bun run db:migrate`  | Aplica as migrations pendentes                     |
| `bun run lint`        | Verifica lint e formatação com o Biome             |
| `bun run lint:fix`    | Corrige o que o Biome consegue corrigir            |
| `bun run typecheck`   | Verifica os tipos de todos os pacotes              |
