// Poda de calidad de las colecciones del canon (07-12): elimina imágenes diminutas
// (min<300px o lado largo<800px) y duplicados de obra ENTRE colecciones (mismo qid, o
// autor+dimensiones exactas, o título+autor) contra todo lo ya presente. Renumera.
// Uso: node tools/prune-canon.mjs [--apply]
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { loadIndex, saveIndex } from './lib.mjs';

const APPLY = process.argv.includes('--apply');
const ALL = ['01_mitologia_griega_romana', '02_barroco', '03_gotico', '04_romanticismo', '05_egipcio', '06_macabro_memento_mori',
  '07_alto_renacimiento', '08_impresionismo', '09_postimpresionismo', '10_realismo', '11_rococo', '12_simbolismo_modernismo'];
const CANON = ALL.slice(6);
const norm = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const surname = (a) => norm(a).split(' ').filter(Boolean).pop() || '';
// dedup fiable: mismo item de Wikidata, o misma imagen (autor + dimensiones exactas).
// (NO por título: "Adele I/II" o las muchas "Sainte-Victoire" darían falsos positivos.)
const keysOf = (it) => [
  it.qid ? 'q:' + it.qid : null,
  `d:${surname(it.artist)}:${it.width}x${it.height}`,
].filter(Boolean);

const seen = new Set();
// 1) sembrar con TODO lo que no es canon (protegido: 01-06)
for (const c of ALL.slice(0, 6)) { try { const idx = await loadIndex(c); for (const it of idx.items) keysOf(it).forEach(k => seen.add(k)); } catch {} }

let totRemoved = 0;
for (const col of CANON) {
  const idx = await loadIndex(col);
  const kept = [], removed = [];
  for (const it of idx.items.sort((a, b) => a.n - b.n)) {
    const tooSmall = Math.min(it.width, it.height) < 300 || Math.max(it.width, it.height) < 800;
    const dup = keysOf(it).some(k => seen.has(k));
    if (tooSmall || dup) {
      removed.push({ it, why: tooSmall ? `chica ${it.width}x${it.height}` : 'dup entre colecciones' });
      // MOVER, no borrar (las imágenes no están en git): recuperable desde <col>/_dedup_removed/
      if (APPLY) { try { await fs.mkdir(path.join(col, '_dedup_removed'), { recursive: true }); await fs.rename(path.join(col, it.orientation, it.file), path.join(col, '_dedup_removed', it.file)); } catch {} }
    } else { kept.push(it); keysOf(it).forEach(k => seen.add(k)); }
  }
  // renumerar
  let k = 1;
  for (const it of kept) {
    const newN = k++;
    if (it.n !== newN) {
      const parts = it.file.split('_'); const nf = String(newN).padStart(2, '0') + '_' + parts.slice(1).join('_');
      if (APPLY) { try { await fs.rename(path.join(col, it.orientation, it.file), path.join(col, it.orientation, nf)); } catch (e) {} }
      it.file = nf;
    }
    it.n = newN;
  }
  if (removed.length) {
    console.log(`\n${col}: -${removed.length} (quedan ${kept.length})`);
    removed.forEach(r => console.log(`   ✗ #${r.it.n} ${(r.it.title_es || r.it.title).slice(0, 32)} — ${r.why}`));
  }
  totRemoved += removed.length;
  if (APPLY) { idx.items = kept; await saveIndex(col, idx); }
}
console.log(`\n${APPLY ? 'APLICADO' : 'DRY'}: ${totRemoved} obras podadas del canon.`);
