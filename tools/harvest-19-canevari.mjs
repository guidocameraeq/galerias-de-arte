// tools/harvest-19-canevari.mjs
// Herramienta de verificación y descarga para la colección 19_marcelo_canevari.
// Por defecto corre en DRY-RUN (no modifica disco ni descarga imágenes).
// Con --apply descarga imágenes y escribe el índice.
//
// Uso:
//   node tools/harvest-19-canevari.mjs         # Modo DRY-RUN
//   node tools/harvest-19-canevari.mjs --apply # Descarga y guarda en disco

import { promises as fsp, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TARGETS_19_CANEVARI } from './targets-19-canevari.mjs';
import {
  downloadTo, imgSize, orientationOf, buildFilename,
  loadIndex, saveIndex, sleep, MIN_LONG_SIDE
} from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COL_DIR = '19_marcelo_canevari';
const APPLY = process.argv.includes('--apply');

function getUA(url) {
  if (url.includes('wikimedia.org')) {
    return 'Arte-Collection/1.0 (+https://github.com/guidocameraeq/galerias-de-arte)';
  }
  return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
}

async function main() {
  console.log(`=== HARVESTER 19_MARCELO_CANEVARI ===`);
  console.log(`Modo: ${APPLY ? 'APPLY (descarga e indexación activa)' : 'DRY-RUN (solo lectura y verificación)'}`);
  console.log(`Targets definidos: ${TARGETS_19_CANEVARI.length} obras\n`);

  console.log(
    '#'.padEnd(4) +
    'Título'.padEnd(35) +
    'Fuente'.padEnd(20) +
    'Res. estimada'.padEnd(16) +
    'Orientación'
  );
  console.log('-'.repeat(85));

  for (const t of TARGETS_19_CANEVARI) {
    const numStr = `n${t.n.toString().padStart(2, '0')}`;
    const titleStr = (t.title_es || t.title).slice(0, 33).padEnd(35);
    const srcStr = (t.museum || '').slice(0, 18).padEnd(20);
    const resStr = `${t.expected_w}x${t.expected_h}`.padEnd(16);
    const estOri = orientationOf(t.expected_w, t.expected_h);
    console.log(`${numStr.padEnd(4)}${titleStr}${srcStr}${resStr}${estOri}`);
  }
  console.log('-'.repeat(85));

  if (!APPLY) {
    console.log(`\n[DRY-RUN] No se modificó ningún archivo en disco.`);
    console.log(`Para descargar y poblar la colección, ejecutar:`);
    console.log(`  node tools/harvest-19-canevari.mjs --apply`);
    return;
  }

  // --- EJECUCIÓN CON --APPLY ---
  const colPath = path.join(ROOT, COL_DIR);
  await fsp.mkdir(path.join(colPath, 'landscape'), { recursive: true });
  await fsp.mkdir(path.join(colPath, 'portrait'), { recursive: true });

  const idx = await loadIndex(colPath);
  idx.collection = COL_DIR;
  const byN = new Map((idx.items || []).map(i => [i.n, i]));

  let downloadedCount = 0;
  let skippedCount = 0;

  for (const t of TARGETS_19_CANEVARI) {
    const cleanTitle = t.title_es || t.title;
    const cleanArtist = t.artist || 'Marcelo Canevari';
    const cleanYr = t.year || '';
    const filename = buildFilename(t.n, cleanTitle, cleanArtist, cleanYr);

    // Si ya existe en disco y en el índice con dimensiones correctas, no re-descargar
    const existing = byN.get(t.n);
    if (existing && existing.file === filename) {
      const existingPath = path.join(colPath, existing.orientation, filename);
      if (existsSync(existingPath)) {
        console.log(`n${t.n}: ${cleanTitle} ya existe en disco. Omitiendo descarga.`);
        skippedCount++;
        continue;
      }
    }

    const estOrient = orientationOf(t.expected_w, t.expected_h);
    const destPath = path.join(colPath, estOrient, filename);
    const ua = getUA(t.image_url);

    console.log(`Descargando n${t.n}: ${cleanTitle}...`);
    try {
      const buf = await downloadTo(t.image_url, destPath, { ua, validate: true, retries: 3 });
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
  console.error('[ERROR FATAL]', err);
  process.exit(1);
});
