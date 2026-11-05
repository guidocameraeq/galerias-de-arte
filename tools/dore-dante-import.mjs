// Reconstruye la colección 17 (Doré · La Divina Comedia) con UNA versión limpia por plancha (135 = Infierno 75 + Purgatorio 42 + Paraíso 18).
// Origen: carpeta "stage" con manifest.json (descargas de Commons ya recortadas con dore-crop.mjs, ver docs/CALIDAD.md §5b)
// + tools/targets/17_dante_planchas.json (pie de grabado y canto por plancha, Dover/Moeser) + fichas en español (JSON de redactores).
// Pasos con --apply: (1) las entradas viejas de la 17 se MUEVEN a _dedup_removed con remove-work (recuperables); (2) se copian las
// imágenes nuevas a la biblioteca; (3) se escribe el _index.json; (4) se escribe tools/desc/17_dore_divina_comedia.mjs (fichas clavadas por id).
// Uso: node tools/dore-dante-import.mjs --stage=DIR [--fichas=A.json,B.json,...] [--apply] [--keep-old]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadIndex, saveIndex, buildFilename, orientationOf, imgSize, colPath } from './lib.mjs';

const args = process.argv.slice(2);
const flag = (n) => args.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const APPLY = args.includes('--apply'), KEEP_OLD = args.includes('--keep-old');
const STAGE = flag('stage');
if (!STAGE) { console.error('Uso: node tools/dore-dante-import.mjs --stage=DIR [--fichas=a.json,b.json] [--apply]'); process.exit(2); }
const COL = '17_dore_divina_comedia';
const ROOT = process.cwd();
const colDir = colPath(COL);
const man = JSON.parse(fs.readFileSync(path.join(STAGE, 'manifest.json'), 'utf8'));
const planchas = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/targets/17_dante_planchas.json'), 'utf8'));
const fichas = new Map();
for (const f of (flag('fichas') || '').split(',').filter(Boolean)) for (const e of JSON.parse(fs.readFileSync(f, 'utf8'))) fichas.set(e.plate, e);

const ROM = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX', 'XXXI', 'XXXII', 'XXXIII', 'XXXIV'];
const LIBRO = { Inferno: 'Infierno', Purgatorio: 'Purgatorio', Paradiso: 'Paraíso' };
const YEAR = { Inferno: '1861', Purgatorio: '1868', Paradiso: '1868' };   // Hachette: Infierno 1861; Purgatorio y Paraíso 1868 (Wikipedia: Gustave Doré)

const plan = [];
let faltan = 0;
for (const p of planchas) {
  const m = man[String(p.stage_key)];
  if (!m?.ok) { faltan++; console.log(`  ✗ plancha ${p.plate} (${p.libro} t.${p.tabla_moeser}): sin imagen en el stage`); continue; }
  const ficha = fichas.get(p.plate);
  const libro = LIBRO[p.libro];
  const titulo = ficha?.titulo_es || `${libro} · Canto ${ROM[p.canto]}`;
  plan.push({ p, m, ficha, libro, titulo });
}
const kinds = plan.reduce((a, x) => (a[x.m.kind] = (a[x.m.kind] || 0) + 1, a), {});
console.log(`PLAN ${COL}: ${plan.length}/${planchas.length} planchas · ${JSON.stringify(kinds)} · fichas ${fichas.size} · faltan ${faltan}`);
const minLong = Math.min(...plan.map(x => Math.max(x.m.w, x.m.h)));
console.log(`lado largo mínimo: ${minLong}px`);
if (!APPLY) { console.log('Dry-run. Con --apply: mueve las entradas viejas a _dedup_removed y escribe las nuevas.'); process.exit(0); }

for (const s of ['landscape', 'portrait']) {
  const st = fs.lstatSync(path.join(colDir, s), { throwIfNoEntry: false });
  if (!st?.isSymbolicLink()) { console.error(`✗ ${COL}/${s} no es un enlace a la biblioteca (node tools/link-images.mjs --apply)`); process.exit(2); }
}
// 1) entradas viejas → _dedup_removed (recuperables)
if (!KEEP_OLD) {
  const old = (await loadIndex(COL)).items.map(i => i.n);
  console.log(`moviendo ${old.length} entradas viejas…`);
  for (const n of old) execFileSync('node', ['tools/remove-work.mjs', COL, `--n=${n}`, '--why=baja_calidad', '--note=reemplazada por la reconstruccion completa de la 17 (fotos de libro, duplicados; 2026-11-04)', '--apply'], { stdio: 'pipe' });
}
// 2) imágenes nuevas + índice
const idx = await loadIndex(COL);
const have = new Set(idx.items.map(i => i.sourceId));
const descOut = [];
for (const { p, m, ficha, libro, titulo } of plan) {
  const sourceId = `File:${m.source_file}`;
  if (have.has(sourceId)) { console.log(`  = ya está: plancha ${p.plate}`); continue; }
  const buf = fs.readFileSync(m.staged);
  const sz = imgSize(buf);
  if (!sz) { console.log(`  ✗ no se pudo medir plancha ${p.plate}`); continue; }
  const orientation = orientationOf(sz.w, sz.h);
  const ext = path.extname(m.staged).toLowerCase() === '.png' ? '.png' : '.jpg';
  const file = buildFilename(p.plate, titulo, 'Gustave Dore', YEAR[p.libro]).replace(/\.jpg$/, ext);
  fs.mkdirSync(path.join(colDir, orientation), { recursive: true });
  fs.copyFileSync(m.staged, path.join(colDir, orientation, file));
  const item = {
    n: p.plate, file, orientation, title: titulo, title_es: titulo, artist: 'Gustave Doré', year: YEAR[p.libro],
    school: 'Romanticismo (ilustración)', type: 'Grabado en madera', holding_museum: null, museum: 'Wikimedia/Commons',
    license: 'Dominio público', source_url: m.source_url, image_url: m.image_url, width: sz.w, height: sz.h, bytes: buf.length,
    sourceId, kind: 'dore-dante', libro, canto: p.canto, plate: p.plate, tabla_moeser: p.tabla_moeser, versos: p.versos,
    caption_en: p.caption_en, caption_es: p.caption_es,
  };
  if (m.kind === 'recorte') { item.processing = 'recorte de margen (dore-crop.mjs; solo papel, sin retoque)'; item.source_page = m.source_file; item.source_page_size = m.page ? `${m.page.w}x${m.page.h}` : null; }
  if (p.dudoso) item.dudoso = p.razon_dudoso || true;
  if (ficha?.d) { item.description = ficha.d; item.description_source = ficha.d_fuente || 'Síntesis de fuente citada'; descOut.push({ n: p.plate, id: sourceId, titulo, d: ficha.d, d_fuente: ficha.d_fuente }); }
  idx.items.push(item); have.add(sourceId);
  await saveIndex(COL, idx);
}
idx.items.sort((a, b) => a.n - b.n);
await saveIndex(COL, idx);
// 3) fichas clavadas por id
if (descOut.length) {
  const out = `// Fichas de ${COL}. Clave: id (sourceId); n = número de plancha (Dover/Moeser). Ver docs/DESCRIPCIONES.md.\nexport default [\n${descOut.map(e => '  ' + JSON.stringify(e) + ',').join('\n')}\n];\n`;
  fs.writeFileSync(path.join(ROOT, 'tools/desc', `${COL}.mjs`), out);
}
console.log(`LISTO: ${idx.items.length} planchas en ${COL}. Siguiente: node tools/audit.mjs --col=17 y revisión visual.`);
