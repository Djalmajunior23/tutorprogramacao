# Documentação Técnica - Portal Multilíngue

## Arquitetura
O sistema segue uma arquitetura full-stack monolítica simplificada para deploy rápido, utilizando o Express como servidor de API e middleware para servir o bundle do React (Vite) em produção.

## Fluxo de Autenticação
1. Cadastro via `/api/auth/register` (validação Zod).
2. Login via `/api/auth/login` retornando JWT e User Info.
3. Middleware `authenticateToken` valida as requisições subsequentes.
4. `authorizeRole` garante que apenas ADMIN ou TEACHER acessem áreas sensíveis.

## Modelo Pedagógico
O "Motor I.D.E.A" (Inteligência de Diagnóstico Educacional Adaptativo) é representado no frontend via `SkillMap` e no backend via `StudentSkillSet`. A cada desafio concluído, o score por conceito é atualizado, permitindo que o sistema recomende trilhas de recuperação ou aceleração.

## Banco de Dados (Neon)
Utilizamos o Prisma ORM com PostgreSQL. O schema é normalizado para suportar:
- Relacionamento M:N para alunos e turmas.
- Estrutura hierárquica de Trilhas -> Módulos -> Lições/Desafios.
- Cache de snapshots para rankings globais.
