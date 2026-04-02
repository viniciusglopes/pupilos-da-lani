#!/bin/bash

# DEPLOY BACKUP - Força deploy quando webhook falha
# Uso: ./deploy-backup.sh

echo "🚀 INICIANDO DEPLOY BACKUP - Pupilos da Lani"

# Coolify API config
COOLIFY_URL="http://31.97.42.252:8000"
API_TOKEN="12|OtZjXeiVJ6mLa4NXVcvxZzh6uixuB7wT9OVerIkub4f6552b"
APP_UUID="h106hf15xrjrcrhgfw0ahfx1"  # UUID do projeto Pupilos

echo "📋 Verificando status atual..."

# Get current deployment info
CURRENT=$(curl -s "${COOLIFY_URL}/api/v1/applications/${APP_UUID}" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  | jq -r '.git_commit_sha // "unknown"')

echo "📦 Commit atual no Coolify: ${CURRENT}"

# Get latest GitHub commit
LATEST=$(git rev-parse HEAD)
echo "📦 Commit atual no GitHub: ${LATEST}"

if [ "$CURRENT" = "$LATEST" ]; then
  echo "✅ Deploy atualizado - nenhuma ação necessária"
  exit 0
fi

echo "🔄 Commits diferentes - iniciando force deploy..."

# Force restart/rebuild
DEPLOY_RESPONSE=$(curl -s -X POST "${COOLIFY_URL}/api/v1/applications/${APP_UUID}/restart" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"force_rebuild": true}')

if echo "$DEPLOY_RESPONSE" | grep -q "success"; then
  echo "✅ Deploy iniciado com sucesso!"
  echo "⏱️ Aguarde 5-10 minutos para completar"
  
  # Monitor deploy status
  echo "📊 Monitorando progresso..."
  for i in {1..30}; do
    sleep 10
    STATUS=$(curl -s "${COOLIFY_URL}/api/v1/applications/${APP_UUID}" \
      -H "Authorization: Bearer ${API_TOKEN}" \
      | jq -r '.status // "unknown"')
    
    echo "Status: ${STATUS} (${i}/30)"
    
    if [ "$STATUS" = "running" ]; then
      echo "🎉 Deploy completado com sucesso!"
      break
    elif [ "$STATUS" = "error" ]; then
      echo "❌ Deploy falhou - verificar logs no Coolify"
      break
    fi
  done
  
else
  echo "❌ Falha ao iniciar deploy:"
  echo "$DEPLOY_RESPONSE"
  exit 1
fi