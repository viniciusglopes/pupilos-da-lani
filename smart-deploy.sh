#!/bin/bash

# SMART DEPLOY - Deploy inteligente com validação automática
# Uso: ./smart-deploy.sh [opcional: mensagem do commit]

set -e  # Exit on error

echo "🚀 SMART DEPLOY - Pupilos da Lani"
echo "=================================="

# Config
COOLIFY_URL="http://31.97.42.252:8000"
API_TOKEN="12|OtZjXeiVJ6mLa4NXVcvxZzh6uixuB7wT9OVerIkub4f6552b"
APP_UUID="h106hf15xrjrcrhgfw0ahfx1"

# 1. Verificar mudanças
echo "📋 1. Verificando mudanças..."
if [ -z "$(git status --porcelain)" ]; then
  echo "✅ Nenhuma mudança para commit"
else
  echo "📝 Mudanças detectadas:"
  git status --short
  
  # Auto commit se mensagem fornecida
  if [ ! -z "$1" ]; then
    echo "💾 Auto-commit com mensagem: $1"
    git add .
    git commit -m "$1"
  else
    echo "⚠️  Execute: git add . && git commit -m 'sua mensagem'"
    echo "   Ou use: ./smart-deploy.sh 'mensagem do commit'"
    exit 1
  fi
fi

# 2. Validação local
echo ""
echo "🔍 2. Executando validação local..."
if node validate-deploy.js; then
  echo "✅ Validação passou!"
else
  echo "❌ Validação falhou - corrija os erros acima"
  exit 1
fi

# 3. Teste build local
echo ""
echo "🏗️ 3. Testando build local..."
if npm run build > /dev/null 2>&1; then
  echo "✅ Build local OK!"
else
  echo "❌ Build local falhou:"
  npm run build
  exit 1
fi

# 4. Push para GitHub
echo ""
echo "📤 4. Enviando para GitHub..."
git push origin main
echo "✅ Push completado!"

# 5. Aguardar e verificar webhook
echo ""
echo "⏱️ 5. Aguardando webhook automático (30s)..."
sleep 30

# Verificar se deploy iniciou automaticamente
CURRENT_COMMIT=$(curl -s "${COOLIFY_URL}/api/v1/applications/${APP_UUID}" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  | jq -r '.git_commit_sha // "unknown"')

LATEST_COMMIT=$(git rev-parse HEAD)

echo "📦 Commit Coolify: ${CURRENT_COMMIT:0:8}"
echo "📦 Commit GitHub:  ${LATEST_COMMIT:0:8}"

if [ "${CURRENT_COMMIT:0:8}" = "${LATEST_COMMIT:0:8}" ]; then
  echo "✅ Webhook funcionou - deploy automático OK!"
else
  echo "⚠️ Webhook falhou - executando deploy manual..."
  
  # 6. Force deploy se webhook falhou
  echo ""
  echo "🔧 6. Force deploy via API..."
  
  DEPLOY_RESPONSE=$(curl -s -X POST "${COOLIFY_URL}/api/v1/applications/${APP_UUID}/restart" \
    -H "Authorization: Bearer ${API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"force_rebuild": true}')
  
  if echo "$DEPLOY_RESPONSE" | grep -q '"message"'; then
    echo "✅ Deploy manual iniciado!"
  else
    echo "❌ Falha no deploy manual:"
    echo "$DEPLOY_RESPONSE"
    exit 1
  fi
fi

# 7. Monitorar progresso
echo ""
echo "📊 7. Monitorando progresso..."
echo "   (Ctrl+C para parar monitoramento)"

for i in {1..60}; do
  sleep 10
  
  STATUS=$(curl -s "${COOLIFY_URL}/api/v1/applications/${APP_UUID}" \
    -H "Authorization: Bearer ${API_TOKEN}" \
    | jq -r '.status // "unknown"')
  
  COMMIT=$(curl -s "${COOLIFY_URL}/api/v1/applications/${APP_UUID}" \
    -H "Authorization: Bearer ${API_TOKEN}" \
    | jq -r '.git_commit_sha // "unknown"')
  
  echo "[$i/60] Status: $STATUS | Commit: ${COMMIT:0:8}"
  
  if [ "$STATUS" = "running" ] && [ "${COMMIT:0:8}" = "${LATEST_COMMIT:0:8}" ]; then
    echo ""
    echo "🎉 DEPLOY COMPLETADO COM SUCESSO!"
    echo "🌐 Site: https://pupiloslani.com.br"
    echo "⚙️ Admin: https://pupiloslani.com.br/admin"
    exit 0
  elif [ "$STATUS" = "error" ]; then
    echo ""
    echo "❌ DEPLOY FALHOU!"
    echo "🔗 Verificar logs: ${COOLIFY_URL}/application/${APP_UUID}"
    exit 1
  fi
done

echo ""
echo "⏰ Timeout atingido - verificar status manualmente"
echo "🔗 Dashboard: ${COOLIFY_URL}/application/${APP_UUID}"