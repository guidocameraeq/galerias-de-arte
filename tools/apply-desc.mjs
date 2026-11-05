// Vuelca descripciones AUTORADAS (archivo tools/desc/<colDir>.mjs) al _index.json.
// Setea description (es), title_es, year, holding_museum, school, type y artist cuando el dato venga curado.
// Cada entrada se clava a su obra por `id` (qid / sourceId / source_url / image_url); `n` es solo el respaldo para entradas viejas sin id.
// Si una entrada tiene id y no aparece en el índice, NO cae en otra obra: se avisa y se saltea.
// Uso: node tools/apply-desc.mjs <colDir> [--apply]
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadIndex, saveIndex } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const colsPath = path.join(ROOT, 'colecciones');
const hasCols = existsSync(colsPath) && readdirSync(colsPath).some(d => /^\d{2}_/.test(d));
const COLS_DIR = hasCols ? colsPath : ROOT;
const arg = process.argv[2];
const APPLY = process.argv.includes('--apply');

// Resuelve prefijo numérico (p.ej. '01' -> '01_mitologia_griega_romana') o nombre completo
const match = arg ? readdirSync(COLS_DIR).find(d => statSync(path.join(COLS_DIR, d)).isDirectory() && (d === arg || d.startsWith(arg + '_'))) : null;
const colDir = match || arg;
const colPath = path.join(COLS_DIR, colDir);

const mod = await import(`./desc/${colDir}.mjs`);
const data = mod.default || Object.values(mod)[0];
const idx = await loadIndex(colPath);
const byN = new Map(idx.items.map(it => [it.n, it]));
const byId = new Map();
for (const it of idx.items) for (const k of ['qid', 'sourceId', 'source_url', 'image_url']) if (it[k]) byId.set(it[k], byId.has(it[k]) ? null : it);   // null = ambiguo

let n = 0, warn = 0;
for (const d of data) {
  const it = d.id ? byId.get(d.id) : byN.get(d.n);
  if (!it) { console.log(d.id ? `!! id ${d.id} ${byId.get(d.id) === null ? 'ambiguo' : 'no existe'} (ficha n${d.n}): se saltea` : `!! no existe #${d.n}`); warn++; continue; }
  if (d.id && it.n !== d.n) console.log(`   ficha ${d.id}: n${d.n} → n${it.n} (la obra cambió de número; se aplica a la correcta)`);
  if (d.d) {
    const words = d.d.trim().split(/\s+/).length;
    if (words > 160) { console.log(`#${d.n} descripción larga (${words} palabras; la app apunta a 80-150)`); warn++; }
    it.description = d.d;
    it.description_source = d.d_fuente || 'Síntesis (Claude, fundada en Wikipedia/curatoría)';
  }
  if (d.titulo) it.title_es = d.titulo;
  if (d.anio) it.year = d.anio;            // corrige años errados (p.ej. de Wikidata)
  if (d.museo) it.holding_museum = d.museo;
  if (d.escuela) it.school = d.escuela;
  if (d.tipo) it.type = d.tipo;
  if (d.autor) it.artist = d.autor;        // corrige autores con basura de metadatos
  n++;
}
// Overlay de metadatos normalizados (tools/meta-fix.mjs): museo "Museo, Ciudad, País", título es y año; gana sobre lo anterior.
const metaPath = path.join(ROOT, 'tools', 'meta', `${colDir}.json`);
if (existsSync(metaPath)) {
  const ov = JSON.parse(readFileSync(metaPath, 'utf8'));
  let m = 0;
  for (const [id, o] of Object.entries(ov)) {
    const it = byId.get(id) || null;
    if (!it) { console.log(`!! meta: id ${id} no existe/ambiguo`); continue; }
    if ('museo' in o) { if (o.museo) it.holding_museum = o.museo; else delete it.holding_museum; }
    if (o.titulo) it.title_es = o.titulo;
    if (o.anio) it.year = o.anio;
    m++;
  }
  console.log(`   meta: ${m} obras con metadatos normalizados`);
}
const conDesc = idx.items.filter(i => i.description).length;
console.log(`${APPLY ? 'APLICADO' : 'DRY'}: ${n} fichas autoradas, ${warn} avisos. Total con descripción: ${conDesc}/${idx.items.length}`);
if (APPLY) await saveIndex(colPath, idx);
