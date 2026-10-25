// tools/harvest-21-gonsalves.mjs
// Herramienta de verificación y descarga para la colección 21_rob_gonsalves.
// Por defecto corre en DRY-RUN (no modifica disco ni descarga imágenes).
// Con --apply descarga imágenes y escribe el índice.
//
// Uso:
//   node tools/harvest-21-gonsalves.mjs         # Modo DRY-RUN
//   node tools/harvest-21-gonsalves.mjs --apply # Descarga y guarda en disco

import { promises as fsp, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TARGETS_21_GONSALVES } from './targets-21-gonsalves.mjs';
import {
  downloadTo, imgSize, orientationOf, buildFilename,
  loadIndex, saveIndex, sleep, MIN_LONG_SIDE
} from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COL_DIR = '21_rob_gonsalves';
const APPLY = process.argv.includes('--apply');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function main() {
  console.log(`=== HARVESTER 21_ROB_GONSALVES ===`);
  console.log(`Modo: ${APPLY ? 'APPLY (descarga e indexación activa)' : 'DRY-RUN (solo lectura y verificación)'}`);
  console.log(`Targets definidos: ${TARGETS_21_GONSALVES.length} obras\n`);

  console.log(
    '#'.padEnd(4) +
    'Título'.padEnd(38) +
    'Fuente'.padEnd(24) +
    'Res. estimada'.padEnd(16) +
    'Orientación'
  );
  console.log('-'.repeat(92));

  for (const t of TARGETS_21_GONSALVES) {
    const numStr = `n${t.n.toString().padStart(2, '0')}`;
    const titleStr = (t.title_es || t.title).slice(0, 36).padEnd(38);
    const srcStr = (t.museum || '').slice(0, 22).padEnd(24);
    const resStr = `${t.expected_w}x${t.expected_h}`.padEnd(16);
    const estOri = orientationOf(t.expected_w, t.expected_h);
    console.log(`${numStr.padEnd(4)}${titleStr}${srcStr}${resStr}${estOri}`);
  }
  console.log('-'.repeat(92));

  if (!APPLY) {
    console.log(`\n[DRY-RUN] No se modificó ningún archivo en disco.`);
    console.log(`Para descargar y poblar la colección, ejecutar:`);
    console.log(`  node tools/harvest-21-gonsalves.mjs --apply`);
    return;
  }

  // --- EJECUCIÓN CON --APPLY ---
  const colPath = path.join(ROOT, COL_DIR);
  await fsp.mkdir(path.join(colPath, 'landscape'), { recursive: true });
  await fsp.mkdir(path.join(colPath, 'portrait'), { recursive: true });

  let idx;
  try {
    idx = await loadIndex(colPath);
  } catch {
    idx = { collection: COL_DIR, items: [] };
  }
  idx.collection = COL_DIR;
  if (!Array.isArray(idx.items)) idx.items = [];
  const byN = new Map(idx.items.map(i => [i.n, i]));

  let downloadedCount = 0;
  let skippedCount = 0;

  for (const t of TARGETS_21_GONSALVES) {
    const cleanTitle = t.title_es || t.title;
    const cleanArtist = t.artist || 'Rob Gonsalves';
    const cleanYr = t.year || '';
    const filename = buildFilename(t.n, cleanTitle, cleanArtist, cleanYr);

    // Si ya existe en disco (en landscape o portrait), verificarlo y evitar re-descarga innecesaria
    const existing = byN.get(t.n);
    const diskLandscape = path.join(colPath, 'landscape', filename);
    const diskPortrait = path.join(colPath, 'portrait', filename);
    const diskPath = existsSync(diskLandscape) ? diskLandscape : (existsSync(diskPortrait) ? diskPortrait : null);

    if (diskPath) {
      const diskOrient = path.basename(path.dirname(diskPath));
      let sz = null;
      let bufLen = 0;

      if (existing && existing.file === filename && existing.width && existing.height && existing.orientation === diskOrient) {
        sz = { w: existing.width, h: existing.height };
        bufLen = existing.bytes || (await fsp.stat(diskPath)).size;
      } else {
        const buf = await fsp.readFile(diskPath);
        sz = imgSize(buf);
        bufLen = buf.length;
      }

      if (sz && sz.w && sz.h) {
        const realOrient = orientationOf(sz.w, sz.h);
        if (realOrient !== diskOrient) {
          const correctDest = path.join(colPath, realOrient, filename);
          await fsp.rename(diskPath, correctDest);
        }
        byN.set(t.n, {
          ...(existing || {}),
          n: t.n,
          file: filename,
          orientation: realOrient,
          title: t.title,
          title_es: t.title_es,
          artist: cleanArtist,
          year: cleanYr,
          school: t.school,
          type: t.type,
          holding_museum: t.holding_museum,
          museum_confidence: 'fuente',
          museum: t.museum,
          license: t.license,
          source_url: t.source_url,
          image_url: t.image_url,
          width: sz.w,
          height: sz.h,
          bytes: bufLen,
          sourceId: t.sourceId,
          kind: 'named',
          description: existing?.description || t.description,
          description_source: existing?.description_source || t.description_source
        });
        console.log(`n${t.n}: ${cleanTitle} ya existe en disco (${realOrient}). Metadata sincronizada.`);
        skippedCount++;
        continue;
      }
    }

    const estOrient = orientationOf(t.expected_w, t.expected_h);
    const destPath = path.join(colPath, estOrient, filename);

    console.log(`Descargando n${t.n}: ${cleanTitle}...`);
    try {
      const buf = await downloadTo(t.image_url, destPath, { ua: USER_AGENT, validate: true, retries: 3 });
      const sz = imgSize(buf);
      if (!sz || !sz.w || !sz.h) {
        throw new Error(`No se pudieron determinar las dimensiones del archivo descargado (${buf.length} bytes)`);
      }

      const realOrient = orientationOf(sz.w, sz.h);
      if (realOrient !== estOrient) {
        const correctDest = path.join(colPath, realOrient, filename);
        await fsp.rename(destPath, correctDest);
      }

      const longSide = Math.max(sz.w, sz.h);
      if (longSide < MIN_LONG_SIDE) {
        console.warn(`  [AVISO] n${t.n} resolución ${sz.w}x${sz.h} bajo el piso de ${MIN_LONG_SIDE}px`);
      }

      byN.set(t.n, {
        n: t.n,
        file: filename,
        orientation: realOrient,
        title: t.title,
        title_es: t.title_es,
        artist: cleanArtist,
        year: cleanYr,
        school: t.school,
        type: t.type,
        holding_museum: t.holding_museum,
        museum_confidence: 'fuente',
        museum: t.museum,
        license: t.license,
        source_url: t.source_url,
        image_url: t.image_url,
        width: sz.w,
        height: sz.h,
        bytes: buf.length,
        sourceId: t.sourceId,
        kind: 'named',
        description: t.description,
        description_source: t.description_source
      });

      console.log(`  ✓ Guardado: ${filename} (${sz.w}x${sz.h}, ${realOrient}, ${(buf.length / 1024).toFixed(0)} KB)`);
      downloadedCount++;
      await sleep(300);
    } catch (err) {
      console.error(`  ✗ Error al descargar n${t.n} (${cleanTitle}): ${err.message}`);
      throw err;
    }
  }

  idx.items = [...byN.values()].sort((a, b) => a.n - b.n);
  await saveIndex(colPath, idx);

  console.log(`\n=== PROCESO COMPLETADO ===`);
  console.log(`Descargadas: ${downloadedCount}`);
  console.log(`Omitidas (ya existían): ${skippedCount}`);
  console.log(`Total en índice: ${idx.items.length} obras`);
}

main().catch(err => {
  console.error('\nERROR FATAL:', err);
  process.exit(1);
});
