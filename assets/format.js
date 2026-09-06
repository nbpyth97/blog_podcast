export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function excerpt(text, len = 180) {
  const plain = (text || '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#>*_`~]/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > len ? plain.slice(0, len).trim() + '…' : plain;
}

export function slugify(str) {
  return (str || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function shortId() {
  return Math.random().toString(36).slice(2, 8);
}

export function esc(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

export function isRecent(iso, days = 3) {
  const ageMs = Date.now() - new Date(iso).getTime();
  return ageMs < days * 24 * 60 * 60 * 1000;
}

export function readingTime(text, wpm = 200) {
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wpm));
}
