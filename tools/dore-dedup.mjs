// Dedup VISUAL de la colección 17 (Doré) sobre los full-res REALES con dHash 16x16 (240 bits),
// mucho más discriminante que el aHash 8x8 (los grabados de Doré comparten layout tonal y el
// hash grueso los confundía). Calibrado con pares conocidos: dup verdadero vs plancha distinta.
// Uso: node tools/dore-dedup.mjs [--th=N] [--apply]
import { loadIndex, saveIndex, logDiscard } from './lib.mjs';
import { promises as fsp, existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const COL = '17_dore_divina_comedia';
const APPLY = process.argv.includes('--apply');
const TH = +((process.argv.find(a => a.startsWith('--th=')) || '').split('=')[1] || 18);

// dHash: gris 17x16, bit = px > px-a-su-derecha  => 16*16 = 256 bits
async function dHash(fp) {
  try {
    const W = 17, H = 16;
    const buf = await sharp(fp).greyscale().resize(W, H, { fit: 'fill' }).raw().toBuffer();
    const bits = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W - 1; x++) bits.push(buf[y * W + x] > buf[y * W + x + 1] ? 1 : 0);
    return bits; // 256 bits
  } catch { return null; }
}
const ham = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d; };

const idx = await loadIndex(COL);
const recs = [];
for (const it of idx.items) {
  const fp = path.join(COL, it.orientation, it.file);
  recs.push({ it, h: existsSync(fp) ? await dHash(fp) : null, px: (it.width || 0) * (it.height || 0) });
}
const byN = (n) => recs.find(r => r.it.n === n);
const dist = (a, b) => { const x = byN(a), y = byN(b); return (x?.h && y?.h) ? ham(x.h, y.h) : 'NA'; };
console.log('CALIBRACIÓN (dHash 256 bits):');
console.log('  dups verdaderos:  108~109 =', dist(108, 109), '|  44~45 =', dist(44, 45));
console.log('  planchas distintas: 48~49 =', dist(48, 49), '| 130~131 =', dist(130, 131), '| 20~24 =', dist(20, 24), '| 20~22 =', dist(20, 22));

const parent = recs.map((_, i) => i);
const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
for (let i = 0; i < recs.length; i++) for (let j = i + 1; j < recs.length; j++) {
  if (recs[i].h && recs[j].h && ham(recs[i].h, recs[j].h) <= TH) parent[find(i)] = find(j);
}
const groups = new Map();
for (let i = 0; i < recs.length; i++) { const r = find(i); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(i); }
const clusters = [...groups.values()].filter(g => g.length > 1);

console.log(`\nUmbral Hamming <= ${TH}. Clusters: ${clusters.length}`);
let toRemove = [];
for (const g of clusters) {
  const sorted = g.map(i => recs[i]).sort((a, b) => b.px - a.px || (b.it.bytes || 0) - (a.it.bytes || 0));
  console.log(`\n— Cluster (${g.length}):`);
  for (let k = 0; k < sorted.length; k++) {
    const r = sorted[k];
    const dd = sorted.filter(s => s !== r).map(s => ham(r.h, s.h));
    console.log(`   ${k === 0 ? 'KEEP' : 'DUP '} n${String(r.it.n).padStart(3)} ${r.it.width}x${r.it.height} d=[${dd.join(',')}]  ${r.it.file.slice(0, 48)}`);
    if (k > 0) toRemove.push(r.it);
  }
}
console.log(`\nA eliminar (si --apply): ${toRemove.length}. Quedarían ${idx.items.length - toRemove.length} obras.`);

if (APPLY && toRemove.length) {
  const rm = new Set(toRemove.map(it => it.n));
  for (const it of toRemove) {
    const fp = path.join(COL, it.orientation, it.file);
    if (existsSync(fp)) await fsp.rm(fp).catch(() => {});
    await logDiscard('.', COL, { reason: 'dup_visual', n: it.n, file: it.file, sourceId: it.sourceId });
  }
  idx.items = idx.items.filter(it => !rm.has(it.n));
  await saveIndex(COL, idx);
  console.log(`APLICADO: eliminados ${toRemove.length}. Re-correr dore-desc.mjs para renumerar.`);
} else if (!APPLY) console.log('DRY. Revisar antes de --apply.');
