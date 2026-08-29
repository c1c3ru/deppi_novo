# DEPPI - Aplicação Web (IFCE Campus Maracanaú)

Sistema de gestão de boletins, vitrine tecnológica, relatórios docentes (PIT/RIT) e portal informativo do **Departamento de Extensão, Pesquisa, Pós-Graduação e Inovação (DEPPI)** do IFCE Campus Maracanaú.

---

## 🚀 Arquitetura e Tecnologias

A aplicação utiliza uma stack moderna baseada em microsserviços e SPA:
- **Frontend**: Angular 17+ (TypeScript, SCSS com Glassmorphism e Modo Escuro nativo).
- **Backend**: Node.js 18/20 LTS (Express, Knex.js, TypeScript, validação com Joi/Express-Validator).
- **Banco de Dados**: PostgreSQL 15+ (com suporte a migrações e seeds automatizados).
- **Cache e Fila**: Redis 7 (opcional/integrado via Docker).
- **Servidor Web e Proxy**: Nginx (para proxy reverso, compressão Gzip e servir uploads de grandes arquivos de até 50MB).
- **Orquestração e Processos**: Docker Compose e PM2.

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
- **Node.js** (versão 18.0.0 ou superior; recomendamos Node 20 LTS).
- **NPM** (versão 9.0.0 ou superior).
- **PostgreSQL** (versão 15 ou superior, caso rode o banco localmente fora do Docker).
- **Docker e Docker Compose** (opcional, para rodar a infraestrutura completa via containers).
- **Git** e ferramentas de compilação básicas (`build-essential`).

---

## 🛠️ Instalação e Configuração Inicial

Siga o passo a passo abaixo para configurar o ambiente de desenvolvimento pela primeira vez:

### 1. Clonar o Repositório e Instalar Dependências
No diretório raiz do projeto, execute a instalação das dependências do frontend e do backend:
```bash
# Instala as dependências do frontend Angular e ferramentas de dev na raiz
npm install

# Instala as dependências do backend Node.js
cd backend
npm install
cd ..
```

### 2. Configurar Variáveis de Ambiente (.env)
Crie o arquivo de configuração `.env` na raiz do projeto copiando o exemplo fornecido:
```bash
cp .env.example .env
```
> **Nota**: O script de setup do banco (passo seguinte) ajustará automaticamente as credenciais locais no seu arquivo `.env`.

### 3. Configurar o Banco de Dados PostgreSQL
Para instalar e configurar o PostgreSQL localmente (criando o banco `deppi`, usuário `deppi` e atribuindo as permissões), utilize o script automatizado:
```bash
./setup-postgres.sh
```

### 4. Build do Backend e Execução de Migrations / Seeds
> **⚠️ PASSO CRÍTICO**: O Knex CLI necessita dos arquivos compilados em JavaScript (`dist/`) para executar as migrações. Portanto, é obrigatório realizar o build do backend antes de rodar as migrations.

```bash
cd backend

# 1. Compila o código TypeScript para JavaScript na pasta dist/
npm run build

# 2. Executa as migrações para criar as tabelas no banco de dados
npm run migrate

# 3. Popula o banco com dados iniciais de teste (usuários, laboratórios, boletins)
npm run seed

cd ..
```

---

## 🖥️ Executando a Aplicação

Você pode rodar a aplicação de três maneiras diferentes, dependendo da sua necessidade:

### Opção A: Método Rápido Automatizado (Recomendado para Dev)
O script `start-app.sh` verifica as portas, inicializa o PostgreSQL (se necessário) e sobe o backend e o frontend simultaneamente.
```bash
./start-app.sh
```
- **Frontend Angular**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Health Check da API**: http://localhost:3000/health

### Opção B: Método Manual em Terminais Separados
Se preferir gerenciar os processos manualmente em abas distintas do terminal:

**Terminal 1 (Backend em modo de desenvolvimento com Nodemon)**:
```bash
npm run backend:dev
# Ou entrando na pasta: cd backend && npm run dev
```

**Terminal 2 (Frontend Angular com Live Reload)**:
```bash
npm run dev
# Ou diretamente: npm start
```

### Opção C: Orquestração Completa via Docker Compose
Para subir toda a infraestrutura (Aplicação, PostgreSQL, Redis, Prometheus, Grafana e serviço de Backup) em containers Docker:
```bash
# Constrói as imagens e sobe os containers em segundo plano
npm run docker:up
# Ou diretamente: docker-compose up -d

# Para acompanhar os logs
docker-compose logs -f app

# Para derrubar a infraestrutura
npm run docker:down
```

---

## 🚀 Deploy em Produção (Servidores Linux / Ubuntu)

Para ambientes de produção (Ubuntu 22.04+), o projeto conta com o script de deploy automatizado `deploy-ubuntu.sh`. Ele instala as dependências do sistema, configura o Node.js 20 LTS, instala e configura o Nginx como proxy reverso, faz o build de produção do Angular e gerencia a API com o **PM2**.

```bash
chmod +x deploy-ubuntu.sh
sudo ./deploy-ubuntu.sh
```
> **Pós-Deploy**: O script sugerirá a execução do Certbot (`sudo certbot --nginx -d seu-dominio.com.br`) para habilitar criptografia SSL/TLS gratuitamente.

---

## 🔐 Credenciais de Teste e Demonstração

Após rodar os seeds (`npm run seed`), o sistema terá um usuário administrador mestre configurado para acesso à área restrita:

- **Matrícula / Usuário**: `123456`
- **Senha**: gerada aleatoriamente a cada execução do seed e impressa **uma única vez** no terminal (procure pelo bloco `Conta admin mestre criada`). Guarde-a nesse momento e troque-a assim que possível — ela não fica salva em nenhum outro lugar.
- **URL de Acesso**: http://localhost:4200/boletins/login (ou `/boletins` na navegação)

---

## 📁 Estrutura do Projeto

```text
deppi_novo/
├── src/                    # Frontend Angular (SPA modular)
│   ├── app/
│   │   ├── core/           # Serviços de autenticação, interceptors, guards e i18n
│   │   ├── features/       # Módulos de funcionalidades (Boletins, Laboratórios, PIT/RIT, Home)
│   │   ├── layout/         # Componentes estruturais (Header, Footer, Navegação)
│   │   └── shared/         # Componentes, pipes e diretivas reutilizáveis
│   └── assets/             # Imagens, ícones, arquivos i18n e design tokens
├── backend/                # Backend Node.js / Express / TypeScript
│   ├── src/
│   │   ├── controllers/    # Controladores da API REST
│   │   ├── database/       # Configuração do Knex, Migrations e Seeds
│   │   ├── middleware/     # Middlewares de autenticação (JWT), erro e validação
│   │   ├── models/         # Interfaces e esquemas de dados
│   │   └── routes/         # Definição das rotas da API
├── cypress/                # Testes E2E (Cypress)
├── nginx.conf              # Configuração do Nginx (Proxy, Cache, Gzip, Uploads)
├── docker-compose.yml      # Definição da infraestrutura de containers
├── start-app.sh            # Script de inicialização local
└── deploy-ubuntu.sh        # Script automatizado de deploy para produção
```

---

## 🌟 Principais Funcionalidades

- ✅ **Vitrine Tecnológica**: Catálogo dinâmico de laboratórios, pesquisas, inovações e serviços do campus.
- ✅ **Formulários e Relatórios PIT/RIT**: Sistema avançado para geração de Plano Individual de Trabalho e Relatório Individual de Trabalho em PDF, com cálculo automático de carga horária e suporte a múltiplos regimes (20h, 30h, 40h, 40h D.E.).
- ✅ **Área Restrita de Boletins**: Gestão completa de informativos com Editor de Texto Avançado (**Quill v2**) e upload de imagens.
- ✅ **Design System Premium (Glassmorphism)**: Interface moderna, fluida e com suporte nativo e persistente ao **Modo Escuro**.
- ✅ **Segurança Avançada**: Autenticação via JWT (com Refresh Tokens), proteção contra XSS (Helmet), Rate Limiting e CORS estrito.
- ✅ **Infraestrutura e Armazenamento**: Suporte a uploads de grandes arquivos (até 50MB) gerenciados de forma eficiente pelo Nginx.

---

## 🧪 Testes e Monitoramento

### Testes Automatizados
```bash
# Executar testes unitários do Frontend
npm run test

# Executar testes do Backend
cd backend && npm run test

# Testar endpoints da API via script de curl
./test-api.sh

# Executar testes End-to-End (Cypress)
npm run e2e
```

### Monitoramento e Saúde da API
- **Health Check Endpoint**: http://localhost:3000/health
- **Métricas Prometheus**: http://localhost:9090 (quando rodando via Docker Compose)
- **Dashboard Grafana**: http://localhost:3001 (quando rodando via Docker Compose)

---

## 🤝 Contribuição

1. Faça um fork do repositório.
2. Crie uma branch para sua funcionalidade ou correção: `git checkout -b feature/minha-funcionalidade`.
3. Faça o commit de suas alterações seguindo o padrão convencional (ex: `feat: adiciona filtro na vitrine`): `git commit -m 'feat: adiciona filtro na vitrine'`.
4. Faça o push para a branch: `git push origin feature/minha-funcionalidade`.
5. Abra um Pull Request explicando detalhadamente as mudanças realizadas.

---

## 📄 Licença e Manutenção

Este projeto é mantido pelo **IFCE Campus Maracanaú**.  
Licenciado sob a **GNU GPLv3**.
