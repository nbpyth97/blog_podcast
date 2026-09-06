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

export function pseudoId(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, '0').slice(0, 8);
}

export function pseudoNo(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) {
    h = (h * 131 + str.charCodeAt(i)) >>> 0;
  }
  return (h % 900000 + 100000).toString();
}
