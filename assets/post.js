import { supabase } from './supabase-client.js';
import { formatDate, esc, readingTime } from './format.js';
import { renderMarkdown } from './markdown.js';

const slug = new URLSearchParams(location.search).get('slug');
const container = document.getElementById('post-container');

async function load() {
  if (!slug) {
    container.innerHTML = '<p class="msg error">Post não encontrado.</p>';
    return;
  }
  const { data: post, error } = await supabase
    .from('posts')
    .select('title,content,created_at,sections(name,slug)')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !post) {
    container.innerHTML = '<p class="msg error">Post não encontrado.</p>';
    return;
  }

  document.title = `${post.title} — Cachimbo Radical`;
  container.innerHTML = `
    <article class="article">
      <p class="kicker"><a href="posts.html?seccao=${encodeURIComponent(post.sections?.slug ?? '')}">${esc(post.sections?.name ?? '')}</a></p>
      <h1>${esc(post.title)}</h1>
      <div class="item-meta">${formatDate(post.created_at)} · ${readingTime(post.content)} min de leitura</div>
      <hr class="rule">
      <div class="post-content">${renderMarkdown(post.content)}</div>
    </article>
    <p class="back-link"><a href="posts.html">← Voltar aos posts</a></p>`;
}

load();
