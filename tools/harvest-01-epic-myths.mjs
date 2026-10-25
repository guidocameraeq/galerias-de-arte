// tools/harvest-01-epic-myths.mjs
// Herramienta de verificación, resolución y descarga para la expansión épica de 01_mitologia_griega_romana
// (Zeus, Olimpo, Titanomaquias, Trabajos de Hércules, Perseo/monstruos, Inframundo/Tártaro, Troya/Odisea).
// Por defecto corre en DRY-RUN (no modifica disco ni descarga imágenes).
// Con --apply descarga imágenes y actualiza el índice y las fichas autoradas.
//
// Uso:
//   node tools/harvest-01-epic-myths.mjs         # Modo DRY-RUN con dimensiones verificadas
//   node tools/harvest-01-epic-myths.mjs --check # Re-consulta la API de Commons para validar dimensiones en vivo
//   node tools/harvest-01-epic-myths.mjs --apply # Descarga y escribe en disco

import { promises as fsp, existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TARGETS_01_EPIC_MYTHS } from './targets-01-epic-myths.mjs';
import {
  getJSON, downloadTo, imgSize, orientationOf, buildFilename,
  loadIndex, saveIndex, sleep, MIN_LONG_SIDE
} from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COL_DIR = '01_mitologia_griega_romana';
const APPLY = process.argv.includes('--apply');
const CHECK_API = process.argv.includes('--check');
const UA = 'Arte-PD-Collection/1.0 (eq.chatgpt@gmail.com)';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const WMC_LONG_CAP = 8000;

async function fetchCommonsInfo(filenames) {
  const infoMap = new Map();
  for (let i = 0; i < filenames.length; i += 20) {
    const batch = filenames.slice(i, i + 20);
    const titles = batch.map(f => 'File:' + f).join('|');
    const u = `${COMMONS}?action=query&format=json&prop=imageinfo&iiprop=url|size|mime|extmetadata&titles=${encodeURIComponent(titles)}`;
    try {
      const j = await getJSON(u, { ua: UA, delay: 100 });
      for (const p of Object.values(j.query?.pages || {})) {
        if (p.missing !== undefined) continue;
        const raw = p.title.replace(/^File:/, '');
        const ii = p.imageinfo?.[0];
        if (ii) {
          const entry = {
            w: ii.width,
            h: ii.height,
            mime: ii.mime,
            url: ii.url,
            license: ii.extmetadata?.LicenseShortName?.value || 'Dominio público',
          };
          infoMap.set(raw, entry);
          infoMap.set(raw.replace(/ /g, '_'), entry);
          infoMap.set(raw.replace(/_/g, ' '), entry);
        }
      }
      if (j.query?.normalized) {
        for (const norm of j.query.normalized) {
          const fromRaw = norm.from.replace(/^File:/, '');
          const toRaw = norm.to.replace(/^File:/, '');
          const entry = infoMap.get(toRaw) || infoMap.get(toRaw.replace(/ /g, '_'));
          if (entry) {
            infoMap.set(fromRaw, entry);
            infoMap.set(fromRaw.replace(/ /g, '_'), entry);
          }
        }
      }
    } catch (e) {
      console.warn(`[AVISO] Error al consultar lote de Commons: ${e.message}`);
    }
  }
  return infoMap;
}

function checkRepoCollisions(targets, currentIdx) {
  const allOtherWorks = [];
  for (const dir of readdirSync(ROOT)) {
    const p = path.join(ROOT, dir, '_index.json');
    if (existsSync(p)) {
      try {
        const idx = JSON.parse(readFileSync(p, 'utf8'));
        for (const it of idx.items || []) {
          allOtherWorks.push({
            col: dir,
            n: it.n,
            title: it.title,
            title_es: it.title_es,
            artist: it.artist,
            file: it.file,
            sourceId: it.sourceId,
            qid: it.qid,
          });
        }
      } catch {}
    }
  }

  function normalizeStr(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ' ').trim();
  }

  const STOP_WORDS = new Set(['de','la','el','los','las','un','una','unos','unas','en','por','y','del','al','ante','contra','sobre','entre','con','sin','tras','para','a','o','u','the','of','and','in','on','at','to','for','with','by']);

  function getTokens(s) {
    return normalizeStr(s).split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  }

  const collisions = [];
  for (const t of targets) {
    const tSid = `file:${t.file.toLowerCase()}`;
    const tArtistTokens = getTokens(t.artist);
    const tTitleTokens = new Set([...getTokens(t.title_es), ...getTokens(t.title)]);

    for (const w of allOtherWorks) {
      // Omit self when checking existing runs (including already harvested items in this batch n >= 110)
      if (w.col === COL_DIR && (w.sourceId?.toLowerCase() === tSid || (t.target_n && w.n === t.target_n) || w.n >= 110)) continue;

      // 1. Same sourceId
      if (w.sourceId && w.sourceId.toLowerCase() === tSid) {
        collisions.push({ target: t, collisionWith: w, reason: 'mismo sourceId' });
        continue;
      }
      // 2. QID match
      if (t.qid && w.qid && t.qid === w.qid) {
        collisions.push({ target: t, collisionWith: w, reason: `mismo QID (${t.qid})` });
        continue;
      }
      // 3. Artist + Title similarity
      const wArtistTokens = getTokens(w.artist);
      const artistMatch = tArtistTokens.some(tok =>
        wArtistTokens.some(wTok => tok === wTok || (tok.startsWith(wTok) && wTok.length >= 5) || (wTok.startsWith(tok) && tok.length >= 5) || (tok.includes('pollai') && wTok.includes('pollai')))
      );

      if (artistMatch) {
        const wTitleTokens = new Set([...getTokens(w.title_es), ...getTokens(w.title)]);
        const overlap = [...tTitleTokens].filter(k => wTitleTokens.has(k));
        const specificKeys = ['polifemo','anteo','hydra','hidra','hector','patroclo','medusa','calipso','deianira','deyanira','diomedes','diomede','ixion','ticio','prometeo','antiope','titanes','faeton'];
        const hasSpecific = overlap.some(k => specificKeys.includes(k));

        if (overlap.length >= 2 || (overlap.length >= 1 && hasSpecific)) {
          // Rubens Fall of Giants vs Fall of Phaeton (distinct subjects)
          if (t.id === 'rubens_fall_of_giants' && normalizeStr(w.title_es || w.title || w.file).includes('faeton')) continue;
          // Pollaiolo Antaeus: n15 is engraving print with Bargello bronze metadata, target is Uffizi tempera painting requested in task
          if (t.id === 'pollaiolo_hercules_antaeus' && w.n === 15) continue;
          collisions.push({
            target: t,
            collisionWith: w,
            reason: `mismo artista (${t.artist}) y tema similar (${overlap.join(', ')})`,
          });
        }
      }
    }
  }
  return collisions;
}

async function main() {
  console.log(`=== HARVESTER MITOLOGÍA ÉPICA (01_MITOLOGIA_GRIEGA_ROMANA) ===`);
  console.log(`Modo: ${APPLY ? 'APPLY (descarga e indexación activa)' : 'DRY-RUN (solo lectura y verificación)'}`);
  console.log(`Targets definidos: ${TARGETS_01_EPIC_MYTHS.length} pinturas maestras épicas\n`);

  const currentIdx = await loadIndex(path.join(ROOT, COL_DIR));
  console.log(`Colección ${COL_DIR} actual: ${currentIdx.items.length} obras en índice.`);

  // Verificación de colisiones con el repositorio entero
  const collisions = checkRepoCollisions(TARGETS_01_EPIC_MYTHS, currentIdx);
  if (collisions.length > 0) {
    console.error(`\n[ERROR FATAL] Se detectaron ${collisions.length} colisiones en el repositorio:`);
    for (const c of collisions) {
      console.error(`  - Target: ${c.target.id} (${c.target.title_es || c.target.title}) colisiona con ${c.collisionWith.col} n${c.collisionWith.n} [${c.reason}]`);
    }
    process.exit(1);
  }
  console.log(`✓ 0 colisiones en todo el repositorio.\n`);

  let apiInfo = new Map();
  if (CHECK_API || APPLY) {
    console.log(`Consultando API de Wikimedia Commons para verificar dimensiones en vivo...`);
    const filesToQuery = TARGETS_01_EPIC_MYTHS.map(t => t.file);
    apiInfo = await fetchCommonsInfo(filesToQuery);
    let resolvedCount = 0;
    for (const f of filesToQuery) {
      if (apiInfo.has(f) || apiInfo.has(f.replace(/ /g, '_')) || apiInfo.has(f.replace(/_/g, ' '))) resolvedCount++;
    }
    console.log(`Respuestas obtenidas de API: ${resolvedCount}/${filesToQuery.length} archivos.\n`);
  }

  const verifiedTargets = [];
  let underFloorCount = 0;

  for (const t of TARGETS_01_EPIC_MYTHS) {
    let w = t.expected_w;
    let h = t.expected_h;
    let mime = 'image/jpeg';
    let license = 'Dominio público';
    let url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(t.file)}`;

    const live = apiInfo.get(t.file) || apiInfo.get(t.file.replace(/ /g, '_')) || apiInfo.get(t.file.replace(/_/g, ' '));
    if (live) {
      w = live.w;
      h = live.h;
      mime = live.mime;
      license = live.license;
      url = live.url;
    }

    const longSide = Math.max(w, h);
    const orient = orientationOf(w, h);
    const passFloor = longSide >= MIN_LONG_SIDE;
    if (!passFloor) underFloorCount++;

    verifiedTargets.push({
      ...t,
      w,
      h,
      longSide,
      orient,
      mime,
      license,
      url,
      passFloor,
    });
  }

  // Imprimir tabla formateada
  console.log(
    '#'.padEnd(4) +
    'Autor'.padEnd(20) +
    'Título'.padEnd(36) +
    'Museo'.padEnd(38) +
    'Resolución'.padEnd(14) +
    'Orient.'.padEnd(11) +
    'Estado'
  );
  console.log('-'.repeat(128));

  let idxNum = 1;
  for (const vt of verifiedTargets) {
    const numStr = `${idxNum++}`.padStart(2, '0').padEnd(4);
    const artistStr = (vt.artist || 'Anonimo').slice(0, 18).padEnd(20);
    const titleStr = (vt.title_es || vt.title).slice(0, 34).padEnd(36);
    const musStr = (vt.holding_museum || '').slice(0, 36).padEnd(38);
    const resStr = `${vt.w}x${vt.h}`.padEnd(14);
    const oriStr = vt.orient.padEnd(11);
    const statusStr = vt.passFloor ? '✓ OK (>=1000px)' : '⚠ BAJA RES';

    console.log(`${numStr}${artistStr}${titleStr}${musStr}${resStr}${oriStr}${statusStr}`);
  }

  console.log('-'.repeat(128));
  console.log(`\nResumen de verificación:`);
  console.log(`  - Total pinturas mitológicas épicas objetivo: ${verifiedTargets.length}`);
  console.log(`  - Obras bajo piso (1000px):                     ${underFloorCount}`);
  console.log(`  - Colección 01 actual (${currentIdx.items.length} obras) + expansión (+${verifiedTargets.length} obras) = ~${currentIdx.items.length + verifiedTargets.length} obras.`);

  if (!APPLY) {
    console.log(`\n[DRY-RUN] No se modificó ningún archivo en disco.`);
    console.log(`Para descargar y poblar la colección, ejecutar:`);
    console.log(`  node tools/harvest-01-epic-myths.mjs --apply`);
    return;
  }

  // --- EJECUCIÓN CON --APPLY ---
  console.log(`\nIniciando descarga y guardado en disco...`);
  const idx = await loadIndex(path.join(ROOT, COL_DIR));

  // Descripciones autoradas en tools/desc/01_mitologia_griega_romana.mjs
  const descFilePath = path.join(ROOT, 'tools', 'desc', `${COL_DIR}.mjs`);
  let existingDesc = [];
  if (existsSync(descFilePath)) {
    try {
      const mod = await import(`file://${descFilePath}`);
      existingDesc = mod.default || [];
    } catch (e) {
      console.warn(`[AVISO] No se pudo cargar módulo de descripciones existente: ${e.message}`);
    }
  }
  const descMap = new Map(existingDesc.map(d => [d.n, d]));

  const byN = new Set(idx.items.map(i => i.n));
  const maxN = Math.max(74, ...idx.items.map(i => i.n));
  let nextN = maxN + 1;

  for (let k = 0; k < verifiedTargets.length; k++) {
    const vt = verifiedTargets[k];

    // Verificar si ya existe por sourceId
    const existingWork = idx.items.find(i => i.sourceId === `File:${vt.file}`);
    if (existingWork) {
      console.log(`[OMITIR] ${vt.title_es || vt.title} ya existe en índice como n${existingWork.n}.`);
      continue;
    }

    let n = vt.target_n;
    if (!n) {
      while (byN.has(nextN)) nextN++;
      n = nextN++;
    }
    byN.add(n);

    const cleanTitleStr = vt.title_es || vt.title;
    const cleanArtistStr = vt.artist || 'Anonimo';
    const cleanYrStr = vt.year || '';
    const filename = buildFilename(n, cleanTitleStr, cleanArtistStr, cleanYrStr);

    // Techo WMC_LONG_CAP (8000px)
    let downloadUrl = vt.url;
    if (vt.longSide > WMC_LONG_CAP) {
      const targetW = vt.w >= vt.h ? WMC_LONG_CAP : Math.round((vt.w * WMC_LONG_CAP) / vt.h);
      downloadUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&iiurlwidth=${targetW}&titles=File:${encodeURIComponent(vt.file)}`;
      try {
        const r = await getJSON(downloadUrl, { ua: UA });
        const p = Object.values(r.query?.pages || {})[0];
        const thumb = p?.imageinfo?.[0]?.thumburl;
        if (thumb) downloadUrl = thumb;
      } catch {
        downloadUrl = vt.url;
      }
    }

    const destPath = path.join(ROOT, COL_DIR, vt.orient, filename);
    console.log(`Descargando n${n}: ${cleanArtistStr} - ${cleanTitleStr}...`);
    try {
      const buf = await downloadTo(downloadUrl, destPath, { ua: UA, retries: 4, validate: true });
      const sz = imgSize(buf) || { w: vt.w, h: vt.h };
      const realOrient = orientationOf(sz.w, sz.h);

      if (realOrient !== vt.orient) {
        const correctDest = path.join(ROOT, COL_DIR, realOrient, filename);
        await fsp.mkdir(path.dirname(correctDest), { recursive: true });
        await fsp.rename(destPath, correctDest);
        vt.orient = realOrient;
      }

      const item = {
        n,
        file: filename,
        orientation: vt.orient,
        title: vt.title,
        title_es: vt.title_es,
        artist: cleanArtistStr,
        year: cleanYrStr,
        school: vt.school,
        type: vt.type,
        holding_museum: vt.holding_museum,
        museum_confidence: 'fuente',
        museum: 'Wikimedia',
        license: vt.license,
        source_url: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(vt.file)}`,
        image_url: downloadUrl,
        width: sz.w,
        height: sz.h,
        bytes: buf.length,
        sourceId: `File:${vt.file}`,
        kind: 'named',
        description: vt.description,
        description_source: 'Síntesis (fundada en Wikipedia/curatoría)',
      };

      idx.items.push(item);
      console.log(`  ✓ Guardado: ${filename} (${sz.w}x${sz.h}, ${buf.length} bytes)`);

      // Agregar a ficha estructurada
      descMap.set(n, {
        n,
        titulo: vt.title_es || vt.title,
        anio: cleanYrStr,
        museo: vt.holding_museum || '',
        escuela: vt.school || '',
        tipo: vt.type || '',
        d: vt.description || '',
      });

      await sleep(300);
    } catch (err) {
      console.error(`  ✗ Error al descargar ${cleanTitleStr}: ${err.message}`);
    }
  }

  idx.items.sort((a, b) => a.n - b.n);
  await saveIndex(path.join(ROOT, COL_DIR), idx);

  const sortedDesc = [...descMap.values()].sort((a, b) => a.n - b.n);
  const descCode = `// Descripciones autoradas (es) — colección 01 Mitología.\n` +
    `// Fundadas en consenso art-histórico (Wikipedia + curatoría).\n` +
    `export default ${JSON.stringify(sortedDesc, null, 2)};\n`;
  await fsp.writeFile(descFilePath, descCode, 'utf8');

  console.log(`\n✓ Índice guardado: ${COL_DIR}/_index.json (${idx.items.length} obras).`);
  console.log(`✓ Fichas actualizadas en ${path.relative(ROOT, descFilePath)} (${sortedDesc.length} fichas).`);
}

main().catch(err => {
  console.error('[ERROR FATAL]', err);
  process.exit(1);
});
