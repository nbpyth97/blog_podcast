import { supabase } from './supabase-client.js';
import { slugify, shortId, formatDate, esc } from './format.js';

let session = null;

async function guard() {
  const { data } = await supabase.auth.getSession();
  session = data.session;
  if (!session) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ['post', 'podcast', 'gerir'].forEach(name => {
      document.getElementById(`tab-${name}`).style.display = name === btn.dataset.tab ? '' : 'none';
    });
    if (btn.dataset.tab === 'gerir') loadManage();
  });
});

async function loadSections(kind, selectEl, placeholder) {
  const { data } = await supabase.from('sections').select('id,name,slug').eq('kind', kind).order('name');
  const options = (data || []).map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
  selectEl.innerHTML = (placeholder ? `<option value="">${esc(placeholder)}</option>` : '') + options;
}

function wireNewSectionToggle(toggleId, wrapId, selectEl) {
  const toggle = document.getElementById(toggleId);
  const wrap = document.getElementById(wrapId);
  toggle.addEventListener('click', () => {
    const showing = wrap.style.display !== 'none';
    wrap.style.display = showing ? 'none' : '';
    toggle.textContent = showing ? '+ criar nova secção' : '– usar secção existente';
    selectEl.disabled = !showing;
  });
}

async function ensureSection(kind, selectEl, newInput) {
  const newName = newInput.value.trim();
  if (newName) {
    const slug = slugify(newName);
    const { data: existing } = await supabase.from('sections').select('id').eq('kind', kind).eq('slug', slug).maybeSingle();
    if (existing) return existing.id;
    const { data: created, error } = await supabase.from('sections').insert({ kind, name: newName, slug }).select('id').single();
    if (error) throw error;
    return created.id;
  }
  return selectEl.value || null;
}

const postSectionSelect = document.getElementById('post-section-select');
const postNewSectionInput = document.getElementById('post-new-section');
wireNewSectionToggle('post-toggle-new-section', 'post-new-section-wrap', postSectionSelect);

document.getElementById('post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('post-msg');
  msg.innerHTML = '';
  const form = e.target;
  try {
    const sectionId = await ensureSection('post', postSectionSelect, postNewSectionInput);
    if (!sectionId) throw new Error('Escolhe ou cria uma secção.');
    const title = form.title.value.trim();
    const slug = `${slugify(title)}-${shortId()}`;
    const { error } = await supabase.from('posts').insert({
      section_id: sectionId,
      title,
      slug,
      content: form.content.value,
      author_email: session.user.email,
    });
    if (error) throw error;
    msg.innerHTML = '<p class="msg success">Post publicado.</p>';
    form.reset();
    await loadSections('post', postSectionSelect);
  } catch (err) {
    msg.innerHTML = `<p class="msg error">${esc(err.message || 'Erro ao publicar.')}</p>`;
  }
});

const podcastSectionSelect = document.getElementById('podcast-section-select');
const podcastNewSectionInput = document.getElementById('podcast-new-section');
wireNewSectionToggle('podcast-toggle-new-section', 'podcast-new-section-wrap', podcastSectionSelect);

document.getElementById('podcast-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('podcast-msg');
  msg.innerHTML = '';
  const form = e.target;
  const submitBtn = form.querySelector('button');
  submitBtn.disabled = true;
  try {
    const sectionId = await ensureSection('podcast', podcastSectionSelect, podcastNewSectionInput);
    const title = form.title.value.trim();
    const slug = `${slugify(title)}-${shortId()}`;
    const file = form.audio.files[0];
    if (!file) throw new Error('Escolhe um ficheiro de áudio.');
    const path = `${slug}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('audio').upload(path, file);
    if (uploadError) throw uploadError;
    const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(path);
    const { error } = await supabase.from('podcasts').insert({
      section_id: sectionId || null,
      title,
      slug,
      description: form.description.value.trim() || null,
      audio_url: publicUrlData.publicUrl,
      author_email: session.user.email,
    });
    if (error) throw error;
    msg.innerHTML = '<p class="msg success">Episódio publicado.</p>';
    form.reset();
    await loadSections('podcast', podcastSectionSelect, 'Sem secção');
  } catch (err) {
    msg.innerHTML = `<p class="msg error">${esc(err.message || 'Erro ao publicar.')}</p>`;
  } finally {
    submitBtn.disabled = false;
  }
});

async function loadManage() {
  const postsWrap = document.getElementById('manage-posts');
  const podcastsWrap = document.getElementById('manage-podcasts');
  const { data: posts } = await supabase.from('posts').select('id,title,created_at').order('created_at', { ascending: false });
  const { data: podcasts } = await supabase.from('podcasts').select('id,title,created_at').order('created_at', { ascending: false });

  postsWrap.innerHTML = (posts && posts.length) ? posts.map(p => `
    <div class="author-list-item">
      <span>${esc(p.title)} <span class="item-meta">· ${formatDate(p.created_at)}</span></span>
      <button class="danger" data-type="posts" data-id="${p.id}">Apagar</button>
    </div>`).join('') : '<p class="empty-state">Sem posts.</p>';

  podcastsWrap.innerHTML = (podcasts && podcasts.length) ? podcasts.map(p => `
    <div class="author-list-item">
      <span>${esc(p.title)} <span class="item-meta">· ${formatDate(p.created_at)}</span></span>
      <button class="danger" data-type="podcasts" data-id="${p.id}">Apagar</button>
    </div>`).join('') : '<p class="empty-state">Sem episódios.</p>';

  document.querySelectorAll('#tab-gerir button.danger').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('De certeza que queres apagar?')) return;
      await supabase.from(btn.dataset.type).delete().eq('id', btn.dataset.id);
      loadManage();
    });
  });
}

document.getElementById('logout-link-2').addEventListener('click', async (e) => {
  e.preventDefault();
  await supabase.auth.signOut();
  window.location.href = 'index.html';
});

(async () => {
  if (!(await guard())) return;
  await loadSections('post', postSectionSelect);
  await loadSections('podcast', podcastSectionSelect, 'Sem secção');
})();
