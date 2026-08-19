# FEAT-002 — Visitas das Escolas (Caravanas)

## REASONS Canvas — SPDD

---

### R — Requirements

**Problema:** Atualmente, o agendamento de visitas de escolas (caravanas de até ~30 alunos) é feito por e-mail e a verificação de disponibilidade dos laboratórios é manual (via WhatsApp). Isso gera overhead para o DEPPI, falta de visibilidade pública e atrasos nas respostas.

**Definition of Done:**
- [ ] Formulário público/privado para registro de solicitações de visitas.
- [ ] Calendário público exibindo as visitas agendadas e confirmadas (transparência).
- [ ] Painel do coordenador onde os responsáveis pelos laboratórios podem marcar "Disponível", "Indisponível" ou "Pendente" para cada visita com apenas 1 clique.
- [ ] Disparo automático de e-mail (via Nodemailer) notificando a escola sobre agendamento, confirmação ou cancelamento.
- [ ] Painel Administrativo do DEPPI para gerenciar a fila, consolidar respostas dos laboratórios e aprovar/cancelar a visita.

**Brainstorming de Ideias Adicionais:**
- *Auto-cancelamento:* Enviar um link com token único no e-mail de agendamento para que a escola possa cancelar a visita por conta própria, liberando a vaga.
- *Lembrete Automático:* Enviar e-mail de lembrete 48h antes da visita para evitar *no-shows*.
- *Integração de Calendário (.ics):* Anexar um arquivo `.ics` no e-mail de confirmação para os coordenadores e escola adicionarem à sua agenda pessoal.
- *Feedback Pós-Visita:* E-mail automático após a data da visita pedindo avaliação ao professor/escola responsável.
- *Bloqueio de Choque de Horários:* O sistema pode alertar se já houver uma visita de 30 alunos naquele mesmo turno/data, evitando superlotação nos laboratórios.

### E — Entities

| Entidade / Tabela | Descrição |
|---|---|
| `school_visits` | Armazena a solicitação: id, `school_name`, `responsible_name`, `contact_email`, `contact_phone`, `students_count`, `target_date`, `status` (pending, confirmed, canceled), `created_at`, `updated_at`. |
| `laboratories` | Laboratórios disponíveis (LAQAMB, LAPP, MAKER, OFICINA, LQOI, LABVICIA, LASIC): id, `name`, `description`. |
| `visit_lab_availability` | Relação NxN para status dos labs: `visit_id`, `lab_id`, `status` (pending, available, unavailable), `updated_by_user_id`. |
| `users` | Entidade existente (coordenadores e administradores) que farão a aprovação. |

### A — Approach

1. **Backend (Node.js/Knex):**
   - Criar *migrations* Knex para `school_visits`, `laboratories` e `visit_lab_availability`.
   - Adicionar *seeds* para os laboratórios iniciais.
   - Criar as rotas CRUD em `backend/src/routes`.
   - Expandir o `email.service.ts` existente (Nodemailer) incluindo métodos `sendVisitConfirmationEmail`, `sendVisitPendingEmail` (e eventuais lembretes).
2. **Frontend (Angular):**
   - Criar rota pública `/visitas` contendo calendário (utilizando componentes/cards existentes) ou lista e formulário de solicitação.
   - Criar rota restrita `/admin/visitas` com 2 visões:
     - **Visão do Coordenador de Lab:** Listagem de visitas pendentes com *toggles/botões* rápidos para confirmar ou negar disponibilidade.
     - **Visão do Admin (DEPPI):** Dashboard geral para aprovar a visita como um todo e enviar a resposta final.

### S — Structure

```text
deppi_novo/
├── backend/
│   ├── src/
│   │   ├── database/migrations/ ← Novas migrations
│   │   ├── database/seeds/      ← Seed de laboratórios
│   │   ├── controllers/         ← visit.controller.ts, lab.controller.ts
│   │   ├── routes/              ← visit.routes.ts, lab.routes.ts
│   │   └── services/            ← email.service.ts (novos templates)
└── src/app/
    ├── features/visitas/        ← Módulo de Visitas (Frontend)
    │   ├── public/              ← Componente de Calendário / Lista
    │   └── admin/               ← Componentes de gestão de disponibilidade
    └── shared/models/           ← visit.model.ts, lab.model.ts
```

### O — Operations

1. **OP-1:** Escrever e executar migrations Knex para as 3 novas tabelas e seed de laboratórios.
2. **OP-2:** Criar Controllers, Models e Routes no backend para as visitas e disponibilidade de labs.
3. **OP-3:** Implementar as funções de disparo de e-mail no `email.service.ts` com HTML templates apropriados.
4. **OP-4:** Implementar no Frontend (Angular) a tela pública do Calendário de Visitas.
5. **OP-5:** Implementar o Painel de Coordenadores para interagir com o status dos laboratórios (1-click).
6. **OP-6:** Implementar o Painel Admin do DEPPI para gerenciamento final e aprovação.
7. **OP-7:** Validar responsividade, envio de e-mails e regras de negócio.

### N — Norms

- Reutilizar a instância do Nodemailer já configurada em `email.service.ts`.
- Manter o padrão de arquitetura do backend (Controller -> Service -> Knex Repository).
- Aproveitar componentes visuais já presentes no Angular (cards, modais, tabelas, badges de status).
- Não criar sistemas de notificação em tempo real (Socket.io) inicialmente. Focar em E-mail.

### S — Safeguards

- **Invariante:** Não deve ser possível aprovar uma visita no status final do DEPPI sem pelo menos um laboratório com status "Disponível".
- **Constraint:** O limite de alunos por visita não deve ultrapassar ~30 por padrão (adicionar validação no formulário/backend).
- **Risco:** Múltiplas visitas na mesma data/horário gerando superlotação. Adicionar validação no backend para bloquear ou emitir alerta (warning) sobre choques de data/horário na visão do Admin.