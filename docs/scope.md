# Todoodle — Escopo

Todoodle é uma API de gerenciamento de tarefas, construída como um monorepo Bun com arquitetura baseada em features. Este documento define o que a v1 faz e, tão importante quanto, o que ela não faz.

## MVP (v1)

Uma API REST que permite a um cliente:

- Criar uma tarefa
- Listar tarefas, com filtro opcional por status
- Buscar uma tarefa pelo id
- Atualizar uma tarefa (título, descrição, status, data de entrega)
- Marcar uma tarefa como finalizada
- Excluir uma tarefa

Não há usuários na v1: todas as tarefas pertencem a um único dono implícito.

## Entidades

### Task

| Campo         | Tipo                                             | Observações                          |
| ------------- | ------------------------------------------------ | ------------------------------------ |
| `id`          | string (UUID v7)                                 | Gerado pela API                      |
| `title`       | string                                           | Obrigatório, 1–200 caracteres        |
| `description` | string \| null                                   | Opcional                             |
| `status`      | `"pending"` \| `"in_progress"` \| `"finished"`   | Padrão: `"pending"`                  |
| `dueDate`     | data ISO 8601 \| null                            | Opcional                             |
| `createdAt`   | data e hora ISO 8601                             | Definido pela API                    |
| `updatedAt`   | data e hora ISO 8601                             | Atualizado pela API a cada alteração |

Candidatas para depois: `Project` (agrupar tarefas) e `Tag`.

## Fora do escopo da v1

- Usuários, autenticação e autorização
- Frontend
- Atualizações em tempo real
- Deploy e CI

## Próximos marcos

1. Autenticação e tarefas por usuário
2. CI com GitHub Actions
3. Frontend em `apps/web`
4. Deploy
