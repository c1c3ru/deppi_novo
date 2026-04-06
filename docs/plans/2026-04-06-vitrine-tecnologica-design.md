# Vitrine Tecnológica de Laboratórios - Design Doc

## Visão Geral
Este documento descreve o design arquitetural para a funcionalidade "Vitrine Tecnológica" no projeto DEPPI. O objetivo é apresentar os principais laboratórios do Campus Maracanaú, seus serviços e produções de forma dinâmica e moderna. Integrado à arquitetura atual do monolito, isso inclui alterações pontuais tanto na API em Node.js (Knex) quanto na aplicação cliente Angular.

## Arquitetura e Decisões

A solução foi projetada no padrão "Opção 1" de fluxo, garantindo que o gerenciamento do conteúdo (CRUD de laboratórios) seja completamente agnóstico da experiência pública, porém interligado conceitualmente em edição condicional in-line/rota.

### 1. Back-end (Node.js + Knex)
- **Tabela `laboratorios`:**
  - `id` (UUID, primary key)
  - `name` (string)
  - `description` (text)
  - `cover_image` (string/url opcional)
  - `productions` (jsonb array para publicações, prêmios)
  - `services` (jsonb array para serviços prestados)
  - `created_at` / `updated_at` (timestamps)
- **Migração:** Um arquivo de seed/migration será criado (`006_create_laboratorios_table`).
- **Controlador e Rotas:**
  - `LaboratorioController` para implementar GET (todos/por id), POST (criar), PUT (atualizar) e DELETE (remover).
  - Rotas protegidas (POST/PUT/DELETE) usarão o middleware existente de Auth do sistema. O GET será público.

### 2. Front-end (Angular)
- **Módulo:** `LaboratoriosModule` (`src/app/features/laboratorios`).
- **Componentes:**
  - `LaboratoriosListComponent`: Tela pública exibindo grids no padrão *glass-card*. Terá badges/botões para acessar "Detalhes" e, caso o `AuthService` valide um usuário logado/admin, mostrar um ícone "Editar".
  - `LaboratorioDetailComponent`: Exibição detalhada com render de Markdown ou textos puros apresentando produções e serviços, com botão "Editar" se logado.
  - `LaboratorioFormComponent`: Formulário complexo com `ReactiveFormsModule` protegido por `AuthGuard`, permitindo alterar dados e lidar com arrays de produções/serviços.
- **Serviço:**
  - `LaboratoriosService` que fará chamadas `HttpClient` para as rotas `/api/laboratorios` desenvolvidas no back-end.

## Estilo e Experiência
- O design integrará a fundação estabelecida em `main.scss` (tipografia fluida, `glass-card`, `btn-primary` com hover effects e grids expansíveis via `.innovative-grid`).

## Lista Base de Laboratórios
Os 6 laboratórios oficiais de partida identificados são:
1. LINC (Instrumentação e Controle)
2. LabVICIA (Visão Computacional e Inteligência Artificial)
3. LAESE (Eletrônica e Sistemas Embarcados)
4. LIT (Inovação Tecnológica)
5. LAPEQ (Pesquisas Aplicadas em Química)
6. LIMAV (Materiais e Vibrações)
