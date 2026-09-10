#!/bin/bash

# ==============================================================================
# Script de Deploy Completo DEPPI - Ubuntu 22.04+ (Nginx + Node.js + PostgreSQL)
# ==============================================================================
# Este script automatiza a instalação de dependências, configuração do banco,
# build do frontend e backend, e configuração do Nginx como proxy reverso.
#
# Uso: chmod +x deploy-ubuntu.sh && sudo ./deploy-ubuntu.sh
# ==============================================================================

set -e

# Configurações editáveis
DB_NAME="deppi"
DB_USER="deppi"
DB_PASS="deppi_prod_password_$(openssl rand -hex 4)" # Senha aleatória para o banco
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
DOMAIN_NAME="deppi.maracanau.ifce.edu.br" # Altere para o seu domínio real
PROJECT_ROOT=$(pwd)

echo "🚀 Iniciando deploy do projeto DEPPI em ambiente Linux (Ubuntu)..."

# 1. Atualizar sistema e instalar dependências básicas
echo "📦 Atualizando pacotes do sistema..."
apt update && apt upgrade -y
apt install -y curl git build-essential openssl nginx certbot python3-certbot-nginx libvips-dev

# 2. Instalar Node.js 20.x (LTS)
echo "📦 Instalando Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. Instalar PostgreSQL
echo "📦 Instalando PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# 4. Configurar Banco de Dados
echo "🗄️ Configurando usuário e banco de dados PostgreSQL..."
sudo -u postgres psql << EOF
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
      CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
   END IF;
END
\$\$;
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER PASSWORD '$DB_PASS';
EOF

# 5. Instalar PM2 Globalmente
echo "📦 Instalando PM2 (Process Manager)..."
npm install -g pm2

# 6. Configurar Variáveis de Ambiente (.env)
echo "📝 Criando arquivo .env de produção..."
if [ ! -f .env ]; then
  cp .env.example .env
fi

# Atualizar .env com valores de produção
sed -i "s/^NODE_ENV=.*/NODE_ENV=production/" .env
sed -i "s/^PORT=.*/PORT=3000/" .env
sed -i "s/^DB_HOST=.*/DB_HOST=localhost/" .env
sed -i "s/^DB_NAME=.*/DB_NAME=$DB_NAME/" .env
sed -i "s/^DB_USER=.*/DB_USER=$DB_USER/" .env
sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env
sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
sed -i "s/^JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" .env

# Sincronizar .env para a pasta backend
cp .env backend/.env

# 7. Instalar dependências e Build do Backend
echo "🔨 Construindo o Backend..."
cd backend
rm -rf node_modules package-lock.json dist # 1. Remove arquivos antigos para evitar cache quebrado
npm install --include=dev             # 2. Instala dependências (incluindo as de dev)
npm run build                         # 4. Faz o build
npm run migrate
npm run seed
npm prune --omit=dev                  # 5. Remove dependências de dev para liberar espaço
cd ..

# 8. Instalar dependências e Build do Frontend
echo "🔨 Construindo o Frontend (Angular)..."
# 1. Remova a pasta dist antiga para não ter lixo
rm -rf $PROJECT_ROOT/dist/
# 2. Instale as dependências garantindo compatibilidade (importante o legacy-peer-deps)
npm install --legacy-peer-deps
# 3. Rode o build passando o parâmetro de produção e forçando o service worker
npx ng build --configuration production --service-worker=true
# 9. Configurar PM2 para rodar o Backend
echo "🚀 Iniciando API Backend com PM2..."
cd backend
npx pm2 delete deppi-api || true
if [ -f "dist/src/index.js" ]; then
    # Exemplo se for dist/src/index.js
    npx pm2 start dist/src/index.js --name deppi-api --env production
elif [ -f "dist/index.js" ]; then
    # Exemplo se for dist/index.js
    npx pm2 start dist/index.js --name deppi-api --env production
else
    echo "❌ Arquivo index.js não encontrado no build do backend."
    exit 1
fi
npx pm2 save
cd ..

# 10. Configurar Nginx
echo "🌐 Configurando Nginx..."
NGINX_CONF="/etc/nginx/sites-available/deppi"

cat > $NGINX_CONF << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    # Oculta a versão do Nginx nos headers de resposta e páginas de erro
    server_tokens off;

    # Cabeçalhos de segurança (aplicados a todas as respostas deste server)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com; frame-src 'self' https://www.youtube.com https://player.vimeo.com;" always;

    # Frontend (Angular SPA)
    root $PROJECT_ROOT/dist/deppi/browser;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API Backend Proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Health Check
    location /health {
        proxy_pass http://localhost:3000/health;
    }

    # API Documentation (opcional em produção)
    # location /api-docs/ {
    #     proxy_pass http://localhost:3000/api-docs/;
    # }

    # Uploads (acesso direto a arquivos estáticos)
    location /uploads/ {
        alias $PROJECT_ROOT/uploads/;
        autoindex off;
        expires 30d;
        # add_header nesta location substitui os herdados do server, por isso repetimos
        add_header Cache-Control "public, no-transform";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com; frame-src 'self' https://www.youtube.com https://player.vimeo.com;" always;
    }

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
    gzip_disable "MSIE [1-6]\.";
}
EOF

ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 11. Finalização
echo ""
echo "===================================================================="
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "===================================================================="
echo "📊 Detalhes da Instalação:"
echo "   Site: http://$DOMAIN_NAME"
echo "   API: http://$DOMAIN_NAME/api"
echo "   Logs API: pm2 logs deppi-api"
echo ""
echo "🔐 Credenciais do Banco (Salvas no .env):"
echo "   Usuário: $DB_USER"
echo "   Senha: $DB_PASS"
echo ""
echo "🚀 Próximo Passo Sugerido (Certificado SSL):"
echo "   sudo certbot --nginx -d $DOMAIN_NAME"
echo "===================================================================="
echo "⚠️  Importante: Certifique-se de que a porta 80 e 443 estão abertas"
echo "   no firewall (ufw allow 'Nginx Full')."
echo "===================================================================="
