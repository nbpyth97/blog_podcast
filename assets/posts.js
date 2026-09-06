import { supabase } from './supabase-client.js';
import { formatDate, excerpt, esc, pseudoId, pseudoNo } from './format.js';

const params = new URLSearchParams(location.search);
const activeSlug = params.get('seccao') || null;

const filtersEl = document.getElementById('section-filters');
const listEl = document.getElementById('posts-list');

function renderFilters(sections) {
  const chips = [`<a class="chip ${!activeSlug ? 'active' : ''}" href="posts.html">/todas/</a>`]
    .concat(sections.map(s => `<a class="chip ${activeSlug === s.slug ? 'active' : ''}" href="posts.html?seccao=${encodeURIComponent(s.slug)}">/${esc(s.slug)}/ ${esc(s.name)}</a>`));
  filtersEl.innerHTML = chips.join('');
}

function renderPosts(posts) {
  if (!posts.length) {
    listEl.innerHTML = '<p class="empty-state">Ainda não há posts nesta secção.</p>';
    return;
  }
  listEl.innerHTML = posts.map(p => `
    <article class="item">
      <div class="item-meta">
        <span class="board-tag">/${esc(p.sections?.slug ?? '')}/</span> ·
        Anónimo <span class="post-no">ID:${pseudoId(p.slug)} No.${pseudoNo(p.slug)}</span> ·
        ${formatDate(p.created_at)}
      </div>
      <h2><a href="post.html?slug=${encodeURIComponent(p.slug)}">${esc(p.title)}</a></h2>
      <p class="excerpt">${esc(excerpt(p.content))}</p>
    </article>`).join('');
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
