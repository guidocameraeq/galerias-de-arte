// Adquisición de obras MODERNAS (con copyright, uso personal) desde WikiArt, a la
// máxima resolución disponible (original > !HD > !Large). Config en tools/wikiart/<col>.mjs.
// Resuelve el slug; si falla, busca en WikiArt. Uso: node tools/wikiart.mjs <colDir> [--apply]
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { imgSize, orientationOf, buildFilename, cleanTitle, cleanArtist, cleanYear, loadIndex, saveIndex, sleep } from './lib.mjs';

const colDir = process.argv[2];
const APPLY = process.argv.includes('--apply');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36';
const H = { 'User-Agent': UA };
const cfg = (await import(`./wikiart/${colDir}.mjs`)).default;

const norm = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

async function getText(url) {
  for (let i = 0; i < 3; i++) {
    try { const r = await fetch(url, { headers: H }); if (r.ok) return await r.text(); if (r.status === 404) return null; }
    catch {}
    await sleep(600 + i * 600); // backoff ante rate-limit
  }
  return null;
}
function imgBaseFromHtml(html) {
  if (!html) return null;
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  let url = og ? og[1] : (html.match(/https:\/\/uploads[0-9]*\.wikiart\.org\/[^"'\\ ]+?\.jpg/) || [])[0];
  if (!url) return null;
  if (!/^https?:/.test(url)) url = 'https://' + url.replace(/^\/\//, '');
  return url.replace(/!.*$/, '');
}
// Listado server-rendered de TODAS las obras de un autor (cache) — slugs fiables.
const listCache = {};
async function artistSlugs(artistSlug) {
  if (listCache[artistSlug]) return listCache[artistSlug];
  const t = await getText(`https://www.wikiart.org/en/${artistSlug}/all-works/text-list`);
  const slugs = t ? [...new Set((t.match(new RegExp(`/en/${artistSlug}/[a-z0-9-]+`, 'g')) || []))] : [];
  return (listCache[artistSlug] = slugs);
}
const STOP = new Set(['the', 'and', 'with', 'for', 'of', 'a', 'an', 'la', 'el', 'le', 'in', 'on', 'to']);
function bestSlug(slugs, title, artistSlug) {
  const kw = norm(title).split(' ').filter(w => w.length > 2 && !STOP.has(w));
  if (!kw.length) return null;
  let best = null, bestScore = -1;
  for (const s of slugs) {
    const tail = s.replace(`/en/${artistSlug}/`, '');
    const score = kw.filter(w => tail.includes(w)).length - tail.length * 0.002;
    if (score > bestScore) { bestScore = score; best = s; }
  }
  // EXIGIR que el mejor contenga TODAS las keywords significativas (evita mislabel)
  const tail = best ? best.replace(`/en/${artistSlug}/`, '') : '';
  return kw.every(w => tail.includes(w)) ? best : null;
}
async function resolveImageBase(work) {
  // 1) slug directo
  let base = imgBaseFromHtml(await getText('https://www.wikiart.org/en/' + work.slug));
  if (base) return base;
  // 2) match contra el text-list del autor
  const artistSlug = work.slug.split('/')[0];
  const s = bestSlug(await artistSlugs(artistSlug), work.t, artistSlug);
  if (s) { console.log(`    (resolví por text-list: ${s})`); base = imgBaseFromHtml(await getText('https://www.wikiart.org' + s)); }
  return base;
}
async function bestImage(base) {
  for (const u of [base, base + '!HD.jpg', base + '!Large.jpg']) {
    try {
      const r = await fetch(u, { headers: H }); if (!r.ok) continue;
      const buf = Buffer.from(await r.arrayBuffer()); const sz = imgSize(buf);
      if (sz && Math.max(sz.w, sz.h) >= 700) return { buf, w: sz.w, h: sz.h, url: u };
    } catch {}
  }
  return null;
}

const idx = await loadIndex(colDir);
const have = new Set(idx.items.map(it => norm(it.title) + '|' + norm(it.artist).split(' ').pop()));
let n = idx.items.length ? Math.max(...idx.items.map(i => i.n)) + 1 : 1;
let ok = 0, fail = 0;
console.log(`=== WikiArt: ${cfg.titulo} (${cfg.works.length} obras) ===`);
if (APPLY) { await fs.mkdir(path.join(colDir, 'landscape'), { recursive: true }); await fs.mkdir(path.join(colDir, 'portrait'), { recursive: true }); }

for (const w of cfg.works) {
  if (have.has(norm(w.t) + '|' + norm(w.a).split(' ').pop())) { console.log(`  = ${w.t} (ya está)`); continue; }
  try {
    const base = await resolveImageBase(w); await sleep(200);
    if (!base) { console.log(`  ✗ ${w.t} — no encontrado en WikiArt`); fail++; continue; }
    const img = await bestImage(base);
    if (!img) { console.log(`  ✗ ${w.t} — sin imagen usable`); fail++; continue; }
    const cTitle = cleanTitle(w.t), cArtist = w.a, cYear = cleanYear(String(w.year || ''));
    const orient = orientationOf(img.w, img.h);
    const file = buildFilename(n, cTitle, cArtist, cYear);
    const quality = Math.max(img.w, img.h) >= 2400 ? 'alta' : Math.max(img.w, img.h) >= 1500 ? 'media' : 'baja';
    if (APPLY) {
      await fs.writeFile(path.join(colDir, orient, file), img.buf);
      idx.items.push({
        n, file, orientation: orient, title: cTitle, artist: cArtist, year: cYear,
        title_es: w.titulo || null, school: cfg.titulo, type: w.tipo || 'Óleo sobre lienzo',
        holding_museum: w.museo || null, museum: 'WikiArt', license: 'Con copyright (uso personal)',
        image_quality: quality, source_url: 'https://www.wikiart.org/en/' + w.slug, image_url: img.url,
        width: img.w, height: img.h, bytes: img.buf.length, kind: 'moderno', description: w.d || '', description_source: w.d ? 'Síntesis (Claude)' : '',
      });
      await saveIndex(colDir, idx);
    }
    ok++; n++;
    console.log(`  ✓ ${String(idx.items.length).padStart(2, '0')} [${orient[0]}] ${img.w}x${img.h} (${quality}) — ${file}`);
    await sleep(250);
  } catch (e) { console.log(`  ! ${w.t}: ${e.message}`); fail++; }
}
console.log(`\n${APPLY ? 'APLICADO' : 'DRY'}: OK ${ok} | fallidas ${fail} | total ${idx.items.length}`);
