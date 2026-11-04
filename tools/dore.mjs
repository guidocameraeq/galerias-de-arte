// Descarga los grabados de Gustave Doré para la Divina Comedia (Commons), full-res.
// Camina categorías por canto, filtra basura, DEDUPE VISUAL (average-hash de thumbs).
// Hasheo y descarga EN PARALELO + timeout por request. Uso: node tools/dore.mjs [--apply]
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { imgSize, orientationOf, buildFilename, loadIndex, saveIndex } from './lib.mjs';
import sharp from 'sharp';

const APPLY = process.argv.includes('--apply');
const COL = '17_dore_divina_comedia';
const UA = 'Arte-PD-Collection/1.0 (+https://github.com/guidocameraeq/galerias-de-arte)';
const C = 'https://commons.wikimedia.org/w/api.php';
const enc = encodeURIComponent;
const MINLONG = 2400;
const JUNK = /colou?r|couleur|coloriz|\bpage\b|\bcover\b|portada|frontispiece|\bmap\b|\bmapa\b|photo|fotog|\btomb\b|statue|estatua|monument|building|manuscript|carte|titre|title page|\bgrave\b|\bbust\b|dscf?\d|\bimg[ _]?\d|\bdsc\b|\bp\d{6,}|scan\d|detail|cropped|recadr/i;

// fetch con timeout (evita cuelgues)
async function fetchT(u, opt = {}, ms = 15000) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms);
  try { return await fetch(u, { ...opt, signal: ac.signal, headers: { 'User-Agent': UA, ...(opt.headers || {}) } }); }
  finally { clearTimeout(t); }
}
async function jget(u) { for (let i = 0; i < 3; i++) { try { const r = await fetchT(u); if (r.ok) return await r.json(); } catch {} } return {}; }
// pool de concurrencia
async function pool(items, n, fn) {
  const out = new Array(items.length); let idx = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (idx < items.length) { const i = idx++; try { out[i] = await fn(items[i], i); } catch { out[i] = null; } }
  }));
  return out;
}
async function members(cat, type) { const j = await jget(`${C}?action=query&format=json&cmlimit=500&cmtype=${type}&list=categorymembers&cmtitle=Category:${enc(cat)}`); return (j.query?.categorymembers || []).map(x => x.title); }
async function sizes(titles) {
  const out = {};
  const chunks = []; for (let i = 0; i < titles.length; i += 50) chunks.push(titles.slice(i, i + 50));
  const res = await pool(chunks, 5, async (ch) => jget(`${C}?action=query&format=json&prop=imageinfo&iiprop=size|mime|url&titles=${enc(ch.join('|'))}`));
  for (const j of res) for (const p of Object.values(j?.query?.pages || {})) { const ii = p.imageinfo?.[0]; if (ii) out[p.title] = ii; }
  return out;
}
async function aHash(file) {
  for (let a = 0; a < 3; a++) {
    try {
      const j = await jget(`${C}?action=query&format=json&prop=imageinfo&iiprop=url&iiurlwidth=80&titles=${enc(file)}`);
      const turl = Object.values(j.query?.pages || {})[0]?.imageinfo?.[0]?.thumburl; if (!turl) return null;
      const buf = Buffer.from(await (await fetchT(turl)).arrayBuffer());
      const px = await sharp(buf).grayscale().resize(8, 8, { fit: 'fill' }).raw().toBuffer();
      const avg = px.reduce((x, y) => x + y, 0) / px.length;
      let h = ''; for (const p of px) h += p > avg ? '1' : '0'; return h;
    } catch {}
  }
  return null;
}
const ham = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d; };

// 1) juntar archivos
const roots = ['Gustave Doré - Inferno', 'Gustave Doré - Purgatorio', 'Gustave Doré - Paradiso'];
let files = new Set(); const canticaOf = {};
for (const root of roots) {
  const cantica = root.split(' - ')[1];
  const subs = [root, ...(await members(root, 'subcat')).map(s => s.replace(/^Category:/, ''))];
  const fl = await pool(subs, 6, s => members(s, 'file'));
  for (const arr of fl) for (const f of (arr || [])) { files.add(f); canticaOf[f] = cantica; }
}
files = [...files].filter(f => !JUNK.test(f));
console.log(`Archivos candidatos (sin basura): ${files.length}. Midiendo...`);
const sz = await sizes(files);

// 2) candidatos ≥MINLONG, hashear EN PARALELO, dedupe visual
const cands = files.filter(f => sz[f] && Math.max(sz[f].width, sz[f].height) >= MINLONG)
  .map(f => ({ f, ii: sz[f], cantica: canticaOf[f], long: Math.max(sz[f].width, sz[f].height) }))
  .sort((a, b) => b.long - a.long);
console.log(`Candidatos ≥${MINLONG}px: ${cands.length}. Hasheando en paralelo...`);
const hashes = await pool(cands, 8, c => aHash(c.f));
cands.forEach((c, i) => c.hash = hashes[i]);
const kept = [];
for (const c of cands) { if (c.hash && kept.some(k => k.hash && ham(k.hash, c.hash) <= 12)) continue; kept.push(c); }
const list = kept.sort((a, b) => a.cantica.localeCompare(b.cantica) || a.f.localeCompare(b.f));
const cnt = {}; for (const x of list) cnt[x.cantica] = (cnt[x.cantica] || 0) + 1;
console.log(`\n=== Doré · Divina Comedia: ${list.length} grabados únicos full-res ===  ${JSON.stringify(cnt)}`);
if (!APPLY) { console.log('[DRY] sin --apply no baja.'); process.exit(0); }

// 3) descargar EN PARALELO (n pre-asignado para nombre determinista)
await fs.mkdir(path.join(COL, 'landscape'), { recursive: true });
await fs.mkdir(path.join(COL, 'portrait'), { recursive: true });
const idx = await loadIndex(COL);
const startN = idx.items.length ? Math.max(...idx.items.map(i => i.n)) + 1 : 1;
console.log(`Descargando ${list.length} grabados (5 en paralelo)...`);
const items = await pool(list, 5, async (x, i) => {
  const n = startN + i;
  const canto = (x.f.match(/Canto ([IVXLC]+)/i) || [])[1];
  const tema = (x.f.match(/\(([^)]+)\)/) || [])[1] || '';
  const cantES = { Inferno: 'Infierno', Purgatorio: 'Purgatorio', Paradiso: 'Paraíso' }[x.cantica];
  const title = `${cantES}${canto ? ', Canto ' + canto : ''}${tema ? ': ' + tema.replace(/^Canto [IVXLC]+\s*[-–]\s*/i, '') : ''}`.replace(/\s+/g, ' ').slice(0, 90);
  let src = x.ii.url;
  if (x.ii.mime !== 'image/jpeg' || Math.max(x.ii.width, x.ii.height) > 8000) {
    const tw = x.ii.width >= x.ii.height ? 8000 : Math.round(x.ii.width * 8000 / x.ii.height);
    const j = await jget(`${C}?action=query&format=json&prop=imageinfo&iiprop=url&iiurlwidth=${tw}&titles=${enc(x.f)}`);
    src = Object.values(j.query.pages)[0]?.imageinfo?.[0]?.thumburl || src;
  }
  const buf = Buffer.from(await (await fetchT(src, {}, 90000)).arrayBuffer());
  const s = imgSize(buf) || { w: x.ii.width, h: x.ii.height };
  const orient = orientationOf(s.w, s.h);
  const file = buildFilename(n, title, 'Gustave Doré', '1861');
  await fs.writeFile(path.join(COL, orient, file), buf);
  return { n, file, orientation: orient, title, title_es: title, artist: 'Gustave Doré', year: '1861', school: 'Romanticismo (ilustración)', type: 'Grabado', holding_museum: null, museum: 'Wikimedia/Commons', license: 'Dominio público', source_url: `https://commons.wikimedia.org/wiki/${enc(x.f)}`, image_url: src, width: s.w, height: s.h, bytes: buf.length, sourceId: x.f, kind: 'dore-dante' };
});
const got = items.filter(Boolean).sort((a, b) => a.n - b.n);
idx.items.push(...got);
await saveIndex(COL, idx);
console.log(`\n=== ${COL}: OK ${got.length} | fallidas ${list.length - got.length} | total ${idx.items.length} ===`);
