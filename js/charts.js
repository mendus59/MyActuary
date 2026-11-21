// Minimal dependency-free SVG line charts with a crosshair tooltip.
const NS = 'http://www.w3.org/2000/svg';

function el(name, attrs = {}, parent) {
  const n = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
}

function niceTicks(min, max, count = 5) {
  const span = max - min || 1;
  const step0 = span / count;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const err = step0 / mag;
  const step = (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1) * mag;
  const ticks = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) ticks.push(+v.toFixed(10));
  return ticks;
}

/**
 * series: [{ name, color (CSS var), values: [{x, y}] }]
 * opts: { yFormat, xFormat, logY, yMin, yMax, height, tipTitle }
 */
export function lineChart(container, series, opts = {}) {
  container.innerHTML = '';
  const W = 640;
  const H = opts.height || 300;
  const m = { t: 12, r: 16, b: 34, l: 52 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const xs = series[0].values.map((p) => p.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const allY = series.flatMap((s) => s.values.map((p) => p.y)).filter((y) => y > 0 || !opts.logY);
  let yMin = opts.yMin ?? Math.min(...allY);
  let yMax = opts.yMax ?? Math.max(...allY);
  const tf = opts.logY ? (v) => Math.log10(Math.max(v, 1e-6)) : (v) => v;
  if (opts.logY) { yMin = 10 ** Math.floor(Math.log10(yMin)); yMax = Math.min(1, 10 ** Math.ceil(Math.log10(yMax))); }
  const X = (x) => m.l + ((x - xMin) / (xMax - xMin || 1)) * iw;
  const Y = (y) => m.t + ih - ((tf(y) - tf(yMin)) / (tf(yMax) - tf(yMin) || 1)) * ih;

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img', 'aria-label': opts.ariaLabel || 'chart' });
  const yTicks = opts.logY
    ? Array.from({ length: Math.round(Math.log10(yMax / yMin)) + 1 }, (_, i) => yMin * 10 ** i)
    : niceTicks(yMin, yMax, 5);
  for (const t of yTicks) {
    el('line', { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t), class: 'gridline' }, svg);
    const tx = el('text', { x: m.l - 8, y: Y(t) + 4, 'text-anchor': 'end' }, svg);
    tx.textContent = opts.yFormat ? opts.yFormat(t) : t;
  }
  for (const t of niceTicks(xMin, xMax, 8)) {
    const tx = el('text', { x: X(t), y: H - m.b + 18, 'text-anchor': 'middle' }, svg);
    tx.textContent = opts.xFormat ? opts.xFormat(t) : t;
  }
  el('line', { x1: m.l, x2: W - m.r, y1: m.t + ih, y2: m.t + ih, class: 'axis' }, svg);
  if (opts.xLabel) {
    const tx = el('text', { x: m.l + iw / 2, y: H - 2, 'text-anchor': 'middle' }, svg);
    tx.textContent = opts.xLabel;
  }

  for (const s of series) {
    const d = s.values.filter((p) => !opts.logY || p.y > 0).map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
    el('path', { d, fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-dasharray': s.dash || '' }, svg);
  }

  // Hover layer
  const cross = el('line', { y1: m.t, y2: m.t + ih, class: 'crosshair', visibility: 'hidden' }, svg);
  const dots = series.map((s) => el('circle', { r: 4.5, fill: s.color, stroke: 'var(--surface)', 'stroke-width': 2, visibility: 'hidden' }, svg));
  const hit = el('rect', { x: m.l, y: m.t, width: iw, height: ih, fill: 'transparent' }, svg);
  const tip = document.getElementById('chart-tip');
  const move = (ev) => {
    const r = svg.getBoundingClientRect();
    const px = ((ev.clientX - r.left) / r.width) * W;
    const x = Math.round(xMin + ((px - m.l) / iw) * (xMax - xMin));
    if (x < xMin || x > xMax) return;
    cross.setAttribute('x1', X(x)); cross.setAttribute('x2', X(x)); cross.setAttribute('visibility', 'visible');
    const lines = [`<b>${opts.tipTitle ? opts.tipTitle(x) : x}</b>`];
    series.forEach((s, i) => {
      const p = s.values.find((v) => v.x === x);
      if (!p) { dots[i].setAttribute('visibility', 'hidden'); return; }
      dots[i].setAttribute('cx', X(p.x)); dots[i].setAttribute('cy', Y(Math.max(p.y, opts.logY ? yMin : -Infinity))); dots[i].setAttribute('visibility', 'visible');
      lines.push(`<span class="sw" style="background:${s.color}"></span>${s.name}: <b>${opts.yFormatTip ? opts.yFormatTip(p.y) : p.y}</b>`);
    });
    tip.innerHTML = lines.join('<br>');
    tip.hidden = false;
    const tw = tip.offsetWidth;
    const left = ev.clientX + 14 + tw > window.innerWidth ? ev.clientX - tw - 14 : ev.clientX + 14;
    tip.style.left = `${left}px`;
    tip.style.top = `${ev.clientY + 14}px`;
  };
  const leave = () => { tip.hidden = true; cross.setAttribute('visibility', 'hidden'); dots.forEach((d) => d.setAttribute('visibility', 'hidden')); };
  hit.addEventListener('pointermove', move);
  hit.addEventListener('pointerdown', move);
  hit.addEventListener('pointerleave', leave);
  container.appendChild(svg);
}

/** Diverging horizontal bars: items [{label, value (years), sub}] */
export function divergingBars(container, items) {
  container.innerHTML = '';
  const max = Math.max(0.5, ...items.map((i) => Math.abs(i.value)));
  const wrap = document.createElement('div');
  wrap.className = 'dbars';
  for (const it of items) {
    const row = document.createElement('div');
    row.className = 'dbar-row';
    const pct = (Math.abs(it.value) / max) * 50;
    const pos = it.value >= 0;
    row.innerHTML = `
      <div class="dbar-label"><span>${it.label}</span><small>${it.sub || ''}</small></div>
      <div class="dbar-track" aria-hidden="true">
        <span class="dbar-mid"></span>
        <span class="dbar-fill ${pos ? 'pos' : 'neg'}" style="${pos ? 'left:50%' : `left:${50 - pct}%`};width:${pct}%"></span>
      </div>
      <div class="dbar-val ${pos ? 'delta-pos' : 'delta-neg'}">${pos ? '+' : '−'}${Math.abs(it.value).toFixed(1)} yr</div>`;
    wrap.appendChild(row);
  }
  container.appendChild(wrap);
}
