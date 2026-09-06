import { supabase } from './supabase-client.js';
import { formatDate, excerpt, esc, isRecent } from './format.js';

const postsEl = document.getElementById('home-posts');
const podcastsEl = document.getElementById('home-podcasts');

function newTag(iso) {
  return isRecent(iso) ? '<span class="tag-new">Novo</span>' : '';
}

function postCard(p, featured) {
  const meta = `${esc(p.section_name || 'Post')} · ${formatDate(p.created_at)}${newTag(p.created_at)}`;
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
    </article>`;
}

function podcastCard(ep, number) {
  return `
    <article class="podcast-card">
      <div class="ep-number">${String(number).padStart(2, '0')}</div>
      <div class="podcast-card-body">
        <div class="item-meta">${esc(ep.section_name || 'Podcast')} · ${formatDate(ep.created_at)}${newTag(ep.created_at)}</div>
        <h3><a href="podcasts.html#${esc(ep.slug)}">${esc(ep.title)}</a></h3>
        ${ep.description ? `<p class="excerpt">${esc(excerpt(ep.description, 140))}</p>` : ''}
      </div>
    </article>`;
}

async function load() {
  const [{ data: posts, error: e1 }, { data: podcasts, error: e2 }] = await Promise.all([
    supabase.from('posts')
      .select('id,title,slug,content,created_at,sections(name)')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(4),
    supabase.from('podcasts')
      .select('id,title,slug,description,created_at,sections(name)')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  if (e1 || e2) {
    postsEl.innerHTML = '<p class="msg error">Não foi possível carregar os conteúdos.</p>';
    return;
  }

  const postList = (posts || []).map(p => ({ ...p, section_name: p.sections?.name }));
  const podcastList = (podcasts || []).map(p => ({ ...p, section_name: p.sections?.name }));

  postsEl.innerHTML = postList.length
    ? `${postCard(postList[0], true)}${postList.length > 1 ? `<div class="post-row-list">${postList.slice(1).map(p => postCard(p, false)).join('')}</div>` : ''}`
    : '<p class="empty-state">Ainda não há posts publicados.</p>';

  podcastsEl.innerHTML = podcastList.length
    ? `<div class="podcast-list">${podcastList.map((ep, i) => podcastCard(ep, podcastList.length - i)).join('')}</div>`
    : '<p class="empty-state">Ainda não há episódios publicados.</p>';
}

load();
