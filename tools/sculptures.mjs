// Esculturas canónicas anónimas/antiguas (sin autor claro) → resuelve por NOMBRE en Wikidata,
// baja P18 de Commons, indexa en la carpeta de época indicada. Dedup contra todo. Uso: [--apply]
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getJSON, downloadTo, imgSize, orientationOf, buildFilename, cleanTitle, loadIndex, saveIndex, sleep } from './lib.mjs';

const APPLY = process.argv.includes('--apply');
const UA = 'Arte-PD-Collection/1.0 (eq.chatgpt@gmail.com)';
const WD = 'https://www.wikidata.org/w/api.php';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const enc = encodeURIComponent;
const norm = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const taKey = (t, a) => norm(t).split(' ').filter(w => w.length > 2).slice(0, 4).join(' ') + '|' + (norm(a).split(' ').filter(Boolean).pop() || '');

// nombre Wikidata, escuela, técnica, colección destino, autor a mostrar
const LIST = [
  { q: 'Laocoön and His Sons', school: 'Arte helenístico', tipo: 'Mármol', col: '01_mitologia_griega_romana', artist: 'Anonimo' },
  { q: 'Venus de Milo', school: 'Arte helenístico', tipo: 'Mármol', col: '01_mitologia_griega_romana', artist: 'Anonimo' },
  { q: 'Winged Victory of Samothrace', school: 'Arte helenístico', tipo: 'Mármol', col: '01_mitologia_griega_romana', artist: 'Anonimo' },
  { q: 'Riace bronzes', school: 'Arte griego clásico', tipo: 'Bronce', col: '01_mitologia_griega_romana', artist: 'Anonimo' },
  { q: 'Capitoline Wolf', school: 'Arte etrusco/romano', tipo: 'Bronce', col: '01_mitologia_griega_romana', artist: 'Anonimo' },
  { q: 'Discobolus', school: 'Arte griego clásico', tipo: 'Mármol (copia romana)', col: '01_mitologia_griega_romana', artist: 'Mirón' },
  { q: 'Augustus of Prima Porta', school: 'Arte romano', tipo: 'Mármol', col: '01_mitologia_griega_romana', artist: 'Anonimo' },
  { q: 'Apollo Belvedere', school: 'Arte clásico', tipo: 'Mármol', col: '01_mitologia_griega_romana', artist: 'Anonimo' },
  { q: 'Dying Gaul', school: 'Arte helenístico', tipo: 'Mármol', col: '01_mitologia_griega_romana', artist: 'Anonimo' },
  { q: 'Bust of Nefertiti', school: 'Arte egipcio (Amarna)', tipo: 'Caliza pintada', col: '05_egipcio', artist: 'Tutmose' },
  { q: 'Mask of Tutankhamun', school: 'Arte egipcio', tipo: 'Oro y piedras', col: '05_egipcio', artist: 'Anonimo' },
  { q: 'Seated Scribe', school: 'Arte egipcio', tipo: 'Caliza pintada', col: '05_egipcio', artist: 'Anonimo' },
];

async function resolve(name) {
  const s = await getJSON(`${WD}?action=wbsearchentities&format=json&language=en&type=item&limit=8&search=${enc(name)}`, { ua: UA, retries: 2 });
  const ids = (s.search || []).map(x => x.id); if (!ids.length) return null;
  const e = await getJSON(`${WD}?action=wbgetentities&format=json&props=claims|sitelinks|labels&languages=es|en&ids=${ids.join('|')}`, { ua: UA, retries: 2 });
  let best = null, bestN = -1;
  for (const id of ids) {
    const ent = e.entities?.[id]; if (!ent) continue;
    const cl = ent.claims || {};
    const img = cl.P18?.[0]?.mainsnak?.datavalue?.value; if (!img) continue;
    const nl = Object.keys(ent.sitelinks || {}).length;
    if (nl > bestN) {
      bestN = nl;
      best = { qid: id, file: img, fame: nl,
        museum: cl.P195?.[0]?.mainsnak?.datavalue?.value?.id || null,
        year: cl.P571?.[0]?.mainsnak?.datavalue?.value?.time || '',
        label: ent.labels?.es?.value || ent.labels?.en?.value || name };
    }
  }
  return best;
}
async function commonsBest(filename) {
  const base = `${COMMONS}?action=query&format=json&prop=imageinfo&titles=${enc('File:' + filename)}`;
  const j = await getJSON(`${base}&iiprop=url|size|mime`, { ua: UA, retries: 3 });
  const ii = Object.values(j.query?.pages || {})[0]?.imageinfo?.[0]; if (!ii) return null;
  if (ii.mime === 'image/jpeg' && Math.max(ii.width, ii.height) <= 8000) return { url: ii.url, w: ii.width, h: ii.height };
  const tw = ii.width >= ii.height ? 8000 : Math.round(ii.width * 8000 / ii.height);
  const j2 = await getJSON(`${base}&iiprop=url|size|mime&iiurlwidth=${tw}`, { ua: UA, retries: 3 });
  const ii2 = Object.values(j2.query?.pages || {})[0]?.imageinfo?.[0];
  return { url: ii2?.thumburl || ii.url, w: ii.width, h: ii.height };
}
async function museumLabel(qid) { if (!qid) return null; try { const e = await getJSON(`${WD}?action=wbgetentities&format=json&props=labels&languages=es|en&ids=${qid}`, { ua: UA }); const l = e.entities?.[qid]?.labels; return l?.es?.value || l?.en?.value || null; } catch { return null; } }

// dedup global
const allDirs = (await fs.readdir('.', { withFileTypes: true })).filter(d => d.isDirectory() && /^\d\d_/.test(d.name)).map(d => d.name);
const haveQID = new Set(), haveTA = new Set();
for (const c of allDirs) { try { const idx = await loadIndex(c); for (const it of idx.items) { if (it.qid) haveQID.add(it.qid); haveTA.add(taKey(it.title, it.artist)); if (it.title_es) haveTA.add(taKey(it.title_es, it.artist)); } } catch {} }

const byCol = {};
for (const item of LIST) {
  const r = await resolve(item.q); await sleep(200);
  if (!r) { console.log(`✗ ${item.q}: sin item/imagen`); continue; }
  if (haveQID.has(r.qid) || haveTA.has(taKey(r.label, item.artist)) || haveTA.has(taKey(item.q, item.artist))) { console.log(`= ${item.q}: ya está`); continue; }
  (byCol[item.col] = byCol[item.col] || []).push({ ...item, ...r });
}

const totalToGet = Object.values(byCol).flat().length;
console.log(`\nA bajar: ${totalToGet} esculturas`);
for (const col of Object.keys(byCol)) for (const it of byCol[col]) console.log(`  ${col} ← ${it.label} (fama ${it.fame})`);
if (!APPLY) { console.log('\n[DRY] sin --apply no baja.'); process.exit(0); }

for (const col of Object.keys(byCol)) {
  const idx = await loadIndex(col);
  let n = idx.items.length ? Math.max(...idx.items.map(i => i.n)) + 1 : 1;
  for (const it of byCol[col]) {
    try {
      const best = await commonsBest(it.file); await sleep(150);
      if (!best) { console.log(`✗ ${it.q}: sin imageinfo`); continue; }
      const yr = (it.year.match(/\d{3,4}/) || [''])[0] && it.year.startsWith('-') ? (it.year.match(/\d{3,4}/)[0] + ' a.C.') : (it.year.match(/\d{3,4}/) || [''])[0];
      const museo = await museumLabel(best.museum || it.museum); await sleep(120);
      const cTitle = cleanTitle(it.label);
      let orient = orientationOf(best.w, best.h);
      const file = buildFilename(n, cTitle, it.artist, yr);
      let dest = path.join(col, orient, file);
      const buf = await downloadTo(best.url, dest, { ua: UA });
      const sz = imgSize(buf) || { w: best.w, h: best.h };
      const ro = orientationOf(sz.w, sz.h);
      if (ro !== orient) { const nd = path.join(col, ro, file); await fs.rename(dest, nd); orient = ro; dest = nd; }
      idx.items.push({ n, file, orientation: orient, title: it.label, title_es: cTitle, artist: it.artist, year: yr, school: it.school, type: it.tipo, holding_museum: museo, canon_rank: it.fame, qid: it.qid, museum: 'Wikidata/Commons', license: 'Dominio público', source_url: `https://www.wikidata.org/wiki/${it.qid}`, image_url: best.url, width: sz.w, height: sz.h, bytes: buf.length, sourceId: 'File:' + it.file, kind: 'escultura-canon' });
      console.log(`✓ ${col} #${n} [${orient[0]}] ${sz.w}x${sz.h} — ${file}`);
      n++; await saveIndex(col, idx); await sleep(200);
    } catch (e) { console.log(`✗ ${it.q}: ${e.message}`); }
  }
}
console.log('\nAPLICADO');
