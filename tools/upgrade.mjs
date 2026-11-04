// Mejora obras puntuales bajando una versión más grande de WikiArt, con CHEQUEO DE ASPECTO
// (no reemplaza si el aspecto difiere >12% → evita meter una imagen equivocada). Reemplaza
// in-place (mismo n, re-mide). Uso: node tools/upgrade.mjs [--apply]
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { imgSize, loadIndex, saveIndex, sleep, colPath } from './lib.mjs';

const APPLY = process.argv.includes('--apply');
const H = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36' };
const norm = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const STOP = new Set(['the', 'and', 'with', 'for', 'of', 'a', 'la', 'el', 'in', 'on']);

// objetivos: col, n, slug de artista WikiArt, keywords del título para matchear
const TARGETS = [
  { col: '03_gotico', n: 4, artist: 'giotto', t: 'lamentation' },
  { col: '06_macabro_memento_mori', n: 11, artist: 'hans-baldung', t: 'three ages woman' },
  { col: '08_impresionismo', n: 10, artist: 'claude-monet', t: 'rouen cathedral facade sunlight' },
  { col: '08_impresionismo', n: 34, artist: 'claude-monet', t: 'luncheon on the grass' },
  { col: '08_impresionismo', n: 42, artist: 'gustave-caillebotte', t: 'pont de l europe' },
  { col: '09_postimpresionismo', n: 4, artist: 'vincent-van-gogh', t: 'portrait of dr gachet' },
  { col: '01_mitologia_griega_romana', n: 22, artist: 'giulio-romano', t: 'fall of the giants' },
];

async function getText(u) { for (let i = 0; i < 3; i++) { try { const r = await fetch(u, { headers: H }); if (r.ok) return await r.text(); if (r.status === 404) return null; } catch {} await sleep(700); } return null; }
function ogBase(h) { if (!h) return null; const m = h.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i); if (!m) return null; let u = m[1]; if (!/^https?:/.test(u)) u = 'https://' + u.replace(/^\/\//, ''); return u.replace(/!.*$/, ''); }

const byCol = {};
for (const t of TARGETS) (byCol[t.col] = byCol[t.col] || []).push(t);

for (const col of Object.keys(byCol)) {
  const idx = await loadIndex(col);
  for (const tg of byCol[col]) {
    const it = idx.items.find(x => x.n === tg.n);
    if (!it) { console.log(`${col} #${tg.n}: no existe`); continue; }
    const curMax = Math.max(it.width, it.height), curAsp = it.width / it.height;
    // text-list del artista → mejor slug por keywords
    const list = await getText(`https://www.wikiart.org/en/${tg.artist}/all-works/text-list`); await sleep(300);
    const slugs = list ? [...new Set((list.match(new RegExp(`/en/${tg.artist}/[a-z0-9-]+`, 'g')) || []))] : [];
    const kw = norm(tg.t).split(' ').filter(w => w.length > 2 && !STOP.has(w));
    let best = null, bestScore = -1;
    for (const s of slugs) { const tail = s.replace(`/en/${tg.artist}/`, ''); const sc = kw.filter(w => tail.includes(w)).length - tail.length * 0.002; if (sc > bestScore) { bestScore = sc; best = s; } }
    const tail = best ? best.replace(`/en/${tg.artist}/`, '') : '';
    if (!best || !kw.every(w => tail.includes(w))) { console.log(`${col} #${tg.n} ${it.title}: sin match en WikiArt (${tg.artist})`); continue; }
    const base = ogBase(await getText('https://www.wikiart.org' + best)); await sleep(300);
    if (!base) { console.log(`${col} #${tg.n}: sin og:image`); continue; }
    const r = await fetch(base, { headers: H }); const buf = Buffer.from(await r.arrayBuffer()); const sz = imgSize(buf);
    if (!sz) { console.log(`${col} #${tg.n}: no mide`); continue; }
    const newMax = Math.max(sz.w, sz.h), newAsp = sz.w / sz.h;
    const aspOk = Math.abs(newAsp - curAsp) / curAsp < 0.12;
    const bigger = newMax > curMax * 1.15;
    const verdict = bigger && aspOk ? 'MEJORA' : !aspOk ? 'aspecto≠ (omito)' : 'no más grande';
    console.log(`${col} #${tg.n} ${it.title.slice(0, 26).padEnd(27)} ${it.width}x${it.height} -> ${sz.w}x${sz.h} (${best.split('/').pop().slice(0, 24)}) ${verdict}`);
    if (APPLY && bigger && aspOk) {
      await fs.writeFile(path.join(colPath(col), it.orientation, it.file), buf);
      it.width = sz.w; it.height = sz.h; it.bytes = buf.length; it.image_url = base; it.image_quality = newMax >= 2400 ? 'alta' : 'media';
    }
    await sleep(400);
  }
  if (APPLY) await saveIndex(col, idx);
}
console.log(`\n${APPLY ? 'APLICADO' : 'DRY'}.`);
