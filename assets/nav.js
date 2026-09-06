import { supabase } from './supabase-client.js';

async function renderNav() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const { data: { session } } = await supabase.auth.getSession();
  const loggedIn = !!session;
  const path = location.pathname.split('/').pop() || 'index.html';
  const activeClass = (page) => path === page ? ' class="active"' : '';

  header.innerHTML = `
    <div class="nav-inner">
      <a class="brand" href="index.html">Cachimbo Radical</a>
      <nav>
        <a href="posts.html"${activeClass('posts.html')}>Posts</a>
        <a href="podcasts.html"${activeClass('podcasts.html')}>Podcasts</a>
        ${loggedIn
          ? `<a href="escrever.html" class="muted">Escrever</a><a href="#" id="logout-link" class="muted">Sair</a>`
          : `<a href="login.html" class="muted">Entrar</a>`}
      </nav>
    </div>`;
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await supabase.auth.signOut();
      window.location.href = 'index.html';
    });
  }
}

renderNav();
