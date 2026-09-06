import { marked } from 'https://esm.sh/marked@11';

marked.setOptions({ breaks: true });

export function renderMarkdown(text) {
  return marked.parse(text || '');
}
