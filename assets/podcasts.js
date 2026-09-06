import { supabase } from './supabase-client.js';
import { formatDate, esc, pseudoId, pseudoNo } from './format.js';

const listEl = document.getElementById('podcasts-list');

async function load() {
  const { data: episodes, error } = await supabase
    .from('podcasts')
    .select('id,title,slug,description,audio_url,created_at,sections(name,slug)')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    listEl.innerHTML = '<p class="msg error">Não foi possível carregar os episódios.</p>';
    return;
  }
  if (!episodes.length) {
    listEl.innerHTML = '<p class="empty-state">Ainda não há episódios publicados.</p>';
    return;
  }

  listEl.innerHTML = episodes.map(ep => `
    <article class="item" id="${esc(ep.slug)}">
      <div class="item-meta">
        <span class="board-tag">/${esc(ep.sections?.slug ?? 'podcast')}/</span> ·
        Anónimo <span class="post-no">ID:${pseudoId(ep.slug)} No.${pseudoNo(ep.slug)}</span> ·
        ${formatDate(ep.created_at)}
      </div>
      <h2>${esc(ep.title)}</h2>
      ${ep.description ? `<p class="excerpt">${esc(ep.description)}</p>` : ''}
      <audio controls preload="none" src="${ep.audio_url}"></audio>
    </article>`).join('');
}

load();
