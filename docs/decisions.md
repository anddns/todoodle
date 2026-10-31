# Registro de decisões

Este documento registra as principais decisões técnicas do Todoodle, com o motivo de cada uma e as alternativas consideradas. Todas foram tomadas em 31/10/2026, durante a configuração da v1.

| #   | Decisão                                                                                                  | Área        |
| --- | -------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | [Bun como runtime e gerenciador de pacotes](#1-bun-como-runtime-e-gerenciador-de-pacotes)                | Plataforma  |
| 2   | [Monorepo com Bun workspaces](#2-monorepo-com-bun-workspaces)                                            | Plataforma  |
| 3   | [Elysia como framework HTTP](#3-elysia-como-framework-http)                                              | API         |
| 4   | [Arquitetura baseada em features](#4-arquitetura-baseada-em-features)                                    | API         |
| 5   | [SQLite com Drizzle ORM](#5-sqlite-com-drizzle-orm)                                                      | Banco       |
| 6   | [Migrations aplicadas por script próprio](#6-migrations-aplicadas-por-script-próprio)                    | Banco       |
| 7   | [Zod em um pacote compartilhado](#7-zod-em-um-pacote-compartilhado)                                      | Validação   |
| 8   | [Ids em UUID v7](#8-ids-em-uuid-v7)                                                                      | Modelo      |
| 9   | [Status e finalização de tarefas](#9-status-e-finalização-de-tarefas)                                    | Modelo      |
| 10  | [Formato padronizado de erros](#10-formato-padronizado-de-erros)                                         | API         |
| 11  | [Respostas declaradas e documentação OpenAPI](#11-respostas-declaradas-e-documentação-openapi)           | API         |
| 12  | [Biome e `bun check` como ferramentas de qualidade](#12-biome-e-bun-check-como-ferramentas-de-qualidade) | Ferramentas |
| 13  | [Idiomas do projeto](#13-idiomas-do-projeto)                                                             | Convenções  |
| 14  | [Versionamento da API pelo prefixo `/v1`](#14-versionamento-da-api-pelo-prefixo-v1)                      | API         |

## 1. Bun como runtime e gerenciador de pacotes

**Decisão:** usar o Bun para executar a API, instalar pacotes e verificar tipos.

**Motivo:** o Bun reúne runtime, gerenciador de pacotes, workspaces, SQLite nativo (`bun:sqlite`) e verificação de tipos (`bun check`). Isso reduz o número de ferramentas no projeto.

**Alternativas:** Node.js com pnpm, que exigiria ferramentas separadas para executar TypeScript e acessar o SQLite.

## 2. Monorepo com Bun workspaces

**Decisão:** organizar o projeto como um monorepo com `apps/*` e `packages/*`, usando os workspaces do Bun, sem Turborepo ou Nx.

**Motivo:** o projeto tem só dois pacotes (`@todoodle/api` e `@todoodle/shared`). Os workspaces do Bun bastam para ligar os pacotes e rodar scripts em todos eles com `bun --filter`. Um futuro `apps/web` entra sem mudar a estrutura.

**Alternativas:** Turborepo ou Nx, que trazem cache e orquestração de tarefas, mas não se pagam com poucos pacotes.

## 3. Elysia como framework HTTP

**Decisão:** usar o Elysia na API.

**Motivo:** o Elysia foi feito para o Bun e aproveita os recursos do runtime sem camadas de adaptação. Com ele, um único schema na definição da rota cuida de três coisas ao mesmo tempo: valida a requisição, define os tipos do handler e gera a documentação OpenAPI. Ele aceita schemas Zod diretamente (via Standard Schema), então os mesmos schemas podem ser usados fora das rotas, e tem um plugin oficial de OpenAPI. O app também exporta o próprio tipo, o que permite usar o Eden como cliente tipado no futuro frontend, sem gerar código.

**Alternativas:**

- **Hono**, que foi a primeira sugestão do planejamento. É maduro, roda em vários runtimes (Bun, Node, Deno, Workers) e também tem um cliente tipado (`hc`). Ficou de fora porque a portabilidade entre runtimes não tem valor aqui, já que o projeto usa o Bun de propósito. Além disso, para ter validação, tipos e OpenAPI saindo do mesmo schema, seria preciso adotar o `@hono/zod-openapi`, que muda a forma de declarar as rotas (`createRoute` + `OpenAPIHono`) e acrescenta uma camada que o Elysia já entrega por padrão.
- **Fastify** e **Express**: são focados no Node. O Express não infere tipos a partir dos schemas, e o Fastify exige _type providers_ para chegar perto disso.

## 4. Arquitetura baseada em features

**Decisão:** agrupar o código da API por feature (`src/features/tasks/`), e não por camada técnica (`controllers/`, `services/`, `models/`). Dentro de cada feature, os arquivos se dividem em rotas, serviço, repositório e tabela.

**Motivo:** tudo o que pertence a uma feature fica no mesmo lugar. Cada feature só expõe o que está no seu `index.ts`, e uma feature não importa arquivos internos de outra. Isso deixa claro o que é público e facilita adicionar features novas.

**Convenção:** as tabelas do Drizzle ficam em arquivos `*.table.ts`, e não `*.schema.ts`. No projeto, "schema" se refere aos schemas Zod do pacote compartilhado.

## 5. SQLite com Drizzle ORM

**Decisão:** usar SQLite como banco e o Drizzle ORM para definir a tabela, gerar migrations e fazer consultas, com o driver `bun:sqlite`.

**Motivo:** o SQLite não exige servidor nem configuração, o que facilita rodar o projeto. O Drizzle tem consultas com tipos e migrations em SQL legível. Trocar para PostgreSQL no futuro exige mudar o driver e as definições de tabela, mas não as camadas acima do repositório.

**Detalhes:**

- `dueDate` é guardado como texto `YYYY-MM-DD`, porque é uma data de calendário, sem horário.
- `createdAt` e `updatedAt` são guardados em milissegundos e chegam à API como datas ISO 8601.
- A exclusão é definitiva (sem _soft delete_), já que a v1 não tem lixeira nem histórico.

**Alternativas:** PostgreSQL, que exigiria um servidor de banco desde o início.

## 6. Migrations aplicadas por script próprio

**Decisão:** o `drizzle-kit` apenas gera as migrations (`db:generate`). Um script próprio (`src/shared/db/migrate.ts`) as aplica (`db:migrate`) com o migrator do Drizzle.

**Motivo:** o `drizzle-kit migrate` precisa de um driver extra (`better-sqlite3` ou `@libsql/client`) e não usa o `bun:sqlite`, mesmo quando executado pelo Bun. O script próprio não adiciona dependências e abre o banco da mesma forma que a API.

**Convenção:** as migrations recebem nomes legíveis com `--name` (por exemplo, `0000_create_tasks.sql`), em vez dos nomes aleatórios gerados por padrão.

**Alternativas:** instalar o `@libsql/client` como dependência de desenvolvimento e usar o `drizzle-kit migrate`.

## 7. Zod em um pacote compartilhado

**Decisão:** escrever os schemas de validação com Zod no pacote `@todoodle/shared` e usá-los diretamente nas rotas do Elysia.

**Motivo:** a API e o futuro frontend vão usar a mesma validação e os mesmos tipos para parte dos dados. Os tipos (`Task`, `CreateTaskInput` etc.) são inferidos dos schemas, então não existe uma segunda definição para manter em sincronia.

**Alternativas:** o TypeBox (`t`), validador nativo do Elysia, que não seria reaproveitado com a mesma facilidade no frontend.

## 8. Ids em UUID v7

**Decisão:** gerar os ids das tarefas como UUID v7, com o `Bun.randomUUIDv7()`.

**Motivo:** o UUID v7 começa com um timestamp, então os ids crescem com o tempo. Ele serve como critério de desempate na ordenação da lista quando duas tarefas são criadas no mesmo milissegundo. Por ser um UUID, também não expõe quantas tarefas existem, como faria um id numérico sequencial.

**Alternativas:** UUID v4, que é aleatório e não ordenável, ou um inteiro autoincremental.

## 9. Status e finalização de tarefas

**Decisão:** os status são `pending`, `in_progress` e `finished`, com `pending` como padrão. Finalizar uma tarefa é feito com `PATCH /tasks/:id` e `{ "status": "finished" }`, sem um endpoint separado.

**Motivo:** a finalização é uma atualização comum do campo `status`, e um endpoint dedicado duplicaria o que o `PATCH` já faz.

**Regra relacionada:** o `PATCH` exige pelo menos um campo válido. Um corpo vazio, ou só com campos desconhecidos, é rejeitado com `422`. Isso evita requisições que não mudam nada por engano.

## 10. Formato padronizado de erros

**Decisão:** todas as respostas de erro seguem o formato `{ "error": { "code", "message", "details?" } }`, produzido por um handler global.

| Código             | HTTP | Quando                               |
| ------------------ | ---- | ------------------------------------ |
| `VALIDATION_ERROR` | 422  | Corpo, query ou parâmetros inválidos |
| `BAD_REQUEST`      | 400  | JSON malformado                      |
| `NOT_FOUND`        | 404  | Tarefa ou rota inexistente           |
| `INTERNAL_ERROR`   | 500  | Erro inesperado                      |

**Motivo:** o campo `code` dá ao cliente um valor estável para tratar cada caso, sem depender do texto da mensagem. Erros inesperados não expõem detalhes internos: eles aparecem só no log do servidor.

**Detalhe:** uma resposta que não corresponde ao schema declarado é um erro do servidor, e não do cliente. Por isso ela gera `500`, e não `422`.

## 11. Respostas declaradas e documentação OpenAPI

**Decisão:** declarar as respostas de cada rota com schemas Zod e gerar a documentação OpenAPI com o `@elysiajs/openapi`, servida em `/openapi`.

**Motivo:** a documentação sai dos mesmos schemas que validam as requisições, então não fica desatualizada. Como o Elysia também valida as respostas declaradas, a API não consegue enviar dados fora do contrato documentado.

## 12. Biome e `bun check` como ferramentas de qualidade

**Decisão:** usar o Biome para lint e formatação, e o `bun check` para verificar os tipos.

**Motivo:** o Biome substitui ESLint e Prettier com uma só ferramenta e um só arquivo de configuração. O `bun check` verifica os tipos como o `tsc`, sem precisar do pacote `typescript` no projeto.

**Convenção:** os scripts do Biome se chamam `lint` e `lint:fix`, porque um script chamado `check` esconderia o comando nativo `bun check`.

## 13. Idiomas do projeto

**Decisão:** a documentação em Markdown (como este arquivo, o README e o escopo) e as mensagens de commit são escritas em português do Brasil. Todo o resto, inclusive o código, os comentários, as mensagens de log e de erro e os textos da documentação OpenAPI, é escrito em inglês americano.

**Motivo:** o código segue a convenção da maioria dos projetos e bibliotecas. Assim, os nomes do projeto não se misturam com os das APIs que ele usa (evitando coisas como `getUsuarios`), e as mensagens de erro e de log podem ser pesquisadas diretamente. Os textos do OpenAPI ficam em inglês porque são escritos no código, ao lado dos schemas. Já a documentação e os commits registram decisões e a história do projeto, e por isso ficam no idioma em que o autor pensa e escreve com mais precisão.

**Alternativas:**

- **Tudo em inglês:** deixaria o projeto mais acessível a quem não fala português, mas tornaria mais lento escrever documentação que hoje tem um único autor e leitor principal.
- **Tudo em português, inclusive o código:** os nomes ficariam misturados com os das bibliotecas e frameworks, e o código fugiria da convenção que qualquer desenvolvedor espera encontrar.
- **Documentação bilíngue:** dobraria o trabalho de manutenção e as duas versões tenderiam a ficar dessincronizadas.

## 14. Versionamento da API pelo prefixo `/v1`

**Decisão:** as rotas de tarefas ficam sob o prefixo `/v1` (por exemplo, `/v1/tasks`). As rotas `/health` e `/openapi` ficam na raiz, porque descrevem o serviço, e não o contrato da API.

**Motivo:** o prefixo na URL é a forma de versionamento mais simples e conhecida, e deixa explícito qual contrato o cliente usa. Ele foi adicionado antes do frontend e da autenticação, quando nenhum cliente dependia dos caminhos antigos e a mudança custava pouco. Um `/v2` só será criado se houver uma mudança incompatível no contrato.

**Alternativas:**

- **Sem versionamento:** suficiente enquanto o único cliente é o próprio frontend, publicado junto com a API no mesmo monorepo, mas tornaria uma futura mudança incompatível mais difícil.
- **Versão em header ou query string** (como `Accept: application/vnd.todoodle.v1+json`): é mais flexível, mas também menos visível e mais difícil de testar e documentar, sem benefício para um projeto deste tamanho.
