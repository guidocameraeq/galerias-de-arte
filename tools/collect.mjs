// tools/collect.mjs — runner de la colección 01 (mitología).
// Resuelve targets nombrados + barrido de descubrimiento, filtra, descarga,
// clasifica landscape/portrait, nombra por convención, escribe _index.json y
// loguea descartes. Idempotente. Usar:  node tools/collect.mjs [--max=65] [--dry]
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { TARGETS_01 } from './targets-01.mjs';
import { TARGETS_02, MET_SUBJECTS_02, MET_DEPTS_PREF_02, MET_DATE_02, WMC_CATEGORIES_02 } from './targets-02.mjs';
import { TARGETS_03, MET_SUBJECTS_03, MET_DEPTS_PREF_03, MET_DATE_03, WMC_CATEGORIES_03 } from './targets-03.mjs';
import { TARGETS_04, MET_SUBJECTS_04, MET_DEPTS_PREF_04, MET_DATE_04, WMC_CATEGORIES_04, MAX_YEAR_04 } from './targets-04.mjs';
import { TARGETS_05, MET_SUBJECTS_05, MET_DEPTS_PREF_05, MET_DATE_05, WMC_CATEGORIES_05, MAX_YEAR_05 } from './targets-05.mjs';
import { TARGETS_06, MET_SUBJECTS_06, MET_DEPTS_PREF_06, MET_DATE_06, WMC_CATEGORIES_06, EXCLUDE_CHRISTIAN_06, MAX_YEAR_06 } from './targets-06.mjs';
import { resolveTarget, UA } from './resolve.mjs';
import { discoverMet, discoverWMC } from './discover.mjs';
import {
  buildFilename, orientationOf, downloadTo, loadIndex, saveIndex, alreadyHave,
  idKey, logDiscard, sleep, MIN_LONG_SIDE, imgSize,
  cleanTitle, cleanArtist, cleanYear,
} from './lib.mjs';

// Registro de colecciones: targets + config de descubrimiento (Met/Wikimedia).
const COLLECTIONS = {
  '01_mitologia_griega_romana': { targets: TARGETS_01, max: 65, met: {}, wmc: {} },
  '02_barroco': {
    targets: TARGETS_02, max: 70,
    met: { subjects: MET_SUBJECTS_02, depts: MET_DEPTS_PREF_02, dateMin: MET_DATE_02.min, dateMax: MET_DATE_02.max, matchArtist: true },
    wmc: { categories: WMC_CATEGORIES_02 },
  },
  '03_gotico': {
    targets: TARGETS_03, max: 60,
    met: { subjects: MET_SUBJECTS_03, depts: MET_DEPTS_PREF_03, dateMin: MET_DATE_03.min, dateMax: MET_DATE_03.max, matchArtist: false },
    wmc: { categories: WMC_CATEGORIES_03 },
  },
  '04_romanticismo': {
    targets: TARGETS_04, max: 65,
    met: { subjects: MET_SUBJECTS_04, depts: MET_DEPTS_PREF_04, dateMin: MET_DATE_04.min, dateMax: MET_DATE_04.max, matchArtist: true },
    wmc: { categories: WMC_CATEGORIES_04, maxYear: MAX_YEAR_04 },
  },
  '05_egipcio': {
    targets: TARGETS_05, max: 60,
    met: { subjects: MET_SUBJECTS_05, depts: MET_DEPTS_PREF_05, dateMin: MET_DATE_05.min, dateMax: MET_DATE_05.max, matchArtist: false, perSubject: 16 },
    wmc: { categories: WMC_CATEGORIES_05, maxYear: MAX_YEAR_05 },
  },
  '06_macabro_memento_mori': {
    targets: TARGETS_06, max: 60,
    met: { subjects: MET_SUBJECTS_06, depts: MET_DEPTS_PREF_06, dateMin: MET_DATE_06.min, dateMax: MET_DATE_06.max, matchArtist: false, exclude: EXCLUDE_CHRISTIAN_06 },
    wmc: { categories: WMC_CATEGORIES_06, exclude: EXCLUDE_CHRISTIAN_06, maxYear: MAX_YEAR_06 },
  },
};

const ROOT = process.cwd();
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true];
}));
const COL = args.col || '01_mitologia_griega_romana';
const CFG = COLLECTIONS[COL];
if (!CFG) { console.error('Colección desconocida:', COL, '— opciones:', Object.keys(COLLECTIONS).join(', ')); process.exit(1); }
const TARGETS = CFG.targets;
const colDir = path.join(ROOT, COL);
const MAX_TOTAL = parseInt(args.max) || CFG.max || 65;
const DRY = !!args.dry;
const NAMED_FLOOR = MIN_LONG_SIDE;     // 1000: piso anti-basura; los nombrados entran aunque no lleguen a FullHD
const log = (...a) => console.log(...a);

function interleave(a, b) { // round-robin para mezclar Met y Wikimedia
  const out = []; const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) { if (a[i]) out.push(a[i]); if (b[i]) out.push(b[i]); }
  return out;
}

// Dedup entre colecciones: junta los idKey de las OTRAS colecciones para no repetir
// la misma obra (mismo museo+id) en dos carpetas temáticas.
async function loadExternalKeys(rootDir, exceptCol) {
  const keys = new Set();
  let dirs = [];
  try { dirs = (await fs.readdir(rootDir, { withFileTypes: true })).filter(d => d.isDirectory() && /^\d\d_/.test(d.name) && d.name !== exceptCol); }
  catch { return keys; }
  for (const d of dirs) {
    try {
      const j = JSON.parse(await fs.readFile(path.join(rootDir, d.name, '_index.json'), 'utf8'));
      for (const it of j.items || []) keys.add(idKey(it.museum, it.sourceId));
    } catch { /* sin índice todavía */ }
  }
  return keys;
}

async function main() {
  const idx = await loadIndex(colDir);
  let nextN = idx.items.reduce((m, it) => Math.max(m, it.n || 0), 0) + 1;
  const keepers = [];
  const inResult = new Set(idx.items.map(it => idKey(it.museum, it.sourceId)));
  const externalKeys = await loadExternalKeys(ROOT, COL);   // obras ya en otras colecciones
  if (externalKeys.size) log(`(dedup entre colecciones: ${externalKeys.size} obras de otras colecciones se saltean)`);

  // ---------- 1) Targets nombrados ----------
  log(`\n=== Targets nombrados (${TARGETS.length}) ===`);
  for (const t of TARGETS) {
    let hit = null, err = null;
    try { hit = await resolveTarget(t); } catch (e) { hit = null; err = e.message; }
    if (!hit) {
      await logDiscard(ROOT, COL, { kind: 'named', n: t.n, title: t.title, artist: t.artist, reason: 'no_match', err });
      log(`  ✗ #${t.n} ${t.title} — NO MATCH`);
      continue;
    }
    const long = Math.max(hit.w, hit.h);
    const k = idKey(hit.museum, hit.sourceId);
    if (inResult.has(k) || externalKeys.has(k) || alreadyHave(idx, hit.museum, hit.sourceId)) { log(`  = #${t.n} ${t.title} — ya estaba (esta u otra colección)`); continue; }
    if (long < NAMED_FLOOR) {
      await logDiscard(ROOT, COL, { kind: 'named', n: t.n, title: hit.title, reason: 'low_res', long, source_url: hit.source_url });
      log(`  ✗ #${t.n} ${hit.title} — LOW ${hit.w}x${hit.h}`);
      continue;
    }
    hit.kind = 'named'; hit.targetN = t.n;
    keepers.push(hit); inResult.add(k);
    log(`  ✓ #${t.n} ${hit.title} — ${hit.w}x${hit.h} [${hit.museum}]`);
    await sleep(60);
  }
  log(`Nombrados que entran: ${keepers.length}`);

  // ---------- 2) Barrido de descubrimiento (Met + Wikimedia) ----------
  log(`\n=== Descubrimiento (piso 1920px) ===`);
  const onLog = (e) => logDiscard(ROOT, COL, { kind: 'discovery', ...e });
  const [met, wmc] = await Promise.all([
    discoverMet({ onLog, ...CFG.met }).catch(e => { log('  met-discovery err:', e.message); return []; }),
    discoverWMC({ onLog, ...CFG.wmc }).catch(e => { log('  wmc-discovery err:', e.message); return []; }),
  ]);
  log(`  Met candidatos: ${met.length} | Wikimedia candidatos: ${wmc.length}`);
  met.sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h));
  wmc.sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h));
  const pool = interleave(met, wmc);

  // Dedup por CONTENIDO (no solo por id): mismo título+autor, o mismo autor+dimensiones.
  const nrm = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const titleKey = (c) => 'T:' + nrm(cleanTitle(c.title)).split(/\W+/).filter(w => w.length > 3).slice(0, 4).join(' ') + '|' + nrm(cleanArtist(c.artist));
  const dimKey = (c) => 'D:' + nrm(cleanArtist(c.artist)) + ':' + c.w + 'x' + c.h;
  const seenContent = new Set();
  for (const c of keepers) { seenContent.add(titleKey(c)); seenContent.add(dimKey(c)); }  // sembrar con nombrados

  let added = 0, dupDisc = 0;
  for (const c of pool) {
    if (keepers.length >= MAX_TOTAL) break;
    const k = idKey(c.museum, c.sourceId);
    if (inResult.has(k) || externalKeys.has(k)) { dupDisc++; continue; }
    const tk = titleKey(c), dk = dimKey(c);
    if (seenContent.has(tk) || seenContent.has(dk)) { onLog?.({ stage: 'dedup-content', reason: 'dup', title: c.title }); dupDisc++; continue; }
    keepers.push(c); inResult.add(k); seenContent.add(tk); seenContent.add(dk); added++;
  }
  log(`  Descubrimiento que entra: ${added} (dups con nombrados: ${dupDisc}). Total a bajar: ${keepers.length}`);

  if (DRY) { log('\n[DRY] no se descarga. Resumen de keepers:'); keepers.forEach((h, i) => log(`  ${String(i+1).padStart(2,'0')} ${h.kind[0]} ${h.museum.padEnd(9)} ${h.w}x${h.h} ${String(h.title).slice(0,50)}`)); return; }

  // ---------- 3) Descargar + clasificar + indexar ----------
  log(`\n=== Descargando ${keepers.length} obras ===`);
  let okCount = 0, failCount = 0;
  for (const h of keepers) {
    const cTitle = cleanTitle(h.title), cArtist = cleanArtist(h.artist), cYear = cleanYear(h.year);
    let orient = orientationOf(h.w, h.h);
    const file = buildFilename(nextN, cTitle, cArtist, cYear);
    let dest = path.join(colDir, orient, file);
    try {
      const buf = await downloadTo(h.image_url, dest, { ua: UA, preBuffer: h.preBuffer });
      // Medir el archivo REAL (la API puede clampear renders): el disco es la verdad.
      const sz = imgSize(buf) || { w: h.w, h: h.h };
      const realOrient = orientationOf(sz.w, sz.h);
      if (realOrient !== orient) {       // corregir carpeta si el aspecto real difiere
        const newDest = path.join(colDir, realOrient, file);
        await fs.mkdir(path.dirname(newDest), { recursive: true });
        await fs.rename(dest, newDest);
        orient = realOrient; dest = newDest;
      }
      idx.items.push({
        n: nextN, file, orientation: orient, title: cTitle, artist: cArtist,
        artist_museum: h.artistFull ? String(h.artistFull).slice(0, 160) : undefined,
        year: cYear, classification: h.classification || '', museum: h.museum,
        license: h.license, source_url: h.source_url, image_url: h.image_url,
        width: sz.w, height: sz.h, bytes: buf.length, sourceId: h.sourceId, kind: h.kind,
      });
      okCount++; nextN++;
      log(`  ✓ ${String(idx.items.length).padStart(2,'0')} [${orient[0]}] ${sz.w}x${sz.h} ${Math.round(buf.length/1024)}KB — ${file}`);
      await saveIndex(colDir, idx);     // guardar incrementalmente (idempotencia ante corte)
    } catch (e) {
      failCount++;
      await logDiscard(ROOT, COL, { kind: h.kind, title: h.title, reason: 'download_error', err: e.message, image_url: h.image_url });
      log(`  ✗ FALLÓ ${h.title}: ${e.message}`);
    }
    await sleep(120);
  }

  // ---------- 4) Resumen ----------
  const byMuseum = {}, byOrient = { landscape: 0, portrait: 0 };
  idx.items.forEach(it => { byMuseum[it.museum] = (byMuseum[it.museum]||0)+1; byOrient[it.orientation]++; });
  log(`\n=== RESUMEN ${COL} ===`);
  log(`  Descargadas OK: ${okCount}  | fallidas: ${failCount}  | total en índice: ${idx.items.length}`);
  log(`  Por museo: ${JSON.stringify(byMuseum)}`);
  log(`  Orientación: landscape=${byOrient.landscape}  portrait=${byOrient.portrait}`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
