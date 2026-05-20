# Portal Multilíngue de Programação (Production Guide)

Este guia descreve como realizar o deploy do portal em uma VPS (Ubuntu/Debian) utilizando Docker, Traefik e Let's Encrypt para HTTPS automático.

## 🏗️ Arquitetura de Produção
- **Frontend**: React (Vite) servido por Nginx em container Docker (`portal.seudominio.com.br`).
- **Backend**: Node.js (Express) com Prisma em container Docker (`api.seudominio.com.br`).
- **Proxy**: Traefik com renovação automática de SSL via Let's Encrypt.
- **Banco de Dados**: PostgreSQL gerenciado pelo **Neon.tech**.

## 🚀 Requisitos da VPS
1. **Docker** e **Docker Compose** instalados.
2. Portas **80** e **443** liberadas no firewall.
3. Dois registros **A** no seu DNS:
   - `portal` -> IP_DA_VPS
   - `api` -> IP_DA_VPS

## 🛠️ Passo a Passo de Instalação

### 1. Preparação
Clone o repositório na sua VPS e entre na pasta:
```bash
git clone <URL_DO_EXTERNO> portal-multilingue
cd portal-multilingue
```

### 2. Configurar Variáveis de Ambiente
Copie o exemplo e edite com seus dados reais:
```bash
cp .env.example .env
nano .env
```
> **Nota**: Certifique-se de que a `DATABASE_URL` seja a do Neon (Prisma/Node.js) e comece com `postgresql://`.

### 3. Executar o Deploy
Dê permissão de execução aos scripts e inicie o sistema:
```bash
chmod +x deploy.sh update.sh
./deploy.sh
```

## 📡 Endpoints Úteis
- **Frontend**: `https://portal.seudominio.com.br`
- **Health Check API**: `https://api.seudominio.com.br/api/health`
- **Dashboard Traefik**: Acessível internamente (configuração adicional necessária para acesso externo seguro).

## 🔄 Manutenção e Logs

### Ver logs em tempo real:
```bash
# Todos os logs
docker compose -f docker-compose.prod.yml logs -f

# Apenas o Backend
docker compose -f docker-compose.prod.yml logs -f backend
```

### Atualizar o sistema:
Após fazer o `git pull` com novas alterações, rode:
```bash
./update.sh
```

### Reiniciar serviços:
```bash
docker compose -f docker-compose.prod.yml restart
```

## 👥 Usuários de Teste (Pós-Seed)

| Perfil | E-mail | Senha |
| :--- | :--- | :--- |
| **Admin** | admin@portal.com | Admin@123 |
| **Professor** | professor@portal.com | Professor@123 |
| **Aluno** | aluno@portal.com | Aluno@123 |

## 🌟 Solução de Problemas
- **Erro de SSL**: Aguarde alguns minutos para o Traefik completar o desafio HTTP (Let's Encrypt). Verifique se as portas 80/443 estão abertas.
- **Erro de Banco**: Verifique se incluiu `?sslmode=require` na sua string de conexão do Neon.
- **Erro de CORS**: Verifique se a variável `CORS_ORIGIN` no seu `.env` corresponde exatamente à URL do seu frontend em HTTPS.

---
*Desenvolvido com foco na excelência pedagógica e precisão técnica.*
