// Adquisición "Canon" Wikidata-first: por cada autor de un movimiento, trae sus obras
// más famosas (sitelinks) con imagen (P18), museo (P195), año (P571); dedup contra todo
// lo ya bajado; descarga la imagen full-res de Commons (capa 8000) y la indexa.
// Config en tools/canon/<colDir>.mjs. Uso: node tools/canon.mjs <colDir> [--apply] [--limit=N]
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getJSON, downloadTo, imgSize, orientationOf, buildFilename, cleanTitle, cleanArtist, cleanYear, loadIndex, saveIndex, sleep, colPath, listCols } from './lib.mjs';

const colDir = process.argv[2];
const APPLY = process.argv.includes('--apply');
const LIMover = Number((process.argv.find(a => a.startsWith('--limit=')) || '').split('=')[1]) || 0;
const UA = 'Arte-PD-Collection/1.0 (+https://github.com/guidocameraeq/galerias-de-arte)';
const WD = 'https://www.wikidata.org/w/api.php';
const SPARQL = 'https://query.wikidata.org/sparql';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const enc = encodeURIComponent;
const norm = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const taKey = (t, a) => norm(t).split(' ').filter(w => w.length > 2).slice(0, 4).join(' ') + '|' + (norm(a).split(' ').filter(Boolean).pop() || '');

const cfg = (await import(`./canon/${colDir}.mjs`)).default;
const LIMIT = LIMover || cfg.limit || 50;

async function artistQID(name) {
  try {
    const j = await getJSON(`${WD}?action=wbsearchentities&format=json&language=en&type=item&limit=10&search=${enc(name)}`, { ua: UA, retries: 2 });
    const search = j.search || [];
    if (!search.length) return null;
    // preferir candidatos que son artistas; entre ésos, el más famoso (más sitelinks)
    const ART = /paint|sculpt|artist|master|polymath|renaissance|engraver/i;
    const pool = search.filter(x => ART.test(x.description || ''));
    const cands = (pool.length ? pool : search).map(x => x.id);
    const e = await getJSON(`${WD}?action=wbgetentities&format=json&props=sitelinks&ids=${cands.join('|')}`, { ua: UA, retries: 2 });
    let best = cands[0], bestN = -1;
    for (const id of cands) { const nl = Object.keys(e.entities?.[id]?.sitelinks || {}).length; if (nl > bestN) { bestN = nl; best = id; } }
    return best;
  } catch { return null; }
}
async function worksOf(qid) {
  const q = `SELECT ?item ?itemLabel ?image ?collLabel ?n (YEAR(?date) AS ?yr) WHERE {
    ?item wdt:P170 wd:${qid} ; wdt:P18 ?image ; wikibase:sitelinks ?n .
    FILTER(?n >= ${cfg.minFame || 4})
    OPTIONAL { ?item wdt:P195 ?coll. } OPTIONAL { ?item wdt:P571 ?date. }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
  } ORDER BY DESC(?n) LIMIT ${cfg.perArtist || 20}`;
  const r = await fetch(`${SPARQL}?format=json&query=${enc(q)}`, { headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' } });
  if (!r.ok) throw new Error('SPARQL ' + r.status);
  const j = await r.json();
  const seen = new Set();
  return j.results.bindings.filter(b => { const k = b.item.value; if (seen.has(k)) return false; seen.add(k); return true; })
    .map(b => ({
      qid: b.item.value.split('/').pop(),
      title: b.itemLabel.value,
      image: b.image.value,            // Special:FilePath -> original
      museum: b.collLabel?.value || null,
      fame: Number(b.n.value),
      year: b.yr?.value || '',
    }));
}
// Mejor URL descargable de Commons (original si jpeg<=8000; si no, render a 8000 px lado largo)
async function commonsBest(filename) {
  const base = `${COMMONS}?action=query&format=json&prop=imageinfo&titles=${enc('File:' + filename)}`;
  const j = await getJSON(`${base}&iiprop=url|size|mime`, { ua: UA, retries: 3 });
  const ii = Object.values(j.query?.pages || {})[0]?.imageinfo?.[0];
  if (!ii) return null;
  const long = Math.max(ii.width, ii.height);
  if (ii.mime === 'image/jpeg' && long <= 8000) return { url: ii.url, w: ii.width, h: ii.height };
  const targetW = ii.width >= ii.height ? 8000 : Math.round(ii.width * 8000 / ii.height);
  const j2 = await getJSON(`${base}&iiprop=url|size|mime&iiurlwidth=${targetW}`, { ua: UA, retries: 3 });
  const ii2 = Object.values(j2.query?.pages || {})[0]?.imageinfo?.[0];
  return { url: ii2?.thumburl || ii.url, w: ii.width, h: ii.height };
}

// ---- dedup: claves de TODO lo ya bajado (todas las carpetas NN_ del proyecto) ----
const allDirs = listCols();
const ALL_COLS = [...new Set([...allDirs, colDir])];
const haveQID = new Set(), haveTA = new Set();
for (const c of [...new Set(ALL_COLS)]) {
  try { const idx = await loadIndex(c); for (const it of idx.items) { if (it.qid) haveQID.add(it.qid); haveTA.add(taKey(it.title, it.artist)); if (it.title_es) haveTA.add(taKey(it.title_es, it.artist)); } } catch {}
}

// ---- 1) resolver autores y juntar obras ----
console.log(`=== Canon: ${cfg.titulo} (${cfg.artists.length} autores) ===`);
let pool = [];
for (const name of cfg.artists) {
  const qid = await artistQID(name); await sleep(120);
  if (!qid) { console.log(`  ? ${name}: sin QID`); continue; }
  try { const w = await worksOf(qid); pool.push(...w.map(x => ({ ...x, artistCurated: name }))); console.log(`  ✓ ${name} (${qid}): ${w.length} obras`); }
  catch (e) { console.log(`  ! ${name}: ${e.message}`); }
  await sleep(200);
}
// dedup interno + contra lo existente, ordenar por fama
const seenQ = new Set();
pool = pool.filter(x => { if (seenQ.has(x.qid)) return false; seenQ.add(x.qid); return true; })
  .filter(x => !haveQID.has(x.qid) && !haveTA.has(taKey(x.title, x.artistCurated)))
  .sort((a, b) => b.fame - a.fame);
const keepers = pool.slice(0, LIMIT);
console.log(`\nObras candidatas: ${pool.length} | a tomar (top ${LIMIT}): ${keepers.length}`);
console.log('\nrank fama  obra — autor — museo');
keepers.forEach((k, i) => console.log(`${String(i + 1).padStart(2)} ${String(k.fame).padStart(3)}  ${k.title.slice(0, 34).padEnd(34)} ${k.artistCurated.padEnd(18)} ${(k.museum || '-').slice(0, 24)}`));

if (!APPLY) { console.log('\n[DRY] no se descarga. Repasá la lista y corré con --apply.'); process.exit(0); }

// ---- 2) descargar + indexar ----
await fs.mkdir(path.join(colPath(colDir), 'landscape'), { recursive: true });
await fs.mkdir(path.join(colPath(colDir), 'portrait'), { recursive: true });
const idx = await loadIndex(colDir);
let n = idx.items.length ? Math.max(...idx.items.map(i => i.n)) + 1 : 1;
let ok = 0, fail = 0;
console.log(`\n=== Descargando ${keepers.length} obras ===`);
for (const k of keepers) {
  const filename = decodeURIComponent(k.image.split('Special:FilePath/')[1] || '').replace(/_/g, ' ');
  try {
    const best = await commonsBest(filename); await sleep(150);
    if (!best) { console.log(`  ! ${k.title}: sin imageinfo`); fail++; continue; }
    const cTitle = cleanTitle(k.title), cArtist = k.artistCurated, cYear = cleanYear(String(k.year));
    let orient = orientationOf(best.w, best.h);
    const file = buildFilename(n, cTitle, cArtist, cYear);
    let dest = path.join(colPath(colDir), orient, file);
    const buf = await downloadTo(best.url, dest, { ua: UA });
    const sz = imgSize(buf) || { w: best.w, h: best.h };
    const realOrient = orientationOf(sz.w, sz.h);
    if (realOrient !== orient) { const nd = path.join(colPath(colDir), realOrient, file); await fs.rename(dest, nd); orient = realOrient; dest = nd; }
    idx.items.push({
      n, file, orientation: orient, title: cTitle, artist: cArtist, year: cYear,
      school: cfg.titulo, type: null, holding_museum: k.museum || null, museum_confidence: k.museum ? 'wikidata' : 'falta',
      canon_rank: k.fame, qid: k.qid, museum: 'Wikidata/Commons', license: 'Dominio público (verificar)',
      source_url: `https://www.wikidata.org/wiki/${k.qid}`, image_url: best.url,
      width: sz.w, height: sz.h, bytes: buf.length, sourceId: 'File:' + filename, kind: 'canon',
    });
    ok++; n++;
    console.log(`  ✓ ${String(idx.items.length).padStart(2, '0')} [${orient[0]}] ${sz.w}x${sz.h} ${Math.round(buf.length / 1024)}KB — ${file}`);
    await saveIndex(colDir, idx);
    await sleep(200);
  } catch (e) { console.log(`  ! ${k.title}: ${e.message}`); fail++; }
}
console.log(`\n=== ${colDir}: OK ${ok} | fallidas ${fail} | total ${idx.items.length} ===`);
