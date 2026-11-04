// Da un `sourceId` local y estable a las obras que no tienen NINGÚN identificador (ni qid, ni sourceId, ni source_url, ni image_url).
// Formato: "local:<colección>:<slug del título>" (+ "-2", "-3" si se repite). Una vez asignado no cambia aunque cambie n o el archivo.
// Lo usan las fichas (tools/desc, clave id) y la app (id en galeria.json). Solo agrega el campo; no toca nada más.
// Dry-run por defecto. Uso: node tools/assign-local-ids.mjs [--apply]
import fs from 'fs';
import path from 'path';
import { slugify, loadIndex, saveIndex } from './lib.mjs';

const ROOT = process.cwd();
const APPLY = process.argv.includes('--apply');
const base = fs.existsSync(path.join(ROOT, 'colecciones')) ? path.join(ROOT, 'colecciones') : ROOT;
let total = 0;
for (const col of fs.readdirSync(base).filter(d => /^\d\d_/.test(d) && fs.existsSync(path.join(base, d, '_index.json')))) {
  const colDir = path.join(base, col);
  const idx = await loadIndex(colDir);
  const used = new Set(idx.items.map(i => i.sourceId).filter(Boolean));
  const nuevos = [];
  for (const it of idx.items) {
    if (it.qid || it.sourceId || it.source_url || it.image_url) continue;
    const stem = `local:${col}:${slugify(it.title_es || it.title || 'sin_titulo', 50).toLowerCase()}`;
    let id = stem, k = 2;
    while (used.has(id)) id = `${stem}-${k++}`;
    used.add(id); it.sourceId = id; nuevos.push(`n${it.n} → ${id}`);
  }
  if (!nuevos.length) continue;
  total += nuevos.length;
  console.log(`${col}: ${nuevos.length} ids locales`); nuevos.slice(0, 3).forEach(x => console.log(`    ${x}`));
  if (APPLY) await saveIndex(colDir, idx);
}
console.log(`\nTOTAL ${total} obras sin identificador ${APPLY ? 'ahora tienen sourceId local' : 'recibirían sourceId local'}${APPLY ? '' : '\nDry-run: agregá --apply.'}`);
