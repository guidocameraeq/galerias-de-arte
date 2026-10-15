// Pasada de seguridad re-ejecutable: re-normaliza title/artist/year en _index.json
// (con las funciones de lib.mjs) y renombra los archivos en disco. Idempotente.
// Uso: node tools/cleanup-names.mjs <colDir> [--apply]   (sin --apply = dry)
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { buildFilename, cleanTitle, cleanArtist, cleanYear } from './lib.mjs';

const colDir = process.argv[2] || '01_mitologia_griega_romana';
const APPLY = process.argv.includes('--apply');
const idxPath = path.join(colDir, '_index.json');
const idx = JSON.parse(await fs.readFile(idxPath, 'utf8'));

let renamed = 0, changed = 0;
for (const it of idx.items) {
  const title = cleanTitle(it.title), artist = cleanArtist(it.artist), year = cleanYear(it.year);
  const newFile = buildFilename(it.n, title, artist, year);
  const metaChanged = title !== it.title || artist !== it.artist || year !== (it.year || '');
  if (newFile !== it.file) {
    console.log(`#${it.n} RENAME\n   ${it.file}\n-> ${newFile}`);
    if (APPLY) {
      try { await fs.rename(path.join(colDir, it.orientation, it.file), path.join(colDir, it.orientation, newFile)); }
      catch (e) { console.log('   (rename err:', e.message, ')'); }
    }
    renamed++;
  } else if (metaChanged) console.log(`#${it.n} meta-only: artist="${artist}" year="${year}"`);
  if (metaChanged || newFile !== it.file) changed++;
  it.title = title; it.artist = artist; it.year = year; it.file = newFile;
}
console.log(`\n${APPLY ? 'APLICADO' : 'DRY'}: ${renamed} renombres, ${changed} con cambios de ${idx.items.length}.`);
if (APPLY) { await fs.writeFile(idxPath, JSON.stringify(idx, null, 2)); console.log('_index.json actualizado.'); }
