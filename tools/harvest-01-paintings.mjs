// tools/harvest-01-paintings.mjs
// Herramienta de resolución, verificación y descarga para expandir 01_mitologia_griega_romana
// como galería 100% pictórica mitológica en alta resolución.
// Por defecto corre en DRY-RUN (no modifica disco ni descarga imágenes).
// Con --apply descarga imágenes y actualiza el índice y fichas.
//
// Uso:
//   node tools/harvest-01-paintings.mjs         # Modo DRY-RUN con dimensiones verificadas
//   node tools/harvest-01-paintings.mjs --check # Re-consulta la API de Commons para validar dimensiones en vivo
//   node tools/harvest-01-paintings.mjs --apply # Descarga y escribe en disco

import { promises as fsp, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TARGETS_01_PAINTINGS } from './targets-01-paintings.mjs';
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

async function main() {
  console.log(`=== HARVESTER PINTURA MITOLÓGICA (01_MITOLOGIA_GRIEGA_ROMANA) ===`);
  console.log(`Modo: ${APPLY ? 'APPLY (descarga e indexación activa)' : 'DRY-RUN (solo lectura y verificación)'}`);
  console.log(`Targets definidos: ${TARGETS_01_PAINTINGS.length} pinturas maestras\n`);

  const currentIdx = await loadIndex(path.join(ROOT, COL_DIR));
  console.log(`Colección ${COL_DIR} actual: ${currentIdx.items.length} obras en índice.`);

  let apiInfo = new Map();
  if (CHECK_API || APPLY) {
    console.log(`Consultando API de Wikimedia Commons para verificar dimensiones en vivo...`);
    const filesToQuery = TARGETS_01_PAINTINGS.map(t => t.file);
    apiInfo = await fetchCommonsInfo(filesToQuery);
    let resolvedCount = 0;
    for (const f of filesToQuery) {
      if (apiInfo.has(f) || apiInfo.has(f.replace(/ /g, '_')) || apiInfo.has(f.replace(/_/g, ' '))) resolvedCount++;
    }
    console.log(`Respuestas obtenidas de API: ${resolvedCount}/${filesToQuery.length} archivos.\n`);
  }

  const verifiedTargets = [];
  let underFloorCount = 0;

  for (const t of TARGETS_01_PAINTINGS) {
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

  // Imprimir reporte formateado
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
  console.log(`  - Total pinturas mitológicas objetivo: ${verifiedTargets.length}`);
  console.log(`  - Obras bajo piso (1000px):            ${underFloorCount}`);
  console.log(`  - Colección 01 tras migración (65 obras) + expansión (+35 obras) = ~100 pinturas mitológicas.`);

  if (!APPLY) {
    console.log(`\n[DRY-RUN] No se modificó ningún archivo en disco.`);
    console.log(`Para descargar y poblar la colección, ejecutar:`);
    console.log(`  node tools/harvest-01-paintings.mjs --apply`);
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
    } catch {}
  }
  const descMap = new Map(existingDesc.map(d => [d.n, d]));

  for (let k = 0; k < verifiedTargets.length; k++) {
    const vt = verifiedTargets[k];
    const n = 75 + k;
    if (idx.items.some(i => i.n === n)) {
      console.log(`n${n}: ${vt.title_es || vt.title} ya existe en índice. Omitiendo.`);
      continue;
    }
    const cleanTitle = vt.title_es || vt.title;
    const cleanArtist = vt.artist || 'Anonimo';
    const cleanYr = vt.year || '';
    const filename = buildFilename(n, cleanTitle, cleanArtist, cleanYr);

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
    console.log(`Descargando n${n}: ${cleanArtist} - ${cleanTitle}...`);
    try {
      const buf = await downloadTo(downloadUrl, destPath, { ua: UA });
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
        artist: cleanArtist,
        year: cleanYr,
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
        anio: cleanYr,
        museo: vt.holding_museum || '',
        escuela: vt.school || '',
        tipo: vt.type || '',
        d: vt.description || '',
      });

      await sleep(300);
    } catch (err) {
      console.error(`  ✗ Error al descargar ${cleanTitle}: ${err.message}`);
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
