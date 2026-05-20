# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copia arquivos de configuração de dependências
COPY package*.json ./
RUN npm install

# Copia o código fonte e configura variáveis de build
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Gera o build estático
RUN npm run build

# Stage 2: Servir com Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
