// Dry-run: resuelve los targets nombrados y reporta, sin descargar.
import { TARGETS_01 } from './targets-01.mjs';
import { resolveTarget } from './resolve.mjs';
import { MIN_LONG_SIDE } from './lib.mjs';

const pad = (s, n) => String(s ?? '').slice(0, n).padEnd(n);
let ok = 0, low = 0, miss = 0;
console.log('n  src  ' + pad('target', 34) + ' -> ' + pad('encontrado', 40) + '  dims        long  status');
for (const t of TARGETS_01) {
  let hit = null, err = null;
  try { hit = await resolveTarget(t); } catch (e) { err = e.message; }
  if (!hit) { miss++; console.log(`${pad(t.n,2)} ${pad(t.src,4)} ${pad(t.title+' / '+t.artist,34)} -> ${err ? 'ERROR: '+err : 'NO MATCH'}`); continue; }
  const longSide = Math.max(hit.w, hit.h);
  const status = longSide >= MIN_LONG_SIDE ? 'OK' : `LOW(<${MIN_LONG_SIDE})`;
  if (longSide >= MIN_LONG_SIDE) ok++; else low++;
  console.log(`${pad(t.n,2)} ${pad(t.src,4)} ${pad(t.title+' / '+t.artist,34)} -> ${pad(hit.title+' / '+hit.artist.replace(/<[^>]+>/g,''),40)} ${pad(hit.w+'x'+hit.h,11)} ${pad(longSide,5)} ${status} [${hit.license.slice(0,18)}]`);
}
console.log(`\nResumen targets: OK=${ok}  LOW=${low}  NO_MATCH/ERR=${miss}  (total ${TARGETS_01.length})`);
