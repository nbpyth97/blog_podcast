import { supabase } from './supabase-client.js';
import { formatDate, esc } from './format.js';
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
    <div class="item-meta"><a href="posts.html?seccao=${encodeURIComponent(post.sections?.slug ?? '')}">${esc(post.sections?.name ?? '')}</a> · ${formatDate(post.created_at)}</div>
    <h1>${esc(post.title)}</h1>
    <hr class="rainbow-hr">
    <div class="post-content">${renderMarkdown(post.content)}</div>
    <p><a href="posts.html">← Voltar aos posts</a></p>`;
}

load();
