// Re-mide cada archivo desde el disco (fuente de verdad) y corrige width/height/bytes
// en _index.json. Si la orientación real no coincide con la carpeta, mueve el archivo.
// Uso: node tools/fix-dims.mjs <colDir> [--apply]
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { imgSize, orientationOf, resolveColDir } from './lib.mjs';

const colArg = process.argv[2] || '01_mitologia_griega_romana';
const colDir = resolveColDir('.', colArg);
const APPLY = process.argv.includes('--apply');
const idxPath = path.join(colDir, '_index.json');
const idx = JSON.parse(await fs.readFile(idxPath, 'utf8'));

let fixedDims = 0, moved = 0, errs = 0;
for (const it of idx.items) {
  const p = path.join(colDir, it.orientation, it.file);
  let buf;
  try { buf = await fs.readFile(p); } catch { console.log(`ERR no existe: ${it.file}`); errs++; continue; }
  const sz = imgSize(buf);
  if (!sz) { console.log(`ERR no se pudo medir: ${it.file}`); errs++; continue; }
  const realOrient = orientationOf(sz.w, sz.h);
  if (sz.w !== it.width || sz.h !== it.height) {
    console.log(`#${it.n} dims ${it.width}x${it.height} -> ${sz.w}x${sz.h}  (${it.file})`);
    it.width = sz.w; it.height = sz.h; it.bytes = buf.length; fixedDims++;
  }
  if (realOrient !== it.orientation) {
    const newP = path.join(colDir, realOrient, it.file);
    console.log(`#${it.n} MOVER ${it.orientation} -> ${realOrient}  (${it.file})`);
    if (APPLY) { await fs.mkdir(path.dirname(newP), { recursive: true }); await fs.rename(p, newP); }
    it.orientation = realOrient; moved++;
  }
}
console.log(`\n${APPLY ? 'APLICADO' : 'DRY'}: dims corregidas=${fixedDims}, movidos=${moved}, errores=${errs}, total=${idx.items.length}`);
if (APPLY) { await fs.writeFile(idxPath, JSON.stringify(idx, null, 2)); console.log('_index.json actualizado.'); }
