#!/bin/bash

# Script de configuração do PostgreSQL para o projeto DEPPI
# Instala PostgreSQL, cria banco de dados e usuário

echo "🗄️ Configurando PostgreSQL para o projeto DEPPI..."

# Verificar se está rodando como root ou com sudo
if [ "$EUID" -eq 0 ]; then
    echo "❌ Não execute este script como root. Use seu usuário normal com sudo quando necessário."
    exit 1
fi

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "📦 PostgreSQL não encontrado. Instalando..."

    # Detectar distribuição Linux
    if command -v apt &> /dev/null; then
        # Ubuntu/Debian
        echo "📦 Instalando PostgreSQL no Ubuntu/Debian..."
        sudo apt update
        sudo apt install -y postgresql postgresql-contrib
    elif command -v yum &> /dev/null; then
        # CentOS/RHEL
        echo "📦 Instalando PostgreSQL no CentOS/RHEL..."
        sudo yum install -y postgresql-server postgresql-contrib
        sudo postgresql-setup initdb
        sudo systemctl enable postgresql
    elif command -v dnf &> /dev/null; then
        # Fedora
        echo "📦 Instalando PostgreSQL no Fedora..."
        sudo dnf install -y postgresql-server postgresql-contrib
        sudo postgresql-setup --initdb
        sudo systemctl enable postgresql
    else
        echo "❌ Distribuição Linux não suportada. Instale PostgreSQL manualmente."
        echo "   Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
        echo "   CentOS/RHEL: sudo yum install postgresql-server postgresql-contrib"
        echo "   Fedora: sudo dnf install postgresql-server postgresql-contrib"
        exit 1
    fi
else
    echo "✅ PostgreSQL já está instalado"
fi

# Iniciar e habilitar PostgreSQL
echo "🔄 Iniciando PostgreSQL..."
if command -v systemctl &> /dev/null; then
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
elif command -v service &> /dev/null; then
    sudo service postgresql start
else
    echo "⚠️ Não foi possível iniciar PostgreSQL automaticamente."
    echo "   Inicie manualmente com: sudo systemctl start postgresql"
fi

# Aguardar PostgreSQL iniciar
sleep 5

# Verificar se PostgreSQL está rodando
if ! sudo -u postgres psql -c "SELECT version();" &> /dev/null; then
    echo "❌ PostgreSQL não está respondendo. Verifique a instalação."
    exit 1
fi

echo "✅ PostgreSQL está funcionando"

# Definir senha para o usuário postgres (se não definida)
echo "🔐 Configurando senha do usuário postgres..."

# Criar usuário e banco de dados
echo "👤 Criando usuário e banco de dados..."

sudo -u postgres psql << EOF
-- Criar usuário deppi se não existir
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'deppi') THEN
      CREATE USER deppi WITH PASSWORD 'deppi_password';
   END IF;
END
\$\$;

-- Criar banco de dados deppi se não existir
SELECT 'CREATE DATABASE deppi OWNER deppi'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'deppi')\gexec

-- Criar banco de dados deppi_test para testes se não existir
SELECT 'CREATE DATABASE deppi_test OWNER deppi'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'deppi_test')\gexec

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE deppi TO deppi;
GRANT ALL PRIVILEGES ON DATABASE deppi_test TO deppi;

-- Alterar senha do usuário deppi
ALTER USER deppi PASSWORD 'deppi_password';
EOF

if [ $? -eq 0 ]; then
    echo "✅ Banco de dados e usuário criados com sucesso"
else
    echo "❌ Erro ao criar banco de dados e usuário"
    exit 1
fi

# Testar conexão
echo "🧪 Testando conexão com o banco de dados..."
export PGPASSWORD='deppi_password'

if psql -h localhost -U deppi -d deppi -c "SELECT version();" &> /dev/null; then
    echo "✅ Conexão com o banco de dados funcionando"
else
    echo "❌ Erro na conexão com o banco de dados"
    exit 1
fi

# Instalar cliente PostgreSQL se necessário
if ! command -v psql &> /dev/null; then
    echo "📦 Instalando cliente PostgreSQL..."
    if command -v apt &> /dev/null; then
        sudo apt install -y postgresql-client
    elif command -v yum &> /dev/null; then
        sudo yum install -y postgresql
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y postgresql
    fi
fi

# Criar arquivo .env com as configurações do banco
if [ -f .env ]; then
    echo "📝 Arquivo .env já existe. Atualizando configurações do banco..."

    # Remover configurações antigas do banco
    sed -i '/^DB_/d' .env
    sed -i '/^DATABASE_URL/d' .env
    sed -i '/^PG/d' .env

    # Adicionar novas configurações
    cat >> .env << EOF

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=deppi
DB_USER=deppi
DB_PASSWORD=deppi_password
DB_SSL=false
DATABASE_URL=postgresql://deppi:deppi_password@localhost:5432/deppi

# PostgreSQL Connection Details
PGHOST=localhost
PGPORT=5432
PGDATABASE=deppi
PGUSER=deppi
PGPASSWORD=deppi_password
EOF
else
    echo "📝 Criando arquivo .env com configurações do banco..."
    cp .env.example .env

    # Atualizar configurações do banco
    sed -i 's/your_secure_password_here/deppi_password/g' .env
fi

echo ""
echo "🎉 PostgreSQL configurado com sucesso!"
echo ""
echo "📊 Detalhes da configuração:"
echo "   Host: localhost"
echo "   Porta: 5432"
echo "   Banco: deppi"
echo "   Usuário: deppi"
echo "   Senha: deppi_password"
echo ""
echo "🧪 Para testar a conexão:"
echo "   PGPASSWORD=deppi_password psql -h localhost -U deppi -d deppi"
echo ""
echo "📁 Próximos passos:"
echo "1. Execute as migrations: cd backend && npm run migrate"
echo "2. Execute os seeds: cd backend && npm run seed"
echo "3. Inicie o backend: npm run dev"
echo ""
echo "⚠️ IMPORTANTE: Altere a senha 'deppi_password' no arquivo .env para produção!"
