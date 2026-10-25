// Saca UNA obra de una colección SIN perderla (regla del proyecto: mover, nunca borrar):
//   · MUEVE el archivo a <col>/_dedup_removed/ (recuperable; las imágenes no están en git)
//   · la quita del _index.json (NO renumera: los n quedan con hueco, es válido)
//   · registra el descarte en _descartes/<col>.jsonl
//   · quita su entrada de tools/desc/<col>.mjs (esas fichas se vuelcan POR n; si quedara, la próxima obra con ese n la heredaría)
// Dry-run por defecto. Uso:
//   node tools/remove-work.mjs <colDir> (--n=N | --sourceId=ID) [--why=dup|baja_calidad|fuera_de_tema|error|otro] [--note="texto"] [--apply]
// Después: node tools/audit.mjs
import { promises as fsp, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadIndex, saveIndex, logDiscard } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = (k) => (args.find(a => a.startsWith(`--${k}=`)) || '').slice(k.length + 3);
const APPLY = args.includes('--apply');
const colDir = args.find(a => !a.startsWith('--'));
const nArg = arg('n'), sidArg = arg('sourceId');
const why = (arg('why') || 'otro').replace(/[^a-z_]/gi, '').toLowerCase() || 'otro';
const note = arg('note');
const die = (m) => { console.error('ERROR: ' + m); process.exit(1); };

if (!colDir || (!nArg && !sidArg)) die('uso: node tools/remove-work.mjs <colDir> (--n=N | --sourceId=ID) [--why=…] [--note="…"] [--apply]');
if (!/^\d{2}_/.test(colDir) || !existsSync(path.join(ROOT, colDir, '_index.json'))) die(`no existe la colección "${colDir}" (usá el nombre completo, p.ej. 11_rococo)`);

const colAbs = path.join(ROOT, colDir);
const idx = await loadIndex(colAbs);
const hits = idx.items.filter(it => nArg ? it.n === Number(nArg) : it.sourceId === sidArg);
if (hits.length !== 1) die(`la selección dio ${hits.length} obras (se espera exactamente 1)`);
const it = hits[0];
const src = path.join(colAbs, it.orientation, it.file);
const destDir = path.join(colAbs, '_dedup_removed');
let dest = path.join(destDir, it.file);
if (existsSync(dest)) dest = path.join(destDir, `n${it.n}__${it.file}`);   // no pisar un apartado previo

// ---- entrada de tools/desc/<col>.mjs (por n) ----
const descPath = path.join(ROOT, 'tools', 'desc', `${colDir}.mjs`);
let descPlan = null;
if (existsSync(descPath)) {
  const lines = (await fsp.readFile(descPath, 'utf8')).split('\n');
  const starts = [];
  lines.forEach((l, i) => {
    const m = l.match(/^  \{\s*"?n"?:\s*(\d+),/);
    if (m) {
      starts.push({ n: +m[1], from: i });
    } else if (/^  \{/.test(l) && i + 1 < lines.length) {
      const mNext = lines[i + 1].match(/^\s*"?n"?:\s*(\d+),/);
      if (mNext) starts.push({ n: +mNext[1], from: i });
    }
  });
  const end = lines.findIndex(l => l.startsWith('];'));
  const k = starts.findIndex(s => s.n === it.n);
  if (k >= 0) { const to = (k + 1 < starts.length ? starts[k + 1].from : end) - 1; descPlan = { lines, from: starts[k].from, to, total: starts.length }; }
}

console.log(`${APPLY ? 'APLICANDO' : 'DRY-RUN'} · ${colDir} n${it.n} · "${it.title_es || it.title}" — ${it.artist} · ${it.width}x${it.height}`);
console.log(`  archivo : ${it.orientation}/${it.file}${existsSync(src) ? '' : '   (¡no existe en disco!)'}`);
console.log(`  moverlo : → ${path.relative(ROOT, dest).replace(/\\/g, '/')}`);
console.log(`  índice  : se quita el item (los n NO se renumeran) · descarte "${why}" en _descartes/${colDir}.jsonl`);
console.log(`  ficha   : ${descPlan ? `se quita la entrada n=${it.n} de tools/desc/${colDir}.mjs` : 'no hay entrada en tools/desc/ para este n'}`);
if (!APPLY) { console.log('\nNo se tocó nada. Re-ejecutá con --apply.'); process.exit(0); }

await fsp.mkdir(destDir, { recursive: true });
if (existsSync(src)) await fsp.rename(src, dest);
idx.items = idx.items.filter(x => x !== it);
await saveIndex(colAbs, idx);
await logDiscard(ROOT, colDir, { reason: why, n: it.n, file: it.file, sourceId: it.sourceId ?? null, qid: it.qid ?? null, title: it.title_es || it.title, note: note || undefined, moved_to: '_dedup_removed' });

if (descPlan) {
  const out = descPlan.lines.filter((_, i) => i < descPlan.from || i > descPlan.to).join('\n');
  const tmp = descPath.replace(/\.mjs$/, `.tmp-${process.pid}.mjs`);
  await fsp.writeFile(tmp, out);
  try {
    const mod = await import(pathToFileURL(tmp).href);
    if ((mod.default || []).length !== descPlan.total - 1) throw new Error('cantidad de entradas inesperada');
    await fsp.rename(tmp, descPath);
    console.log(`  ficha   : entrada n=${it.n} quitada de tools/desc/${colDir}.mjs`);
  } catch (e) {
    await fsp.rm(tmp, { force: true });
    console.log(`  ⚠ NO pude quitar la entrada de tools/desc/${colDir}.mjs (${e.message}); quitala a mano o audit avisará W-DESC-STALE.`);
  }
}
console.log('\nListo. Verificá con: node tools/audit.mjs');
