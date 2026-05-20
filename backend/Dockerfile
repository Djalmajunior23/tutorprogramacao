FROM node:20-alpine

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia o código e a pasta do Prisma
COPY . .

# Usa o schema de produção para PostgreSQL
RUN cp prisma/schema.prod.prisma prisma/schema.prisma
RUN npx prisma generate

# Build do servidor (opcional se usar node direto no server.ts, mas recomendado bundle)
# Aqui assumimos que o server rodará via o comando start configurado no package.json
EXPOSE 3001

ENV NODE_ENV=production

CMD ["npm", "start"]
