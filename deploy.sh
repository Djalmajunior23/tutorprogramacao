#!/bin/bash

echo "🚀 Iniciando deploy do Portal Multilíngue..."

# Verifica se o .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "Copie o .env.example para .env e preencha as variáveis antes de continuar."
    exit 1
fi

# Build e Up dos containers
echo "📦 Construindo e iniciando containers..."
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

# Sync do schema de produção e migrations
echo "🔄 Sincronizando banco de dados de produção..."
docker compose -f docker-compose.prod.yml exec backend sh -c "cp prisma/schema.prod.prisma prisma/schema.prisma && npx prisma generate && npx prisma migrate deploy"

# Sucesso
echo "✅ Deploy concluído com sucesso!"
echo "🌐 Frontend: https://${FRONTEND_DOMAIN:-portal.seudominio.com.br}"
echo "📡 API: https://${API_DOMAIN:-api.seudominio.com.br}/api/health"
