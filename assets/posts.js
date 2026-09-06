import { supabase } from './supabase-client.js';
import { formatDate, excerpt, esc, isRecent } from './format.js';

const params = new URLSearchParams(location.search);
const activeSlug = params.get('seccao') || null;

const filtersEl = document.getElementById('section-filters');
const listEl = document.getElementById('posts-list');

function renderFilters(sections) {
  const chips = [`<a class="chip ${!activeSlug ? 'active' : ''}" href="posts.html">Todos</a>`]
    .concat(sections.map(s => `<a class="chip ${activeSlug === s.slug ? 'active' : ''}" href="posts.html?seccao=${encodeURIComponent(s.slug)}">${esc(s.name)}</a>`));
  filtersEl.innerHTML = chips.join('');
}

function newTag(iso) {
  return isRecent(iso) ? '<span class="tag-new">Novo</span>' : '';
}

function postCard(p, featured) {
  const meta = `${esc(p.sections?.name ?? '')} · ${formatDate(p.created_at)}${newTag(p.created_at)}`;
  if (featured) {
    return `
      <article class="post-feature">
        <div class="item-meta">${meta}</div>
        <h2><a href="post.html?slug=${encodeURIComponent(p.slug)}">${esc(p.title)}</a></h2>
        <p class="excerpt">${esc(excerpt(p.content, 260))}</p>
        <a class="read-more" href="post.html?slug=${encodeURIComponent(p.slug)}">Continuar a ler →</a>
      </article>`;
  }
  return `
    <article class="post-row">
      <div class="item-meta">${meta}</div>
      <h3><a href="post.html?slug=${encodeURIComponent(p.slug)}">${esc(p.title)}</a></h3>
      <p class="excerpt">${esc(excerpt(p.content, 150))}</p>
    </article>`;
}

function renderPosts(posts) {
  if (!posts.length) {
    listEl.innerHTML = '<p class="empty-state">Ainda não há posts nesta secção.</p>';
    return;
  }
  listEl.innerHTML = `
    ${postCard(posts[0], true)}
    ${posts.length > 1 ? `<div class="post-row-list">${posts.slice(1).map(p => postCard(p, false)).join('')}</div>` : ''}`;
}

async function load() {
  const { data: sections } = await supabase.from('sections').select('id,name,slug').eq('kind', 'post').order('name');
  renderFilters(sections || []);

  let query = supabase.from('posts')
    .select('id,title,slug,content,created_at,sections(name,slug)')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (activeSlug) {
    const section = (sections || []).find(s => s.slug === activeSlug);
    if (section) query = query.eq('section_id', section.id);
  }

  const { data: posts, error } = await query;
  if (error) {
    listEl.innerHTML = '<p class="msg error">Não foi possível carregar os posts.</p>';
    return;
  }
  renderPosts(posts || []);
}

load();
