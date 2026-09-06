import { supabase } from './supabase-client.js';
import { formatDate, excerpt, esc, isRecent } from './format.js';

const list = document.getElementById('latest-list');

function itemHtml(item) {
  const href = item.kind === 'post' ? `post.html?slug=${item.slug}` : `podcasts.html#${item.slug}`;
  const label = item.kind === 'post' ? (item.section_name || 'Post') : 'Podcast';
  return `
    <article class="item bevel">
      <div class="item-meta">${esc(label)} · ${formatDate(item.created_at)}${isRecent(item.created_at) ? '<span class="badge-new">NOVO!</span>' : ''}</div>
      <h2><a href="${href}">${esc(item.title)}</a></h2>
      <p class="excerpt">${esc(excerpt(item.description ?? item.content))}</p>
    </article>`;
}

async function load() {
  const [{ data: posts, error: e1 }, { data: podcasts, error: e2 }] = await Promise.all([
    supabase.from('posts')
      .select('id,title,slug,content,created_at,sections(name)')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('podcasts')
      .select('id,title,slug,description,created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  if (e1 || e2) {
    list.innerHTML = '<p class="msg error">Não foi possível carregar os conteúdos.</p>';
    return;
  }

  const merged = [
    ...(posts || []).map(p => ({ kind: 'post', ...p, section_name: p.sections?.name })),
    ...(podcasts || []).map(p => ({ kind: 'podcast', ...p })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);

  list.innerHTML = merged.length
    ? merged.map(itemHtml).join('')
    : '<p class="empty-state">Ainda não há nada publicado.</p>';
}

load();
