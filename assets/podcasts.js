import { supabase } from './supabase-client.js';
import { formatDate, esc, isRecent } from './format.js';

const listEl = document.getElementById('podcasts-list');

function newTag(iso) {
  return isRecent(iso) ? '<span class="tag-new">Novo</span>' : '';
}

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function attachPlayer(article, audioUrl) {
  const btn = article.querySelector('.play-btn');
  const bar = article.querySelector('.progress-bar');
  const fill = article.querySelector('.progress-fill');
  const time = article.querySelector('.time-label');
  const audio = new Audio(audioUrl);
  audio.preload = 'none';

  btn.addEventListener('click', () => {
    if (audio.paused) {
      document.dispatchEvent(new CustomEvent('cr-audio-play', { detail: audio }));
      audio.play();
      btn.textContent = '❚❚';
    } else {
      audio.pause();
      btn.textContent = '▶';
    }
  });

  document.addEventListener('cr-audio-play', (e) => {
    if (e.detail !== audio && !audio.paused) {
      audio.pause();
      btn.textContent = '▶';
    }
  });

  audio.addEventListener('timeupdate', () => {
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    fill.style.width = pct + '%';
    time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  });
  audio.addEventListener('loadedmetadata', () => {
    time.textContent = `${formatTime(0)} / ${formatTime(audio.duration)}`;
  });
  audio.addEventListener('ended', () => {
    btn.textContent = '▶';
    fill.style.width = '0%';
  });

  bar.addEventListener('click', (e) => {
    const rect = bar.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    if (audio.duration) audio.currentTime = pct * audio.duration;
  });
}

async function load() {
  const { data: episodes, error } = await supabase
    .from('podcasts')
    .select('id,title,slug,description,audio_url,created_at,sections(name)')
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

  listEl.innerHTML = episodes.map((ep, i) => `
    <article class="podcast-item" id="${esc(ep.slug)}" data-audio="${esc(ep.audio_url)}">
      <div class="ep-number">${String(episodes.length - i).padStart(2, '0')}</div>
      <div class="podcast-item-body">
        <div class="item-meta">${esc(ep.sections?.name ?? 'Podcast')} · ${formatDate(ep.created_at)}${newTag(ep.created_at)}</div>
        <h2>${esc(ep.title)}</h2>
        ${ep.description ? `<p class="excerpt">${esc(ep.description)}</p>` : ''}
        <div class="player">
          <button type="button" class="play-btn" aria-label="Reproduzir episódio">▶</button>
          <div class="progress-bar"><div class="progress-fill"></div></div>
          <span class="time-label">0:00 / 0:00</span>
        </div>
      </div>
    </article>`).join('');

  listEl.querySelectorAll('.podcast-item').forEach(article => {
    attachPlayer(article, article.dataset.audio);
  });
}

load();
