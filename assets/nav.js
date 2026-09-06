import { supabase } from './supabase-client.js';

async function renderNav() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const { data: { session } } = await supabase.auth.getSession();
  const loggedIn = !!session;

  const marquee = document.createElement('div');
  marquee.className = 'marquee-bar';
  marquee.innerHTML = '<marquee>★ BEM-VINDO AO CACHIMBO RADICAL ★ MELHOR VISUALIZADO A 1024x768 ★ IDEIAS, CONVERSAS E OUTRAS HERESIAS ★</marquee>';
  header.parentNode.insertBefore(marquee, header);

  header.innerHTML = `
    <div class="nav-inner">
      <a class="brand" href="index.html">Cachimbo Radical</a>
      <nav>
        <a href="posts.html">Posts</a>
        <a href="podcasts.html">Podcast</a>
        ${loggedIn
          ? `<a href="escrever.html">Escrever</a><a href="#" id="logout-link">Sair</a>`
          : `<a href="login.html">Entrar</a>`}
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
