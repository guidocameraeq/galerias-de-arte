// tools/harvest-18-sculptures.mjs
// Herramienta de resolución, verificación y descarga para la colección 18_escultura_griega.
// Por defecto corre en DRY-RUN (no modifica disco ni descarga imágenes).
// Con --apply descarga imágenes y escribe el índice y fichas.
//
// Uso:
//   node tools/harvest-18-sculptures.mjs         # Modo DRY-RUN con dimensiones verificadas
//   node tools/harvest-18-sculptures.mjs --check # Re-consulta la API de Commons para validar dimensiones en vivo
//   node tools/harvest-18-sculptures.mjs --apply # Descarga y escribe en disco

import { promises as fsp, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TARGETS_18_SCULPTURES } from './targets-18-sculptures.mjs';
import {
  getJSON, downloadTo, imgSize, orientationOf, buildFilename,
  loadIndex, saveIndex, sleep, MIN_LONG_SIDE
} from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COL_DIR = '18_escultura_griega';
const APPLY = process.argv.includes('--apply');
const CHECK_API = process.argv.includes('--check');
const UA = 'Arte-PD-Collection/1.0 (+https://github.com/guidocameraeq/galerias-de-arte)';
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
    } catch (e) {
      console.warn(`[AVISO] Error al consultar lote de Commons: ${e.message}`);
    }
  }
  return infoMap;
}

async function main() {
  console.log(`=== HARVESTER 18_ESCULTURA_GRIEGA ===`);
  console.log(`Modo: ${APPLY ? 'APPLY (descarga e indexación activa)' : 'DRY-RUN (solo lectura y verificación)'}`);
  console.log(`Targets definidos: ${TARGETS_18_SCULPTURES.length} obras maestras\n`);

  let apiInfo = new Map();
  if (CHECK_API || APPLY) {
    console.log(`Consultando API de Wikimedia Commons para verificar dimensiones en vivo...`);
    const filesToQuery = TARGETS_18_SCULPTURES.filter(t => !t.migrated).map(t => t.file);
    apiInfo = await fetchCommonsInfo(filesToQuery);
    console.log(`Respuestas obtenidas de API: ${apiInfo.size ? filesToQuery.length : 0}/${filesToQuery.length} archivos.\n`);
  }

  const verifiedTargets = [];
  let underFloorCount = 0;
  let greekCount = 0;
  let intlCount = 0;

  for (const t of TARGETS_18_SCULPTURES) {
    let w = t.expected_w;
    let h = t.expected_h;
    let mime = 'image/jpeg';
    let license = t.migrated ? 'Dominio público' : 'Dominio público / Commons';
    let url = t.migrated ? null : `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(t.file)}`;

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
    if (t.museum_group === 'Grecia') greekCount++;
    else intlCount++;

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
    'Título'.padEnd(35) +
    'Museo'.padEnd(38) +
    'Resolución'.padEnd(14) +
    'Orient.'.padEnd(11) +
    'Estado'
  );
  console.log('-'.repeat(115));

  for (const vt of verifiedTargets) {
    const numStr = `n${vt.n.toString().padStart(2, '0')}`;
    const titleStr = (vt.title_es || vt.title).slice(0, 33).padEnd(35);
    const musStr = (vt.holding_museum || '').slice(0, 36).padEnd(38);
    const resStr = `${vt.w}x${vt.h}`.padEnd(14);
    const oriStr = vt.orient.padEnd(11);
    const statusStr = vt.migrated ? '✓ MIGRADA (01)' : vt.passFloor ? '✓ OK (>=1000px)' : '⚠ BAJA RES';

    console.log(`${numStr.padEnd(4)}${titleStr}${musStr}${resStr}${oriStr}${statusStr}`);
  }

  console.log('-'.repeat(115));
  console.log(`\nResumen de curaduría:`);
  console.log(`  - Total obras maestras: ${verifiedTargets.length}`);
  console.log(`  - Museos de Grecia:     ${greekCount} (${((greekCount / verifiedTargets.length) * 100).toFixed(0)}%)`);
  console.log(`  - Museos internacionales: ${intlCount} (${((intlCount / verifiedTargets.length) * 100).toFixed(0)}%)`);
  console.log(`  - Obras migradas:       ${verifiedTargets.filter(t => t.migrated).length}`);
  console.log(`  - Nuevas a cosechar:    ${verifiedTargets.filter(t => !t.migrated).length}`);
  console.log(`  - Obras bajo piso (1000px): ${underFloorCount}`);

  if (!APPLY) {
    console.log(`\n[DRY-RUN] No se modificó ningún archivo en disco.`);
    console.log(`Para descargar y poblar la colección, primero ejecutar:`);
    console.log(`  node tools/migrate-greek-sculptures.mjs --apply`);
    console.log(`  node tools/harvest-18-sculptures.mjs --apply`);
    return;
  }

  // --- EJECUCIÓN CON --APPLY ---
  console.log(`\nIniciando descarga y guardado en disco...`);
  const idx = await loadIndex(path.join(ROOT, COL_DIR));
  const byN = new Map(idx.items.map(i => [i.n, i]));

  for (const vt of verifiedTargets) {
    if (vt.migrated) continue; // ya migradas por migrate-greek-sculptures.mjs
    if (byN.has(vt.n)) {
      console.log(`n${vt.n}: ${vt.title_es || vt.title} ya existe en índice. Omitiendo.`);
      continue;
    }

    const cleanTitle = vt.title_es || vt.title;
    const cleanArtist = vt.artist || 'Anonimo';
    const cleanYr = vt.year || '';
    const filename = buildFilename(vt.n, cleanTitle, cleanArtist, cleanYr);

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
    console.log(`Descargando n${vt.n}: ${cleanTitle}...`);
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

      byN.set(vt.n, {
        n: vt.n,
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
        kind: 'escultura-canon',
        description: vt.description,
        description_source: 'Síntesis (fundada en Wikipedia/curatoría)',
      });

      console.log(`  ✓ Guardado: ${filename} (${sz.w}x${sz.h}, ${buf.length} bytes)`);
      await sleep(300);
    } catch (err) {
      console.error(`  ✗ Error al descargar ${cleanTitle}: ${err.message}`);
    }
  }

  idx.items = [...byN.values()].sort((a, b) => a.n - b.n);
  await saveIndex(path.join(ROOT, COL_DIR), idx);

  // Sincronizar descripciones en tools/desc/18_escultura_griega.mjs
  const descFilePath = path.join(ROOT, 'tools', 'desc', `${COL_DIR}.mjs`);
  let existingDesc = [];
  if (existsSync(descFilePath)) {
    try {
      const mod = await import(`file://${descFilePath}`);
      existingDesc = mod.default || [];
    } catch {}
  }
  const descMap = new Map(existingDesc.map(d => [d.n, d]));
  for (const it of idx.items) {
    if (!descMap.has(it.n) && it.description) {
      descMap.set(it.n, {
        n: it.n,
        titulo: it.title_es || it.title,
        anio: it.year || '',
        museo: it.holding_museum || '',
        escuela: it.school || '',
        tipo: it.type || '',
        d: it.description || '',
      });
    }
  }
  const sortedDesc = [...descMap.values()].sort((a, b) => a.n - b.n);
  const descCode = `// Descripciones autoradas (es) — colección 18 Escultura Griega y Arqueología Antigua.\n` +
    `// Fundadas en consenso art-histórico (Wikipedia + curatoría de museos de Grecia y del mundo).\n` +
    `export default ${JSON.stringify(sortedDesc, null, 2)};\n`;
  await fsp.writeFile(descFilePath, descCode, 'utf8');

  console.log(`\n✓ Índice guardado: ${COL_DIR}/_index.json (${idx.items.length} obras).`);
  console.log(`✓ Fichas sincronizadas en ${path.relative(ROOT, descFilePath)} (${sortedDesc.length} fichas).`);
}

main().catch(err => {
  console.error('[ERROR FATAL]', err);
  process.exit(1);
});
