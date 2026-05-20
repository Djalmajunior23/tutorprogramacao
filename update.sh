#!/bin/bash

echo "🔄 Atualizando sistema..."

# Puxa as últimas alterações do Git (opcional, dependendo do fluxo)
# git pull origin main

# Rebuild e Restart
echo "📦 Rebuildando containers..."
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

# Sync do Prisma
echo "🔄 Sincronizando banco de dados..."
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Limpeza de imagens antigas
echo "🧹 Limpando imagens órfãs..."
docker image prune -f

echo "✅ Atualização concluída!"
