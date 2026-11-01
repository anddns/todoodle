# Todoodle — Escopo

Todoodle é uma aplicação de gerenciamento de tarefas, com uma API REST e um frontend web, construída como um monorepo Bun com arquitetura baseada em features. Este documento define o que a v1 faz e, tão importante quanto, o que ela não faz.

## MVP (v1)

Uma API REST que permite a um cliente:

- Criar uma tarefa
- Listar tarefas, com filtro opcional por status
- Buscar uma tarefa pelo id
- Atualizar uma tarefa (título, descrição, status, data de entrega)
- Marcar uma tarefa como finalizada
- Excluir uma tarefa

Não há usuários na v1: todas as tarefas pertencem a um único dono implícito. Isso mudou no marco de autenticação, descrito abaixo.

## Autenticação e tarefas por usuário

- Cadastro com e-mail e senha
- Login, logout (da sessão atual ou de todas) e consulta do usuário da sessão
- Bloqueio temporário do login após várias tentativas erradas
- Rotas de tarefas protegidas: cada usuário só vê e altera as próprias tarefas

## Frontend

Um app web em `apps/web`, com a interface em português, que permite:

- Cadastrar-se, entrar e sair
- Listar as tarefas, com filtro por status guardado na URL
- Criar, editar e excluir tarefas, com confirmação antes de excluir
- Finalizar uma tarefa, ou voltá-la para pendente, com uma caixa de seleção
- Ver quais tarefas estão atrasadas

Fica de fora por enquanto: busca, ordenação escolhida pelo usuário, paginação e o encerramento de todas as sessões pela interface (`logout-all` existe só na API).

## Deploy

O projeto está publicado em https://todoodle-rust.vercel.app: o frontend é servido pela CDN da Vercel, a API roda como uma função da Vercel e o banco fica no Turso. Cada push na `main` gera um deploy de produção, e não há deploys de preview.

## Entidades

### Task

| Campo         | Tipo                                           | Observações                          |
| ------------- | ---------------------------------------------- | ------------------------------------ |
| `id`          | string (UUID v7)                               | Gerado pela API                      |
| `title`       | string                                         | Obrigatório, 1–200 caracteres        |
| `description` | string \| null                                 | Opcional                             |
| `status`      | `"pending"` \| `"in_progress"` \| `"finished"` | Padrão: `"pending"`                  |
| `dueDate`     | data ISO 8601 \| null                          | Opcional                             |
| `createdAt`   | data e hora ISO 8601                           | Definido pela API                    |
| `updatedAt`   | data e hora ISO 8601                           | Atualizado pela API a cada alteração |

### User

Adicionada no marco de autenticação.

| Campo       | Tipo                 | Observações                |
| ----------- | -------------------- | -------------------------- |
| `id`        | string (UUID v7)     | Gerado pela API            |
| `email`     | string               | Único, salvo em minúsculas |
| `createdAt` | data e hora ISO 8601 | Definido pela API          |

A senha é guardada só como hash e nunca aparece nas respostas.

Candidatas para depois: `Project` (agrupar tarefas) e `Tag`.

## Fora do escopo da v1

- Usuários, autenticação e autorização
- Frontend
- Atualizações em tempo real
- Deploy e CI

## Próximos marcos

1. Autenticação e tarefas por usuário (concluído)
2. CI com GitHub Actions (concluído)
3. Frontend em `apps/web` (concluído)
4. Deploy na Vercel com banco no Turso (concluído)
