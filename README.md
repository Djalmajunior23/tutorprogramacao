# Portal Interativo de Programação — Prof. Djalma

Portal educacional gamificado para ensino de lógica de programação, focado em alunos iniciantes.

## 🚀 Tecnologias
- **React 19** + **Vite**
- **TypeScript**
- **Tailwind CSS** (Estilização Moderna)
- **Framer Motion** (Animações)
- **Lucide React** (Ícones)
- **LocalStorage** (Persistência de Dados)

## 📁 Estrutura de Pastas
- `src/components`: Componentes da interface (Dashboard, Laboratório, Desafios, etc).
- `src/data`: Conteúdo didático, desafios e avisos.
- `src/hooks`: Lógica de estado e persistência.
- `src/lib`: Interpretador de pseudolinguagem básico.
- `src/types`: Interfaces TypeScript.

## 🛠️ Como Executar Localmente
1. Instale as dependências: `npm install`
2. Inicie o servidor: `npm run dev`
3. Acesse `http://localhost:3000`

## 📦 Publicação

### GitHub Pages
1. Crie um repositório no GitHub.
2. Execute o build: `npm run build`.
3. Faça o push do conteúdo da pasta `dist` para a branch `gh-pages` ou configure o GitHub Actions.

### HostGator / cPanel
1. Execute `npm run build`.
2. Envie o conteúdo de `dist/` para a pasta `public_html/`.

## ✍️ Autor
**Prof. Djalma Batista Barbosa Junior**
Explorando o futuro da educação técnica com tecnologia.
