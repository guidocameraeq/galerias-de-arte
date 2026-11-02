// Vuelca descripciones AUTORADAS (archivo tools/desc/<colDir>.mjs) al _index.json.
// Setea description (es), holding_museum, school, type cuando el dato venga curado.
// Uso: node tools/apply-desc.mjs <colDir> [--apply]
import { readdirSync, statSync, existsSync } from 'node:fs';
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

let n = 0, warn = 0;
for (const d of data) {
  const it = byN.get(d.n);
  if (!it) { console.log(`!! no existe #${d.n}`); continue; }
  if (d.d) {
    if (d.d.length > 620) { console.log(`#${d.n} descripción larga (${d.d.length} car)`); warn++; }
    it.description = d.d;
    it.description_source = 'Síntesis (Claude, fundada en Wikipedia/curatoría)';
  }
  if (d.titulo) it.title_es = d.titulo;
  if (d.anio) it.year = d.anio;            // corrige años errados (p.ej. de Wikidata)
  if (d.museo) it.holding_museum = d.museo;
  if (d.escuela) it.school = d.escuela;
  if (d.tipo) it.type = d.tipo;
  n++;
}
const conDesc = idx.items.filter(i => i.description).length;
console.log(`${APPLY ? 'APLICADO' : 'DRY'}: ${n} fichas autoradas, ${warn} avisos. Total con descripción: ${conDesc}/${idx.items.length}`);
if (APPLY) await saveIndex(colPath, idx);
