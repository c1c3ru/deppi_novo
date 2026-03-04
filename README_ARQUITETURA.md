# Arquitetura DEPPI - IFCE Campus Maracanaú

## Visão Geral

Este projeto implementa uma arquitetura moderna e escalável para o portal do Departamento de Extensão, Pesquisa, Pós-Graduação e Inovação (DEPPI) do IFCE Campus Maracanaú, seguindo as melhores práticas de desenvolvimento web.

## 🏗️ Estrutura do Projeto

```
deppi_novo/
├── assets/
│   ├── styles/
│   │   ├── tokens.css          # Design Tokens (cores, tipografia, etc.)
│   │   ├── utilities.css       # Classes utilitárias (estilo Tailwind)
│   │   └── main.css           # Estilos principais e componentes
│   ├── js/
│   │   └── i18n.js            # Sistema de internacionalização
│   ├── i18n/
│   │   └── pt-br.json         # Textos em português
│   └── icons/                 # Ícones e logos
├── backend/                   # API e serviços backend
├── boletins-restrito.html     # Área restrita de boletins
├── index.html                 # Aplicação principal (Angular)
└── README_ARQUITETURA.md      # Esta documentação
```

## 🎨 Design Tokens

### O que são Design Tokens?
Design Tokens são variáveis que armazenam decisões de design (cores, tipografia, espaçamento, etc.) de forma centralizada, permitindo consistência visual e facilidade de manutenção.

### Arquivos Principais

#### `assets/styles/tokens.css`
Define todas as variáveis CSS customizadas:

```css
:root {
  /* Cores Primárias */
  --color-primary-500: #3b82f6;
  --color-ifce-blue: #0066b3;
  
  /* Tipografia */
  --font-family-primary: 'Poppins', sans-serif;
  --font-size-base: 1rem;
  
  /* Espaçamento */
  --spacing-4: 1rem;
  
  /* Bordas */
  --border-radius-md: 0.375rem;
}
```

#### `assets/styles/utilities.css`
Classes utilitárias baseadas nos tokens:

```css
.bg-ifce-blue { background-color: var(--color-ifce-blue); }
.text-primary { color: var(--color-text-primary); }
.p-4 { padding: var(--spacing-4); }
.rounded-md { border-radius: var(--border-radius-md); }
```

### Benefícios

- ✅ **Consistência Visual**: Garante uniformidade em toda a aplicação
- ✅ **Manutenção Centralizada**: Mudanças feitas em um lugar afetam toda a aplicação
- ✅ **Temas**: Suporte nativo para temas claro/escuro
- ✅ **Performance**: Redução de CSS duplicado
- ✅ **Colaboração**: Designers e desenvolvedores usam a mesma linguagem

## 🌍 Internacionalização (i18n)

### Sistema de Tradução

O projeto utiliza um sistema completo de internacionalização que permite:

- Tradução de textos estáticos e dinâmicos
- Detecção automática de idioma
- Suporte a parâmetros nas traduções
- Cache de traduções
- Fallback automático

### Estrutura dos Textos

#### `assets/i18n/pt-br.json`
```json
{
  "common": {
    "loading": "Carregando...",
    "error": "Erro",
    "success": "Sucesso"
  },
  "navigation": {
    "home": "Início",
    "research": "Pesquisa"
  },
  "boletins": {
    "title": "Boletim DEPPI",
    "description": "..."
  }
}
```

### Uso no HTML

```html
<!-- Texto simples -->
<h1 data-i18n="boletins.title">Boletim DEPPI</h1>

<!-- Texto com HTML -->
<p data-i18n-html="boletins.description">Descrição...</p>

<!-- Placeholders -->
<input data-i18n-placeholder="login.registration.placeholder">

<!-- Títulos -->
<button data-i18n-title="common.close">×</button>
```

### Uso no JavaScript

```javascript
// Tradução simples
const title = window.t('boletins.title');

// Com parâmetros
const message = window.t('welcome.user', { name: 'João' });

// Mudar idioma
await window.i18n.setLanguage('en');
```

## 🔐 Área Restrita de Boletins

### Funcionalidades

- **Login Seguro**: Autenticação com matrícula e senha
- **Sessão Persistente**: Mantém login usando localStorage
- **Interface Responsiva**: Funciona em todos os dispositivos
- **Acessibilidade**: Totalmente acessível com suporte a leitores de tela
- **Validação**: Validação de formulário em tempo real
- **Feedback Visual**: Estados de carregamento e erro

### Fluxo de Autenticação

1. Usuário acessa `/boletins-restrito.html`
2. Preenche matrícula e senha
3. Sistema valida credenciais
4. Se sucesso, mostra área de boletins
5. Sessão mantida por 7 dias

### Credenciais de Demonstração

- **Matrícula**: Qualquer valor (ex: 12345)
- **Senha**: 123456

## 🎯 Componentes Principais

### Header Navegação
- Logo IFCE
- Menu responsivo
- Links para seções principais
- Tema claro/escuro

### Hero Section
- Título principal
- Descrição do DEPPI
- Call-to-action

### Cards de Conteúdo
- Pesquisa
- Extensão
- Inovação
- Pós-Graduação

### Footer
- Informações de contato
- Links úteis
- Redes sociais
- Copyright

## 📱 Responsividade

### Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Estratégia Mobile-First

- Layout otimizado para mobile primeiro
- Menu hambúrguer para telas pequenas
- Cards empilhados verticalmente
- Tipografia adaptativa

## ♿ Acessibilidade

### Recursos Implementados

- **Semântica HTML5**: Uso correto de tags semânticas
- **ARIA Labels**: Atributos ARIA onde necessário
- **Navegação por Teclado**: Tab order lógico
- **Contraste**: Cores com WCAG AA compliance
- **Leitores de Tela**: Conteúdo alternativo para imagens
- **Redução de Movimento**: Respeita preferências do usuário

### Exemplos

```html
<!-- Navegação por teclado -->
<button tabindex="0" aria-label="Fechar menu">×</button>

<!-- Conteúdo alternativo -->
<img src="logo.png" alt="Logo IFCE Campus Maracanaú">

<!-- Regiões landmark -->
<main role="main" aria-label="Conteúdo principal">
<nav role="navigation" aria-label="Menu principal">
```

## 🚀 Performance

### Otimizações

- **CSS Minificado**: Arquivos CSS otimizados
- **Lazy Loading**: Carregamento sob demanda
- **Cache**: Cache de traduções e recursos
- **Imagens Otimizadas**: Formatos modernos (WebP)
- **Critical CSS**: CSS crítico inline

### Métricas Alvo

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔧 Desenvolvimento

### Pré-requisitos

- Node.js 16+
- NPM ou Yarn
- Servidor web (Apache/Nginx)

### Setup Local

1. Clone o repositório
2. Inicie servidor web na pasta do projeto
3. Acesse `http://localhost:3000`

### Estrutura de Componentes

```javascript
// Exemplo de componente
class BoletinsManager {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkAuthentication();
  }

  async handleLogin() {
    // Lógica de login
  }
}
```

## 📋 Boas Práticas

### CSS
- Usar design tokens para cores e espaçamentos
- Mobile-first approach
- Classes utilitárias para estilos rápidos
- Componentes reutilizáveis

### JavaScript
- ES6+ modules
- Async/await para operações assíncronas
- Tratamento de erros
- Validação de formulários

### HTML
- Semântica HTML5
- Atributos ARIA
- Meta tags para SEO
- Estrutura acessível

## 🔄 Manutenção

### Atualizar Design Tokens

1. Edite `assets/styles/tokens.css`
2. Altere as variáveis necessárias
3. Recompile se necessário

### Adicionar Novos Textos

1. Edite `assets/i18n/pt-br.json`
2. Adicione as novas chaves/valores
3. Use nos arquivos HTML/JS

### Criar Novos Componentes

1. Use classes utilitárias existentes
2. Siga padrão de nomenclatura
3. Mantenha acessibilidade

## 🌐 Deploy

### Produção

1. Minifique CSS/JS
2. Otimize imagens
3. Configure cache headers
4. Setup HTTPS

### Variáveis de Ambiente

```bash
# API URL
VITE_API_URL=https://api.deppi.ifce.edu.br

# Ambiente
NODE_ENV=production
```

## 📊 Monitoramento

### Ferramentas Sugeridas

- Google Analytics
- Google Search Console
- Lighthouse CI
- Sentry (erros)

## 🤝 Contribuição

### Fluxo de Trabalho

1. Fork do projeto
2. Branch feature/nova-funcionalidade
3. Commit com mensagens claras
4. Pull request para review

### Padrões de Commit

```
feat: adicionar área de boletins
fix: corrigir responsividade do header
docs: atualizar documentação
style: ajustar cores dos botões
refactor: otimizar sistema de tokens
```

## 📝 Licença

MIT License - Copyright (c) 2024 IFCE Campus Maracanaú

## 📞 Contato

- **Email**: deppi.maracanau@ifce.edu.br
- **Telefone**: (85) 3307-3700
- **Endereço**: Av. Dr. Sá, 2481 - Maracanaú, CE

---

## 🎯 Próximos Passos

- [ ] Integração com API real de boletins
- [ ] Sistema de upload de arquivos
- [ ] Editor de texto rico para boletins
- [ ] Sistema de notificações
- [ ] Analytics e métricas de uso
- [ ] PWA (Progressive Web App)
- [ ] Offline support
