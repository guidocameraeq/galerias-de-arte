// Importa la colección 25 (Doré: el resto de su obra) desde tools/targets/25_dore_otras.json + una carpeta "stage" con las imágenes ya
// listas (descargadas de Commons y, donde hacía falta, con el margen recortado por tools/dore-crop.mjs; excepción en docs/CALIDAD.md §5b).
// Idempotente por sourceId. Escribe _index.json y tools/desc/25_dore_otras_obras.mjs (fichas clavadas por id).
// Uso: node tools/dore-otras-import.mjs --stage=DIR [--apply]
import fs from 'node:fs';
import path from 'node:path';
import { loadIndex, saveIndex, buildFilename, orientationOf, imgSize, colPath } from './lib.mjs';

const args = process.argv.slice(2);
const flag = (n) => args.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const APPLY = args.includes('--apply');
const STAGE = flag('stage');
if (!STAGE) { console.error('Uso: node tools/dore-otras-import.mjs --stage=DIR [--apply]'); process.exit(2); }
const COL = '25_dore_otras_obras';
const colDir = colPath(COL);
const bundle = JSON.parse(fs.readFileSync('tools/targets/25_dore_otras.json', 'utf8'));
console.log(`PLAN ${COL}: ${bundle.length} obras · con recorte ${bundle.filter(b => b.cropped).length} · dudosas ${bundle.filter(b => b.dudoso).length}`);
const faltan = bundle.filter(b => !fs.existsSync(path.join(STAGE, b.file_stage)));
if (faltan.length) { console.error('Faltan en el stage:', faltan.map(b => b.file_stage).join(', ')); process.exit(2); }
if (!APPLY) { console.log('Dry-run. Con --apply escribe la colección.'); process.exit(0); }
for (const s of ['landscape', 'portrait']) {
  const st = fs.lstatSync(path.join(colDir, s), { throwIfNoEntry: false });
  if (!st?.isSymbolicLink()) { console.error(`✗ ${COL}/${s} no es un enlace (node tools/link-images.mjs --apply)`); process.exit(2); }
}
const idx = await loadIndex(COL);
const have = new Set(idx.items.map(i => i.sourceId));
const desc = [];
for (const b of bundle) {
  const sourceId = `File:${b.commons}`;
  if (have.has(sourceId)) continue;
  const stagePath = path.join(STAGE, b.file_stage);
  const buf = fs.readFileSync(stagePath);
  const sz = imgSize(buf);
  if (!sz) { console.log(`  ✗ no se pudo medir ${b.file_stage}`); continue; }
  const orientation = orientationOf(sz.w, sz.h);
  const ext = path.extname(stagePath).toLowerCase() === '.png' ? '.png' : '.jpg';
  const file = buildFilename(b.n, b.titulo_es, 'Gustave Dore', b.anio).replace(/\.jpg$/, ext);
  fs.mkdirSync(path.join(colDir, orientation), { recursive: true });
  fs.copyFileSync(stagePath, path.join(colDir, orientation, file));
  const item = {
    n: b.n, file, orientation, title: b.titulo_es, title_es: b.titulo_es, artist: 'Gustave Doré', year: b.anio,
    school: b.tipo === 'grabado' ? 'Romanticismo (ilustración)' : 'Romanticismo francés', type: b.tecnica || null,
    holding_museum: b.museo || null, museum: 'Wikimedia/Commons', license: 'Dominio público',
    source_url: b.source_url, image_url: b.image_url, width: sz.w, height: sz.h, bytes: buf.length, sourceId,
    kind: 'dore-otras', serie: b.serie, tipo: b.tipo,
  };
  if (b.cropped) { item.processing = 'recorte de margen (dore-crop.mjs; solo papel y pie, sin retoque)'; item.source_image_size = b.page_size; }
  if (b.dudoso) item.dudoso = b.notas || true;
  item.description = b.d; item.description_source = b.d_fuente;
  desc.push({ n: b.n, id: sourceId, titulo: b.titulo_es, d: b.d, d_fuente: b.d_fuente });
  idx.items.push(item); have.add(sourceId);
  await saveIndex(COL, idx);
}
idx.items.sort((a, b) => a.n - b.n);
await saveIndex(COL, idx);
const out = `// Fichas de ${COL}. Clave: id (sourceId). Ver docs/DESCRIPCIONES.md.\nexport default [\n${desc.map(e => '  ' + JSON.stringify(e) + ',').join('\n')}\n];\n`;
fs.writeFileSync(path.join('tools/desc', `${COL}.mjs`), out);
console.log(`LISTO: ${idx.items.length} obras en ${COL}.`);
