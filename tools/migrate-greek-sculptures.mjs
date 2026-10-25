// tools/migrate-greek-sculptures.mjs
// Migra las 9 esculturas clásicas grecorromanas de 01_mitologia_griega_romana a la nueva colección 18_escultura_griega.
// Por defecto corre en DRY-RUN; aplica cambios solo con --apply.
//
// Obras migradas:
//  1. Afrodita de Siracusa (01 n10)
//  2. Laocoonte y sus hijos (01 n66)
//  3. Venus de Milo (01 n67)
//  4. Victoria alada de Samotracia (01 n68)
//  5. Bronces de Riace (01 n69)
//  6. Discóbolo (01 n71)
//  7. Augusto de Prima Porta (01 n72)
//  8. Apolo del Belvedere (01 n73)
//  9. Gálata moribundo (01 n74)

import { promises as fsp, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadIndex, saveIndex, buildFilename } from './lib.mjs';
import { TARGETS_18_SCULPTURES } from './targets-18-sculptures.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPLY = process.argv.includes('--apply');
const SRC_COL = '01_mitologia_griega_romana';
const DST_COL = '18_escultura_griega';

const TARGET_NS = [10, 66, 67, 68, 69, 71, 72, 73, 74];

async function main() {
  console.log(`=== MIGRACIÓN DE ESCULTURAS CLÁSICAS (01 -> 18) ===`);
  console.log(`Modo: ${APPLY ? 'APPLY (modifica disco e índices)' : 'DRY-RUN (solo simulación)'}\n`);

  const srcIdx = await loadIndex(path.join(ROOT, SRC_COL));
  let dstIdx;
  try {
    dstIdx = await loadIndex(path.join(ROOT, DST_COL));
  } catch {
    dstIdx = { collection: DST_COL, items: [] };
  }

  const toMigrate = [];
  for (const n of TARGET_NS) {
    const item = srcIdx.items.find(x => x.n === n);
    if (!item) {
      console.warn(`[AVISO] No se encontró n${n} en ${SRC_COL}. ¿Ya fue migrado?`);
      continue;
    }
    toMigrate.push(item);
  }

  if (!toMigrate.length) {
    console.log(`No hay obras para migrar. Finalizando.`);
    return;
  }

  console.log(`Se encontraron ${toMigrate.length} obras para migrar de ${SRC_COL}:`);
  const plannedMoves = [];
  let newN = dstIdx.items.length ? Math.max(...dstIdx.items.map(i => i.n)) + 1 : 1;

  for (const item of toMigrate) {
    const targetN = newN++;
    const targetMeta = TARGETS_18_SCULPTURES.find(t => t.n === targetN);
    const cleanTitle = item.title_es || item.title;
    const cleanArtist = item.artist || 'Anonimo';
    const cleanYr = item.year || '';
    const newFileName = buildFilename(targetN, cleanTitle, cleanArtist, cleanYr);

    const oldFilePath = path.join(ROOT, SRC_COL, item.orientation, item.file);
    const newFilePath = path.join(ROOT, DST_COL, item.orientation, newFileName);

    const newItem = {
      ...item,
      n: targetN,
      file: newFileName,
      kind: 'escultura-canon',
      school: targetMeta?.school || item.school || 'Arte griego clásico',
      type: targetMeta?.type || item.type || 'Escultura en mármol',
      holding_museum: targetMeta?.holding_museum || item.holding_museum || null,
      description: targetMeta?.description || item.description,
      description_source: 'Síntesis (fundada en Wikipedia/curatoría)',
      license: targetMeta?.license || item.license || 'Dominio público',
    };

    plannedMoves.push({
      oldItem: item,
      newItem,
      oldFilePath,
      newFilePath,
      existsOnDisk: existsSync(oldFilePath),
    });

    console.log(`  - 01 n${item.n.toString().padStart(2, ' ')} -> 18 n${targetN.toString().padStart(2, ' ')}: "${cleanTitle}" (${item.orientation})`);
    console.log(`      Origen:  ${path.relative(ROOT, oldFilePath)} [${existsSync(oldFilePath) ? 'OK' : 'FALTA ARCHIVO'}]`);
    console.log(`      Destino: ${path.relative(ROOT, newFilePath)}`);
  }

  console.log(`\nResumen del plan:`);
  console.log(`  - ${SRC_COL}: pasará de ${srcIdx.items.length} obras a ${srcIdx.items.length - toMigrate.length} obras.`);
  console.log(`  - ${DST_COL}: pasará de ${dstIdx.items.length} obras a ${dstIdx.items.length + toMigrate.length} obras.`);

  if (!APPLY) {
    console.log(`\n[DRY-RUN] No se modificó ningún archivo. Ejecutá con --apply para efectuar la migración.`);
    return;
  }

  // --- EJECUCIÓN CON --APPLY ---
  console.log(`\nEjecutando migración física y actualización de índices...`);

  // 1. Asegurar carpetas de destino
  await fsp.mkdir(path.join(ROOT, DST_COL, 'landscape'), { recursive: true });
  await fsp.mkdir(path.join(ROOT, DST_COL, 'portrait'), { recursive: true });

  // 2. Mover archivos físicos
  for (const move of plannedMoves) {
    if (!move.existsOnDisk) {
      throw new Error(`Archivo origen no encontrado en disco: ${move.oldFilePath}`);
    }
    if (existsSync(move.newFilePath)) {
      throw new Error(`Archivo destino ya existe en disco: ${move.newFilePath}`);
    }
    await fsp.mkdir(path.dirname(move.newFilePath), { recursive: true });
    await fsp.rename(move.oldFilePath, move.newFilePath);
    console.log(`  ✓ Movido: ${path.basename(move.oldFilePath)} -> ${path.basename(move.newFilePath)}`);
  }

  // 3. Actualizar índice de destino (18_escultura_griega)
  for (const move of plannedMoves) {
    dstIdx.items.push(move.newItem);
  }
  dstIdx.items.sort((a, b) => a.n - b.n);
  await saveIndex(path.join(ROOT, DST_COL), dstIdx);
  console.log(`  ✓ Guardado índice de ${DST_COL} (${dstIdx.items.length} obras).`);

  // 4. Actualizar índice de origen (01_mitologia_griega_romana)
  const migratedOldNs = new Set(toMigrate.map(m => m.n));
  srcIdx.items = srcIdx.items.filter(item => !migratedOldNs.has(item.n));
  srcIdx.items.sort((a, b) => a.n - b.n);
  await saveIndex(path.join(ROOT, SRC_COL), srcIdx);
  console.log(`  ✓ Guardado índice de ${SRC_COL} (${srcIdx.items.length} obras restantes).`);

  // 5. Crear/actualizar tools/desc/18_escultura_griega.mjs
  const descFilePath = path.join(ROOT, 'tools', 'desc', `${DST_COL}.mjs`);
  let existingDesc = [];
  if (existsSync(descFilePath)) {
    try {
      const mod = await import(`file://${descFilePath}`);
      existingDesc = mod.default || [];
    } catch {}
  }
  const descByN = new Map(existingDesc.map(d => [d.n, d]));
  for (const move of plannedMoves) {
    if (!descByN.has(move.newItem.n)) {
      descByN.set(move.newItem.n, {
        n: move.newItem.n,
        titulo: move.newItem.title_es || move.newItem.title,
        anio: move.newItem.year || '',
        escuela: move.newItem.school || 'Arte griego clásico',
        tipo: move.newItem.type || 'Escultura en mármol',
        museo: move.newItem.holding_museum || '',
        d: move.newItem.description || '',
      });
    }
  }
  const mergedDesc = [...descByN.values()].sort((a, b) => a.n - b.n);
  const descContent = `// Descripciones curadas en español — ${DST_COL}
// Fichas históricas y curatoriales de escultura griega y obras maestras arqueológicas.
export default ${JSON.stringify(mergedDesc, null, 2)};
`;
  await fsp.writeFile(descFilePath, descContent, 'utf8');
  console.log(`  ✓ Fichas autoradas escritas en ${path.relative(ROOT, descFilePath)}`);

  // 6. Limpiar fichas de tools/desc/01_mitologia_griega_romana.mjs si tuvieran las obras migradas
  const srcDescPath = path.join(ROOT, 'tools', 'desc', `${SRC_COL}.mjs`);
  if (existsSync(srcDescPath)) {
    try {
      const srcMod = await import(`file://${srcDescPath}`);
      const srcDesc = srcMod.default || [];
      const cleaned = srcDesc.filter(d => !migratedOldNs.has(d.n));
      if (cleaned.length !== srcDesc.length) {
        const cleanedContent = `// Descripciones autoradas (es) — colección 01 Mitología.\nexport default ${JSON.stringify(cleaned, null, 2)};\n`;
        await fsp.writeFile(srcDescPath, cleanedContent, 'utf8');
        console.log(`  ✓ Fichas de ${SRC_COL} limpiadas (${srcDesc.length - cleaned.length} removidas).`);
      }
    } catch {}
  }

  console.log(`\nMigración completada exitosamente.`);
}

main().catch(err => {
  console.error(`\n[ERROR FATAL]`, err);
  process.exit(1);
});
