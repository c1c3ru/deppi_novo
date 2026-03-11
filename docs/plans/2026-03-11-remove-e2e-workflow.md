# Remover Testes E2E do Workflow Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Remover as etapas de testes E2E (Cypress) do pipeline de CI/CD para simplificar a execução e evitar falhas de infraestrutura.

**Architecture:** Modificar o arquivo de workflow YAML para deletar os passos relacionados ao Cypress e limpar arquivos de configuração órfãos.

**Tech Stack:** GitHub Actions, YAML.

---

### Task 1: Remover passos E2E do Workflow

**Files:**
- Modify: `.github/workflows/ci-cd.yml:58-62`

**Step 1: Remover execução do Cypress**
Remover o passo "Run E2E tests" do job `frontend-tests`.

**Step 2: Verificar sintaxe do YAML**
Garantir que a indentação e estrutura do arquivo permaneçam válidas.

**Step 3: Commit**
```bash
git add .github/workflows/ci-cd.yml
git commit -m "ci: remove e2e testing steps from pipeline"
```

### Task 2: Remover arquivos de configuração do Cypress (Opcional/Limpeza)

**Files:**
- Delete: `cypress.config.js`
- Delete: `cypress/`

**Step 1: Remover arquivos**
```bash
rm cypress.config.js
rm -rf cypress/
```

**Step 2: Commit**
```bash
git add .
git commit -m "chore: remove cypress configuration and tests"
```
