// Poda colecciones modernas: saca obras con lado largo < min (default 1000) y/o una
// lista manual de n, y renumera. Uso: node tools/prune-modern.mjs <col> [--min=1000] [--remove=1,2] [--apply]
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { loadIndex, saveIndex } from './lib.mjs';

const col = process.argv[2];
const APPLY = process.argv.includes('--apply');
const MIN = Number((process.argv.find(a => a.startsWith('--min=')) || '').split('=')[1]) || 1000;
const REMOVE = new Set(((process.argv.find(a => a.startsWith('--remove=')) || '').split('=')[1] || '').split(',').filter(Boolean).map(Number));

const idx = await loadIndex(col);
const kept = [], removed = [];
for (const it of idx.items.sort((a, b) => a.n - b.n)) {
  const small = Math.max(it.width, it.height) < MIN;
  if (small || REMOVE.has(it.n)) {
    removed.push(`#${it.n} ${(it.title_es || it.title).slice(0, 30)} (${it.width}x${it.height}${REMOVE.has(it.n) ? ', manual' : ''})`);
    // MOVER, no borrar (las imágenes no están en git): recuperable desde <col>/_dedup_removed/
    if (APPLY) { try { await fs.mkdir(path.join(col, '_dedup_removed'), { recursive: true }); await fs.rename(path.join(col, it.orientation, it.file), path.join(col, '_dedup_removed', it.file)); } catch {} }
  } else kept.push(it);
}
let k = 1;
for (const it of kept) {
  const newN = k++;
  if (it.n !== newN) {
    const parts = it.file.split('_'); const nf = String(newN).padStart(2, '0') + '_' + parts.slice(1).join('_');
    if (APPLY) { try { await fs.rename(path.join(col, it.orientation, it.file), path.join(col, it.orientation, nf)); } catch {} }
    it.file = nf;
  }
  it.n = newN;
}
console.log(`${col}: -${removed.length} (quedan ${kept.length})`);
removed.forEach(r => console.log('  ✗', r));
if (APPLY) { idx.items = kept; await saveIndex(col, idx); }
console.log(APPLY ? 'APLICADO' : 'DRY');
