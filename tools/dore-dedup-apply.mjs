// Aplica el dedup VISUAL de la colección 17 (Doré). MUEVE (no borra) los 57 escaneos
// duplicados/junk a _dedup_removed/ (recuperable) y los saca del índice. Idempotente.
// La lista REMOVE proviene de la revisión visual canto por canto (hojas de contacto).
// Uso: node tools/dore-dedup-apply.mjs [--apply]
import { loadIndex, saveIndex, logDiscard } from './lib.mjs';
import { promises as fsp, existsSync } from 'node:fs';
import path from 'node:path';

const COL = '17_dore_divina_comedia';
const DEST = path.join(COL, '_dedup_removed');
const APPLY = process.argv.includes('--apply');

// n a remover (revisado visualmente). Se conserva el mejor escaneo full-bleed de cada plancha.
const REMOVE = [
  2, 3, 4, 5, 7, 10, 11, 13, 14, 15, 16, // Inf 1: duplicados de las 5 planchas (selva/leopardo/león/encuentro/roca)
  17,                                     // Inf 2: dup de n18
  21, 22, 24,                             // Inf 3: dups del Aqueronte (n20)
  25, 26, 27,                             // Inf 4: dups de los poetas (n28/n29)
  30,                                     // Inf 5: dup de los amantes (n39)
  44,                                     // Inf 6: dup Cerbero (n45)
  48,                                     // Inf 7: dup avaros (n50)
  51, 52, 54,                             // Inf 8: dups barca Estigia (n55)
  57,                                     // Inf 9: dup Furias (n56)
  61,                                     // Inf 13: dup suicidas (n60)
  63, 64,                                 // Inf 15: dups Brunetto (n65)
  66, 68,                                 // Inf 17: dups Gerión (n69)
  71,                                     // Inf 18: dup Tais (n70)
  74,                                     // Inf 19: dup simoníacos (n73)
  75, 76, 77, 78,                         // Inf 21: dups Malebranche (n79)
  81, 82,                                 // Inf 22: dups Ciampolo (n80)
  86, 87,                                 // Inf 24: dups ladrones (n88)
  90,                                     // Inf 25: dup metamorfosis (n89)
  92, 94,                                 // Inf 26: dups Ulises (n93)
  96,                                     // Inf 28: dup book-page (n95/n98)
  100,                                    // Inf 29: dup falsarios (n99)
  108, 109,                               // Inf 34: dups Lucifer (n107)
  111,                                    // Purg 1: JUNK (imagen de libro de astronomía 1904, no es Doré)
  113,                                    // Purg 2: dup ángel barquero (n114)
  120,                                    // Purg 16: dup humo iracundos (n121)
  122,                                    // Purg 19: dup avaros boca abajo (n123)
  127,                                    // Purg 24: dup árbol golosos (n128)
  137,                                    // Par 12: dup círculos de luz (n138)
  144,                                    // Par 21: dup Beatriz en nube (n146)
  150, 154, 155,                          // Par 31: dups Rosa Celeste (n153)
];

// GUARDA INCONDICIONAL (script de un solo uso ya ejecutado): REMOVE usa la numeración ORIGINAL (1..155), anterior
// al renumerado de dore-desc.mjs. Hoy la col 17 va de 1..N compacta: re-ejecutarlo movería obras EQUIVOCADAS
// (aunque se borre _dedup_removed/). Para sacar una obra: `node tools/remove-work.mjs <col> --n=N`.
console.log('ABORTADO: dore-dedup-apply.mjs es de un solo uso (ya aplicado; su lista usa numeración vieja). Usá tools/remove-work.mjs.');
process.exit(1);
const idx = await loadIndex(COL);
const rm = new Set(REMOVE);
const victims = idx.items.filter(it => rm.has(it.n));
console.log(`Índice: ${idx.items.length} obras. A mover: ${victims.length} (esperado 57). Quedarían: ${idx.items.length - victims.length}.`);
const missing = REMOVE.filter(n => !idx.items.some(it => it.n === n));
if (missing.length) console.log('  (aviso: n no encontrados, ¿ya movidos?):', missing.join(','));

if (!APPLY) { console.log('\nDRY. Re-ejecutar con --apply.'); process.exit(0); }

await fsp.mkdir(DEST, { recursive: true });
let moved = 0;
for (const it of victims) {
  const src = path.join(COL, it.orientation, it.file);
  const dst = path.join(DEST, it.file);
  if (existsSync(src)) { await fsp.rename(src, dst); moved++; }
  await logDiscard('.', COL, { reason: 'dup_visual', n: it.n, file: it.file, sourceId: it.sourceId, moved_to: '_dedup_removed' });
}
idx.items = idx.items.filter(it => !rm.has(it.n));
await saveIndex(COL, idx);
console.log(`\nAPLICADO: movidos ${moved} a ${DEST}. Índice ahora ${idx.items.length} obras.`);
console.log('Siguiente: node tools/dore-desc.mjs  (renumera 1..N, renombra, re-titula y re-describe, incl. n110->Canto 34).');
