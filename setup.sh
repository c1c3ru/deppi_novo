#!/bin/bash

# Script de setup do projeto DEPPI
# Instala dependências e configura ambiente

echo "🚀 Iniciando setup do projeto DEPPI..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js 18+"
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale o npm"
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão $NODE_VERSION é muito antiga. Requerido: 18.0.0+"
    echo "   Versão atual: $NODE_VERSION"
    echo "   Versão mínima: 18.0.0"
    exit 1
fi

echo "✅ Node.js versão $NODE_VERSION encontrado"

# Instalar semver para verificação de versão
npm install -g semver

# Criar arquivo .env a partir do exemplo
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "⚠️  Por favor, edite o arquivo .env com suas configurações"
fi

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
npm install

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install
cd ..

# Instalar dependências de desenvolvimento
echo "📦 Instalando dependências de desenvolvimento..."
npm install --save-dev @types/node @types/jest @types/mocha cypress @nx/cypress

# Verificar se Angular CLI está instalado
if ! command -v ng &> /dev/null; then
    echo "📦 Instalando Angular CLI..."
    npm install -g @angular/cli
fi

# Criar estrutura de diretórios necessária
echo "📁 Criando estrutura de diretórios..."
mkdir -p src/app/{core,shared,features,layout}/{components,services,guards,interceptors,directives,models}
mkdir -p src/app/features/{home,research,extension,innovation,post-graduation,boletins,contact}
mkdir -p src/app/store/{router,boletins,auth}
mkdir -p src/environments
mkdir -p backend/src/{controllers,services,repositories,middleware,models,routes,utils,config,database/{migrations,seeds}}
mkdir -p cypress/{e2e,fixtures,support,plugins}
mkdir -p database/init
mkdir -p monitoring/{prometheus,grafana/{datasources,dashboards}}
mkdir -p nginx
mkdir -p scripts
mkdir -p logs
mkdir -p uploads

# Criar arquivos de ambiente básicos
echo "📝 Criando arquivos de ambiente..."

# Environment files
cat > src/environments/environment.ts << 'EOF'
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  googleAnalyticsId: 'G-XXXXXXXXXX',
  sentryDsn: ''
};
EOF

cat > src/environments/environment.prod.ts << 'EOF'
export const environment = {
  production: true,
  apiUrl: 'https://api.deppi.ifce.edu.br',
  googleAnalyticsId: 'G-XXXXXXXXXX',
  sentryDsn: 'https://your-sentry-dsn'
};
EOF

# Backend environment config
cat > backend/src/config/environment.ts << 'EOF'
export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'deppi',
    user: process.env.DB_USER || 'deppi',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.DB_SSL === 'true'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  cors: {
    allowedOrigins: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4200']
  }
};
EOF

# Logger básico
cat > backend/src/utils/logger.ts << 'EOF'
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
EOF

# Middleware básico
cat > backend/src/middleware/error.middleware.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  logger.error('Error occurred:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
}
EOF

cat > backend/src/middleware/notFound.middleware.ts << 'EOF'
import { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.path} not found`
  });
}
EOF

# Health route básico
cat > backend/src/routes/health.routes.ts << 'EOF'
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
EOF

# Cypress support básico
cat > cypress/support/e2e.ts << 'EOF'
import './commands';

// Add custom commands here
declare global {
  namespace Cypress {
    interface Chainable {
      login(registration: string, password: string): void;
    }
  }
}

Cypress.Commands.add('login', (registration: string, password: string) => {
  cy.visit('/boletins/login');
  cy.get('[data-cy="registration-input"]').type(registration);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="submit-button"]').click();
});
EOF

cat > cypress/support/commands.ts << 'EOF'
// Custom commands for Cypress
EOF

# Fixtures para testes
cat > cypress/fixtures/user-data.ts << 'EOF'
export const testUserData = {
  validUser: {
    registration: '12345',
    password: '123456',
    name: 'Usuário Teste'
  },
  invalidUser: {
    registration: '99999',
    password: 'wrongpassword'
  }
};
EOF

# TypeScript config
cat > tsconfig.json << 'EOF'
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": ["ES2022", "dom"]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
EOF

# Backend TypeScript config
cat > backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "types": ["node", "jest"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
EOF

# ESLint config
cat > .eslintrc.json << 'EOF'
{
  "root": true,
  "ignorePatterns": ["projects/**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "extends": ["@angular-eslint/recommended"],
      "rules": {
        "@angular-eslint/directive-selector": ["error", { "type": "attribute", "prefix": "deppi", "style": "camelCase" }],
        "@angular-eslint/component-selector": ["error", { "type": "element", "prefix": "deppi", "style": "kebab-case" }]
      }
    },
    {
      "files": ["*.html"],
      "extends": ["@angular-eslint/template/recommended"],
      "rules": {}
    }
  ]
}
EOF

# Prettier config
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
EOF

# Git attributes
cat > .gitattributes << 'EOF'
*.ts linguist-language=TypeScript
*.js linguist-language=JavaScript
*.html linguist-language=HTML
*.css linguist-language=CSS
*.scss linguist-language=SCSS
EOF

echo "✅ Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Edite o arquivo .env com suas configurações"
echo "2. Configure o banco de dados PostgreSQL"
echo "3. Execute 'npm run dev' para iniciar o frontend"
echo "4. Execute 'npm run backend:dev' para iniciar o backend"
echo "5. Execute 'npm run test' para rodar os testes"
echo ""
echo "🚀 Projeto DEPPI pronto para desenvolvimento!"
