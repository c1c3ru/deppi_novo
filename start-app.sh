#!/bin/bash

# Script para executar a aplicação DEPPI completa
# Inicia backend e frontend simultaneamente

echo "🚀 Iniciando aplicação DEPPI completa..."
echo ""

# Função para limpar processos ao sair
cleanup() {
    echo ""
    echo "🛑 Parando aplicação..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Capturar sinais de interrupção
trap cleanup SIGINT SIGTERM

# Função para verificar se porta está livre
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        echo "❌ Porta $port já está em uso. Liberando..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Verificar e liberar portas
echo "🔍 Verificando portas..."
check_port 3000
check_port 4200

# Verificar se PostgreSQL está rodando
echo "📊 Verificando PostgreSQL..."
if ! sudo -n systemctl is-active --quiet postgresql 2>/dev/null; then
    echo "🔄 Iniciando PostgreSQL..."
    sudo systemctl start postgresql
fi

# Verificar se Redis está disponível (opcional)
echo "🔄 Verificando Redis..."
if command -v redis-cli &> /dev/null; then
    if ! redis-cli ping &> /dev/null; then
        echo "⚠️  Redis não está disponível, mas isso é opcional"
    else
        echo "✅ Redis disponível"
    fi
else
    echo "⚠️  Redis não instalado, mas isso é opcional"
fi

echo ""
echo "🔧 Iniciando Backend (Porta 3000)..."
cd backend
npm run dev &
BACKEND_PID=$!

# Aguardar backend iniciar
echo "⏳ Aguardando backend iniciar..."
sleep 5

# Verificar se backend está funcionando
if curl -f -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend funcionando em http://localhost:3000"
else
    echo "❌ Erro no backend. Verificando logs..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo "🎨 Iniciando Frontend (Porta 4200)..."
cd ..
npm start &
FRONTEND_PID=$!

# Aguardar frontend iniciar
echo "⏳ Aguardando frontend iniciar..."
sleep 10

# Verificar se frontend está funcionando
if curl -f -s http://localhost:4200 > /dev/null; then
    echo "✅ Frontend funcionando em http://localhost:4200"
else
    echo "⚠️  Frontend ainda inicializando..."
fi

echo ""
echo "🎉 Aplicação DEPPI rodando!"
echo ""
echo "📍 URLs:"
echo "   🌐 Frontend: http://localhost:4200"
echo "   🔧 Backend API: http://localhost:3000"
echo "   💚 Health Check: http://localhost:3000/health"
echo ""
echo "👤 Credenciais de teste:"
echo "   Usuário: 12345"
echo "   Senha: 123456"
echo "   Área restrita: http://localhost:4200/boletins"
echo ""
echo "🛑 Pressione Ctrl+C para parar a aplicação"

# Aguardar indefinidamente
wait
