# Cachimbo Radical

Site estático (HTML/CSS/JS puro, sem build) com posts organizados por secção e um podcast, hospedado gratuitamente no GitHub Pages. Os dados (posts, secções, episódios) e a autenticação vivem no Supabase (plano gratuito).

## Como funciona

- **Leitura pública**: qualquer visitante pode ver os posts e ouvir o podcast, sem login.
- **Escrever**: só quem tiver conta criada no Supabase consegue entrar em `login.html` e publicar em `escrever.html`. Não há registo público — as contas são criadas manualmente no painel do Supabase (Authentication → Users → Add user).
- **Secções**: ao publicar um post ou episódio, escolhe-se uma secção existente ou cria-se uma nova na hora.

## Configuração (feita uma vez)

1. Correr o SQL em `supabase-schema.sql` no SQL Editor do projeto Supabase.
2. Authentication → Providers → Email → desligar "Allow new users to sign up".
3. Authentication → Users → criar uma conta para cada pessoa que vai escrever.
4. Settings → Pages → Deploy from branch `main` / `/ (root)`.

## Estrutura

- `index.html`, `posts.html`, `post.html`, `podcasts.html` — páginas públicas.
- `login.html`, `escrever.html` — área reservada a quem escreve.
- `assets/` — estilos e lógica (liga-se ao Supabase via `assets/supabase-config.js`).
