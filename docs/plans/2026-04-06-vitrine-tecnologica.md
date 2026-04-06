# Vitrine Tecnológica Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implementar o Back-end e Front-end da Vitrine Tecnológica para listar e editar detalhes dos laboratórios do Campus Maracanaú, aproveitando autenticação.

**Architecture:** Backend com Knex (migrações), Express (Controlador REST com CRUD) e Frontend Angular (LaboratoriosModule) comunicando com RxJS. As rotas POST/PUT/DELETE são protegidas por middlewares.

**Tech Stack:** Node.js, Express, Knex, PostgreSQL, Angular, SCSS.

---

### Task 1: Criar Migração e Seed do Banco

**Files:**
- Create: `backend/src/database/migrations/006_create_laboratorios_table.ts`
- Create: `backend/src/database/seeds/002_seed_laboratorios.ts`

**Step 1: Criar arquivo de migração Knex**
Crie o arquivo `backend/src/database/migrations/006_create_laboratorios_table.ts` com a estrutura para `id`, `name`, `description`, `cover_image`, `productions`, `services`, `created_at`, `updated_at`.

```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('laboratorios', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('name').notNullable();
    table.text('description').notNullable();
    table.string('cover_image');
    table.jsonb('productions').defaultTo('[]');
    table.jsonb('services').defaultTo('[]');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('laboratorios');
}
```

**Step 2: Rodar Migração**
Run: `npm run migrate` dentro de `backend`.

**Step 3: Commit**
```bash
git add backend/src/database/migrations/006_create_laboratorios_table.ts
git commit -m "feat(backend): add laboratorios migration"
```

---

### Task 2: Backend Controller 

**Files:**
- Create: `backend/src/controllers/laboratorios.controller.ts`

**Step 1: Criar o LaboratoriosController**
Implemente um CRUD simples e robusto lendo do banco usando Knex e tratando json/arrays.
```typescript
import { Request, Response, NextFunction } from 'express';
import db from '../database';

export class LaboratorioController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const labs = await db('laboratorios').select('*');
      res.json(labs);
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const lab = await db('laboratorios').where({ id }).first();
      if (!lab) return res.status(404).json({ message: 'Lab não encontrado' });
      res.json(lab);
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const [newLab] = await db('laboratorios').insert(req.body).returning('*');
      res.status(201).json(newLab);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const [updated] = await db('laboratorios').where({ id }).update({ ...req.body, updated_at: db.fn.now() }).returning('*');
      if (!updated) return res.status(404).json({ message: 'Não encontrado' });
      res.json(updated);
    } catch (error) { next(error); }
  }
}

export const laboratorioController = new LaboratorioController();
```

**Step 2: Commit**
```bash
git add backend/src/controllers/laboratorios.controller.ts
git commit -m "feat(backend): add laboratorios controller"
```

---

### Task 3: Backend Routes & Index

**Files:**
- Create: `backend/src/routes/laboratorios.routes.ts`
- Modify: `backend/src/index.ts`

**Step 1: Criar Rotas com Auth Middleware**
```typescript
import { Router } from 'express';
import { laboratorioController } from '../controllers/laboratorios.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', laboratorioController.getAll);
router.get('/:id', laboratorioController.getById);
router.post('/', authMiddleware, laboratorioController.create);
router.put('/:id', authMiddleware, laboratorioController.update);

export default router;
```

**Step 2: Registrar a rota em index.ts**
No `backend/src/index.ts`, adicione `import laboratorioRoutes from './routes/laboratorios.routes';` e cadastre na seção `this.app.use('/api/laboratorios', laboratorioRoutes)`.

**Step 3: Commit**
```bash
git add backend/src/routes/laboratorios.routes.ts backend/src/index.ts
git commit -m "feat(backend): add laboratorios routes to index"
```

---

### Task 4: Frontend - Service & Module

**Files:**
- Create: `src/app/features/laboratorios/models/laboratorio.model.ts`
- Create: `src/app/features/laboratorios/services/laboratorios.service.ts`
- Create: `src/app/features/laboratorios/laboratorios-routing.module.ts`
- Create: `src/app/features/laboratorios/laboratorios.module.ts`
- Modify: `src/app/app.module.ts` (routing)

**Step 1: Models e Service**
Crie interface `Laboratorio` e injete dependências no serviço pra fazer as requisições (GET /api/laboratorios, PUT /api/laboratorios/{id}).

**Step 2: Modulo, Componentes Base e Roteamento**
Embarcar `RouterModule.forChild`, e registrar a rota preguiçosa `laboratorios` no `app.module.ts`.

**Step 3: Commit**
```bash
git add src/app/features/laboratorios/ src/app/app.module.ts
git commit -m "feat(front): setup laboratorios module, service and routing"
```

---

### Task 5: Frontend - UI (Interface)

**Files:**
- Create: `src/app/features/laboratorios/components/lab-list/lab-list.component.ts|html|scss`
- Create: `src/app/features/laboratorios/components/lab-detail/lab-detail.component.ts|html|scss`
- Create: `src/app/features/laboratorios/components/lab-form/lab-form.component.ts|html|scss`

**Step 1: List Component (Home da Vitrine)**
O template deve consumir o `laboratoriosService.getAll()`. Deve usar um `*ngFor` num laço construindo divs com classe `.glass-card`. Importante testar validação de Login usando `authService.isAuthenticated$` para mostrar os botões de edição.

**Step 2: Detail e Editar**
O Componente Detail mostrará tudo. O Form utilizará `ReactiveFormsModule` e `FormBuilder`.

**Step 3: Commit**
```bash
git add src/app/features/laboratorios/components/
git commit -m "feat(front): add vitrine tecnologica ui components"
```
