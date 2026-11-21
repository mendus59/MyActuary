import { CITATIONS } from './citations.js';

export const fmt = {
  pct(p) {
    if (p >= 0.995 && p < 1) return '>99%';
    if (p > 0 && p < 0.005) return '<1%';
    return `${Math.round(p * 100)}%`;
  },
  q(q) { return q >= 1 ? '1.00000' : q.toFixed(5); },
  int(n) { return Math.round(n).toLocaleString('en-US'); },
};

export function citeShort(id) {
  return CITATIONS[id] ? CITATIONS[id].short : id;
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
