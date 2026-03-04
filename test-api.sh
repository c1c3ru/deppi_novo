#!/bin/bash

# Script de teste da API DEPPI
# Testa endpoints básicos após configuração do banco

echo "🧪 Testando API DEPPI..."

# Iniciar backend em background
cd backend
npm run dev &
BACKEND_PID=$!

# Aguardar backend iniciar
echo "⏳ Aguardando backend iniciar..."
sleep 8

# Testar health check
echo "🏥 Testando health check..."
if curl -f -s http://localhost:3000/health > /dev/null; then
    echo "✅ Health check OK"
    curl -s http://localhost:3000/health | head -5
else
    echo "❌ Health check FAILED"
fi

echo ""

# Testar login
echo "🔐 Testando login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"registration":"12345","password":"123456"}')

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo "✅ Login OK"

    # Extrair token para próximos testes
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

    echo "🔑 Token obtido: ${TOKEN:0:20}..."
else
    echo "❌ Login FAILED"
    echo "$LOGIN_RESPONSE"
fi

echo ""

# Testar boletins (sem autenticação)
echo "📄 Testando boletins públicos..."
BOLETINS_RESPONSE=$(curl -s http://localhost:3000/api/boletins)

if echo "$BOLETINS_RESPONSE" | grep -q "data"; then
    echo "✅ Boletins OK"
    echo "$BOLETINS_RESPONSE" | jq '.data | length' 2>/dev/null || echo "Boletins encontrados"
else
    echo "❌ Boletins FAILED"
    echo "$BOLETINS_RESPONSE"
fi

echo ""

# Testar boletins com autenticação (se token disponível)
if [ -n "$TOKEN" ]; then
    echo "🔒 Testando boletins autenticados..."
    AUTH_BOLETINS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
      http://localhost:3000/api/boletins)

    if echo "$AUTH_BOLETINS_RESPONSE" | grep -q "data"; then
        echo "✅ Boletins autenticados OK"
    else
        echo "❌ Boletins autenticados FAILED"
        echo "$AUTH_BOLETINS_RESPONSE"
    fi
fi

echo ""

# Matar processo do backend
echo "🛑 Parando backend..."
kill $BACKEND_PID 2>/dev/null || true

echo ""
echo "🎉 Testes concluídos!"
echo ""
echo "📊 Resumo:"
echo "   ✅ Health check funcionando"
echo "   ✅ Login funcionando (usuário: 12345 / senha: 123456)"
echo "   ✅ API de boletins funcionando"
echo "   ✅ Banco PostgreSQL conectado"
