# DEPPI — Portal Web do IFCE Campus Maracanaú

<p align="center">
  <strong>Departamento de Extensão, Pesquisa, Pós-Graduação e Inovação</strong><br>
  Portal institucional, vitrine tecnológica, gestão de boletins, revista científica, agendamento de visitas e relatórios PIT/RIT.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white" alt="Angular 21">
  <img src="https://img.shields.io/badge/Node.js-18%2F20_LTS-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/License-GPLv3-blue" alt="License">
</p>

---

## 📖 Visão Geral

O **DEPPI** é o sistema web completo do Departamento de Extensão, Pesquisa, Pós-Graduação e Inovação do IFCE Campus Maracanaú. Ele centraliza a comunicação institucional, a gestão acadêmica e a divulgação de laboratórios, pesquisas e serviços do campus em uma plataforma moderna e unificada.

---

## 🚀 Arquitetura e Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend (SPA)** | Angular + TypeScript + SCSS | 21.x |
| **Gerenciamento de Estado** | NgRx (Store, Effects, Router Store, DevTools) | 21.x |
| **Editor de Texto Rico** | Quill v2 (via `ngx-quill`) | 2.x |
| **Internacionalização** | `@ngx-translate` (pt-BR) | 15.x |
| **Geração de PDF** | jsPDF + jspdf-autotable | 4.x / 5.x |
| **Backend (API REST)** | Node.js + Express + TypeScript | 18/20 LTS |
| **ORM / Migrations** | Knex.js | 3.x |
| **Banco de Dados** | PostgreSQL | 15+ |
| **Cache** | Redis 7 (LRU, AOF) | 7.x |
| **Proxy Reverso** | Nginx (Gzip, HSTS, CSP, uploads até 50 MB) | — |
| **Documentação da API** | Swagger/OpenAPI 3.0 (`swagger-jsdoc`) | — |
| **Monitoramento** | Prometheus + Grafana | — |
| **Rastreamento de Erros** | Sentry | 7.x |
| **Logging** | Winston + Morgan | — |
| **E-mail Transacional** | Nodemailer (SMTP/Gmail) | — |
| **Integração Google** | Google Calendar API (agendamento de visitas) | — |
| **Processos / Deploy** | Docker Compose, PM2, GitHub Actions CI/CD | — |
| **Qualidade de Código** | ESLint, Prettier, Husky, lint-staged | — |
| **Testes** | Jasmine/Karma (frontend), Jest + Supertest (backend) | — |

---

## 🌟 Módulos e Funcionalidades

### Portal Público
| Módulo | Rota | Descrição |
|--------|------|-----------|
| **Home** | `/home` | Página inicial institucional do DEPPI |
| **Pesquisa** | `/research` | Grupos de pesquisa, projetos e publicações |
| **Extensão** | `/extension` | Programas e projetos de extensão |
| **Inovação** | `/innovation` | Núcleo de inovação tecnológica e patentes |
| **Pós-Graduação** | `/post-graduation` | Cursos de especialização e lato/stricto sensu |
| **Laboratórios** | `/laboratorios` | Catálogo dos laboratórios (LAQAMB, LAPP, MAKER, OFICINA, LQOI, LABVICIA, LASIC e outros) |
| **Vitrine Tecnológica** | `/talentos` | Portfólio de talentos, pesquisas e serviços do campus |
| **Visitas Escolares** | `/visitas` | Agendamento público de visitas com integração Google Calendar, controle de vagas e histórico com retenção de 30 dias |
| **Contato** | `/contact` | Formulário de contato com envio de e-mail via SMTP |
| **Privacidade** | `/privacy` | Política de privacidade e proteção de dados |

### Área Administrativa (Autenticada)
| Módulo | Rota | Descrição |
|--------|------|-----------|
| **Boletins** | `/boletins` | CRUD completo de informativos com editor Quill v2, upload de imagens e publicação |
| **Revista Científica** | `/revista` | Gestão de edições e artigos dos *Anais da Mostra Científica* (submissão, expediente, apresentação) |
| **PIT/RIT** | `/pit-rit` | Plano Individual de Trabalho e Relatório Individual de Trabalho com cálculo automático de carga horária (20h, 30h, 40h, 40h D.E.) e exportação em PDF |
| **Gestão de Visitas** | `/visitas/admin` | Painel administrativo de visitas: aprovação, rejeição, controle de capacidade e sincronização com Google Calendar |

### API Backend — Endpoints
| Prefixo | Domínio |
|---------|---------|
| `/api/auth` | Autenticação (JWT + Refresh Tokens) e registro |
| `/api/users` | Gestão de usuários (protegido) |
| `/api/boletins` | CRUD de boletins informativos |
| `/api/revista` | CRUD de edições e artigos da revista |
| `/api/upload` | Upload de arquivos (protegido, via Multer) |
| `/api/contact` | Envio de mensagens de contato |
| `/api/laboratorios` | Cadastro e consulta de laboratórios |
| `/api/visitas` | Agendamento de visitas escolares |
| `/health` | Health check da aplicação |
| `/api-docs` | Documentação Swagger (somente dev) |

---

## 📋 Pré-requisitos

- **Node.js** ≥ 18.0.0 (recomendado: 20 LTS)
- **NPM** ≥ 9.0.0
- **PostgreSQL** ≥ 15 (local ou via Docker)
- **Docker e Docker Compose** (opcional — para infraestrutura completa)
- **Git** e ferramentas de compilação (`build-essential`)

---

## 🛠️ Instalação e Configuração

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/c1c3ru/deppi_novo.git
cd deppi_novo

# Frontend
npm install

# Backend
cd backend && npm install && cd ..
```

### 2. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
# Edite o .env com suas credenciais (DB, JWT, SMTP, Google OAuth, Sentry)
```

> **Variáveis essenciais**: `DB_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `SMTP_USER`, `SMTP_PASS`. Para integração com Google Calendar: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`.

### 3. Configurar o PostgreSQL
```bash
# Script automatizado (cria banco, usuário e permissões)
./setup-postgres.sh
```

### 4. Build do Backend + Migrations + Seeds

> ⚠️ **PASSO CRÍTICO**: O Knex CLI exige os arquivos compilados em `dist/` para executar as migrações.

```bash
cd backend
npm run build       # Compila TypeScript → JavaScript
npm run migrate     # Cria as tabelas no banco
npm run seed        # Popula dados iniciais (labs, admin)
cd ..
```

---

## 🖥️ Executando a Aplicação

### Opção A — Script Automatizado (Recomendado para Dev)
```bash
./start-app.sh
```
| Serviço | URL |
|---------|-----|
| Frontend Angular | http://localhost:4200 |
| Backend API | http://localhost:3000 |
| Health Check | http://localhost:3000/health |
| Swagger Docs | http://localhost:3000/api-docs |

### Opção B — Terminais Separados
```bash
# Terminal 1 — Backend (Nodemon com hot-reload)
npm run backend:dev

# Terminal 2 — Frontend (Angular CLI com live-reload)
npm run dev
```

### Opção C — Docker Compose (Infraestrutura Completa)
```bash
npm run docker:up       # Sobe: App, PostgreSQL, Redis, Prometheus, Grafana, Backup
docker-compose logs -f app
npm run docker:down     # Derruba tudo
```

| Serviço | URL |
|---------|-----|
| Aplicação | http://localhost:4000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |

---

## 🚀 Deploy em Produção

```bash
chmod +x deploy-ubuntu.sh
sudo ./deploy-ubuntu.sh
```

O script instala Node.js 20 LTS, configura Nginx como proxy reverso, faz build de produção do Angular e gerencia a API com **PM2**.

> **Pós-deploy**: Execute `sudo certbot --nginx -d seu-dominio.com.br` para ativar SSL/TLS gratuito.

---

## 🔐 Segurança

O DEPPI implementa múltiplas camadas de segurança:

- **Autenticação**: JWT com Access + Refresh Tokens, bcrypt (12 rounds)
- **Headers HTTP**: Helmet (HSTS, X-Frame-Options, X-Content-Type-Options, CSP)
- **Rate Limiting**: 200 req/15min em produção por IP (`express-rate-limit`)
- **CORS**: Origens estritamente controladas via `.env`
- **Nginx**: `server_tokens off`, CSP header, proxy reverso
- **GitHub Push Protection**: Proteção contra vazamento de secrets nos commits
- **Graceful Shutdown**: Handlers para SIGTERM/SIGINT
- **Service Worker (PWA)**: Registrado em produção para cache offline

---

## 🔑 Credenciais de Teste

Após rodar os seeds (`npm run seed`):

| Campo | Valor |
|-------|-------|
| Matrícula | `123456` |
| Senha | Gerada aleatoriamente — exibida **uma única vez** no terminal (bloco `Conta admin mestre criada`) |
| URL de login | http://localhost:4200/boletins/login |

> ⚠️ Guarde a senha imediatamente e troque-a assim que possível.

---

## 📁 Estrutura do Projeto

```
deppi_novo/
├── src/                         # Frontend Angular (SPA)
│   ├── app/
│   │   ├── core/                # Serviços singleton (Auth, Theme, i18n, Analytics)
│   │   │   ├── guards/          # AuthGuard
│   │   │   ├── interceptors/    # Auth, Error e Loading interceptors
│   │   │   └── services/        # AuthService, ThemeService, UploadService, etc.
│   │   ├── features/            # Módulos lazy-loaded
│   │   │   ├── home/            # Página inicial
│   │   │   ├── boletins/        # Gestão de boletins
│   │   │   ├── revista/         # Anais da Mostra Científica
│   │   │   ├── laboratorios/    # Catálogo de laboratórios
│   │   │   ├── visitas/         # Agendamento de visitas (público + admin)
│   │   │   ├── pit-rit/         # Relatórios PIT/RIT
│   │   │   ├── talentos/        # Vitrine tecnológica
│   │   │   ├── research/        # Pesquisa
│   │   │   ├── extension/       # Extensão
│   │   │   ├── innovation/      # Inovação
│   │   │   ├── post-graduation/ # Pós-Graduação
│   │   │   ├── contact/         # Formulário de contato
│   │   │   └── privacy/         # Política de privacidade
│   │   ├── layout/              # Header e Footer
│   │   ├── shared/              # Componentes, pipes e diretivas reutilizáveis
│   │   └── store/               # NgRx (reducers, effects, selectors)
│   └── assets/                  # Imagens, ícones, i18n, design tokens
├── backend/                     # Backend Node.js / Express / TypeScript
│   └── src/
│       ├── config/              # Variáveis de ambiente tipadas
│       ├── controllers/         # Controladores REST
│       ├── database/            # Knex config, migrations (12+) e seeds
│       ├── jobs/                # Cron jobs (limpeza de visitas com retenção de 30d)
│       ├── middleware/          # Auth (JWT), error handler, not-found, validação
│       ├── routes/              # Definição de rotas da API
│       ├── services/            # Email, Calendar (Google), Visit Retention
│       ├── types/               # Tipagens TypeScript
│       └── utils/               # Logger (Winston), helpers
├── .github/workflows/           # CI/CD (GitHub Actions) e sync de talentos
├── docs/                        # Documentação auxiliar e relatórios de auditoria
├── nginx.conf                   # Proxy reverso, CSP, Gzip, uploads 50 MB
├── docker-compose.yml           # App + PostgreSQL + Redis + Prometheus + Grafana + Backup
├── Dockerfile                   # Build multi-stage
├── prometheus.yml               # Configuração do Prometheus
├── setup-postgres.sh            # Setup automatizado do PostgreSQL local
├── start-app.sh                 # Script de inicialização local (dev)
├── deploy-ubuntu.sh             # Deploy automatizado (produção, Ubuntu 22.04+)
└── test-api.sh                  # Smoke tests via curl
```

---

## 🧪 Testes

```bash
# Testes unitários do Frontend (Jasmine/Karma)
npm run test

# Testes do Backend (Jest)
cd backend && npm run test

# Testes com cobertura
npm run test:coverage              # Frontend
cd backend && npm run test:coverage # Backend

# Smoke tests da API
./test-api.sh
```

---

## ⚙️ CI/CD

O projeto utiliza **GitHub Actions** com o workflow [`ci-cd.yml`](.github/workflows/ci-cd.yml):

- Lint e formatação automática
- Build do frontend e backend
- Execução de testes
- Build e push de imagem Docker para `ghcr.io/deppimaracanau/deppi_novo`
- Sincronização automática de dados de talentos ([`sync-talentos.yml`](.github/workflows/sync-talentos.yml))

---

## 🤝 Contribuição

1. Faça um **fork** do repositório.
2. Crie uma branch para sua funcionalidade: `git checkout -b feature/minha-funcionalidade`
3. Faça commits seguindo o padrão **Conventional Commits**:
   - `feat:` nova funcionalidade
   - `fix:` correção de bug
   - `chore:` manutenção, configuração
   - `security:` correção de segurança
4. Faça push e abra um **Pull Request** detalhando as mudanças.

> O repositório possui **GitHub Push Protection** ativo — secrets detectados em commits serão bloqueados automaticamente.

---

## 📚 Documentação Complementar

| Documento | Descrição |
|-----------|-----------|
| [`MANUAL_DE_INSTALACAO.md`](MANUAL_DE_INSTALACAO.md) | Guia detalhado de instalação passo a passo |
| [`README_ARQUITETURA.md`](README_ARQUITETURA.md) | Decisões arquiteturais e diagramas técnicos |
| [`SECURITY.md`](SECURITY.md) | Política de segurança e como reportar vulnerabilidades |
| [`.env.example`](.env.example) | Template com todas as variáveis de ambiente documentadas |

---

## 📄 Licença e Manutenção

Este projeto é mantido pelo **IFCE Campus Maracanaú** — Departamento de Extensão, Pesquisa, Pós-Graduação e Inovação.

📧 **Contato**: conhecaifce@maracanau.ifce.edu.br

Licenciado sob a **GNU General Public License v3.0** — veja o arquivo [LICENSE](LICENSE) para detalhes.
