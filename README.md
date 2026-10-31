# Todoodle

[![CI](https://github.com/anddns/todoodle/actions/workflows/ci.yml/badge.svg)](https://github.com/anddns/todoodle/actions/workflows/ci.yml)

API REST de gerenciamento de tarefas, organizada como um monorepo com arquitetura baseada em features. É um projeto de portfólio: o escopo da v1 e o que fica de fora estão em [docs/scope.md](docs/scope.md), e o motivo de cada escolha técnica está em [docs/decisions.md](docs/decisions.md).

## Stack

| Área                 | Ferramenta                                                        |
| -------------------- | ----------------------------------------------------------------- |
| Runtime e pacotes    | [Bun](https://bun.com) (workspaces, `bun check`, `bun:sqlite`)    |
| Framework HTTP       | [Elysia](https://elysiajs.com)                                    |
| Banco de dados e ORM | SQLite com [Drizzle ORM](https://orm.drizzle.team)                |
| Validação            | [Zod](https://zod.dev), compartilhado entre os pacotes            |
| Documentação da API  | OpenAPI com [Scalar](https://scalar.com), via `@elysiajs/openapi` |
| Lint e formatação    | [Biome](https://biomejs.dev)                                      |
| Linguagem            | TypeScript em modo estrito                                        |

## Como rodar

Pré-requisito: Bun 1.4 ou superior.

```sh
bun install
bun run db:migrate
bun run dev
```

A API sobe em `http://localhost:3000` e a documentação interativa fica em `http://localhost:3000/openapi`.

### Variáveis de ambiente

Todas as variáveis têm valores padrão, então o arquivo `.env` é opcional. Para alterá-las, copie o exemplo:

```sh
cp apps/api/.env.example apps/api/.env
```

| Variável       | Padrão        | Descrição                                                                  |
| -------------- | ------------- | -------------------------------------------------------------------------- |
| `PORT`         | `3000`        | Porta do servidor                                                          |
| `DB_FILE_NAME` | `todoodle.db` | Arquivo do banco SQLite                                                    |
| `NODE_ENV`     | —             | Com `production`, o cookie de sessão recebe o atributo `Secure` (só HTTPS) |

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
│   └── api/                      # API HTTP (@todoodle/api)
│       ├── drizzle/              # migrations geradas pelo drizzle-kit
│       └── src/
│           ├── features/
│           │   ├── auth/         # usuários, sessões e o guard `auth`
│           │   └── tasks/        # uma pasta por feature
│           ├── shared/           # config, banco, erros, OpenAPI
│           ├── app.ts            # monta o app e registra as features
│           └── index.ts          # inicia o servidor
├── packages/
│   └── shared/                   # schemas Zod e tipos (@todoodle/shared)
├── docs/
│   └── scope.md
├── biome.json
├── package.json                  # workspaces e scripts
└── tsconfig.base.json
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

Os schemas Zod ficam em `packages/shared`, para que a API e um futuro frontend usem a mesma validação e os mesmos tipos.

## Scripts

Rode a partir da raiz do projeto:

| Script                | Descrição                                          |
| --------------------- | -------------------------------------------------- |
| `bun run dev`         | Inicia a API em modo watch                         |
| `bun run db:generate` | Gera uma migration a partir das tabelas do Drizzle |
| `bun run db:migrate`  | Aplica as migrations pendentes                     |
| `bun run lint`        | Verifica lint e formatação com o Biome             |
| `bun run lint:fix`    | Corrige o que o Biome consegue corrigir            |
| `bun run typecheck`   | Verifica os tipos de todos os pacotes              |
