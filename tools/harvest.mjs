// Motor GENÉRICO de cosecha: baja una colección (nueva o ampliación) a partir de una lista de objetivos en JSON.
// Reemplaza el copy-paste de harvest-NN-*.mjs. Proceso completo: docs/procesos/NUEVA_COLECCION.md.
//
// Objetivos: tools/targets/<colección>.json  →  [{ titulo, autor, anio?, museo?, escuela?, tecnica?, licencia?, forma?,
//   qid?, commons? ("File:…"), url? (imagen directa), fuente? (página), d? (ficha es), d_fuente?, aceptar_baja? }]
// Resolución de la imagen, en orden: url directa → archivo de Commons → qid (Wikidata P18 → Commons).
// Por obra: dedup contra TODA la biblioteca (qid/sourceId) → tamaño declarado → descarga serial validada (magic bytes)
// → mide el archivo REAL → piso de lado largo → orientación → nombre → _index.json. Cada rechazo queda en _descartes/.
// Si el objetivo trae `d`, la ficha va al índice y a tools/desc/<colección>.mjs (clavada por id, no por n).
// Dry-run por defecto (resuelve y mide sin bajar). Idempotente: lo ya bajado se saltea.
// Uso: node tools/harvest.mjs <colección> [--apply] [--limit=N] [--base=DIR]
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { getJSON, downloadTo, imgSize, measureRemote, orientationOf, buildFilename, loadIndex, saveIndex, logDiscard, sleep, MIN_LONG_SIDE } from './lib.mjs';

const UA = 'Arte-PD-Collection/1.0 (+https://github.com/guidocameraeq/galerias-de-arte)';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const CAP = 8000;                                   // techo de lado largo (render de Commons, sin upscalear)
const args = process.argv.slice(2);
const flag = (n) => args.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const COL = args.find(a => !a.startsWith('--'));
const APPLY = args.includes('--apply');
const LIMIT = Number(flag('limit') || 0);
const ROOT = path.resolve(flag('base') || process.cwd());
if (!COL) { console.error('Uso: node tools/harvest.mjs <colección> [--apply] [--limit=N]'); process.exit(2); }
const FLOOR = /^1[345]_/.test(COL) ? 800 : MIN_LONG_SIDE;

const base = fs.existsSync(path.join(ROOT, 'colecciones')) ? path.join(ROOT, 'colecciones') : ROOT;
const colDir = path.join(base, COL);
const tPath = path.join(process.cwd(), 'tools/targets', `${COL}.json`);
if (!fs.existsSync(tPath)) { console.error(`Falta ${path.relative(process.cwd(), tPath)} (lista de objetivos; ver NUEVA_COLECCION.md paso 1).`); process.exit(2); }
const targets = JSON.parse(fs.readFileSync(tPath, 'utf8'));

// La colección debe existir y, si esta PC usa biblioteca externa, tener sus enlaces (si no, las imágenes caerían DENTRO del repo).
if (!fs.existsSync(path.join(colDir, '_index.json'))) {
  if (!APPLY) console.log(`(la colección ${COL} no existe todavía; con --apply se crea su _index.json vacío)`);
  else { fs.mkdirSync(colDir, { recursive: true }); fs.writeFileSync(path.join(colDir, '_index.json'), JSON.stringify({ collection: COL, items: [] }, null, 2)); }
}
if (APPLY && fs.existsSync(path.join(process.cwd(), '.arte-local.json')) && !flag('base')) {
  for (const s of ['landscape', 'portrait']) {
    let st = null; try { st = fs.lstatSync(path.join(colDir, s)); } catch { }
    if (!st?.isSymbolicLink()) { console.error(`✗ ${COL}/${s} no es un enlace a la biblioteca. Corré antes: node tools/link-images.mjs --apply`); process.exit(2); }
  }
}

// Biblioteca entera: para no bajar dos veces la misma obra en colecciones distintas
const have = new Map();                              // id → colección
for (const c of fs.readdirSync(base).filter(d => /^\d\d_/.test(d) && fs.existsSync(path.join(base, d, '_index.json')))) {
  for (const it of JSON.parse(fs.readFileSync(path.join(base, c, '_index.json'), 'utf8')).items) {
    if (it.qid) have.set(it.qid, c);
    if (it.sourceId) have.set(it.sourceId, c);
  }
}

async function commonsInfo(file) {
  const t = file.startsWith('File:') ? file : 'File:' + file;
  const j = await getJSON(`${COMMONS}?action=query&format=json&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=${CAP}&titles=${encodeURIComponent(t)}`, { ua: UA, delay: 150 });
  const p = Object.values(j.query?.pages || {})[0];
  const ii = p?.imageinfo?.[0];
  if (!ii) return null;
  const big = Math.max(ii.width, ii.height) > CAP;
  return { sourceId: p.title, url: big && ii.thumburl ? ii.thumburl : ii.url, w: ii.width, h: ii.height,
    license: ii.extmetadata?.LicenseShortName?.value || null, page: ii.descriptionurl };
}
async function p18(qid) {
  const j = await getJSON(`https://www.wikidata.org/w/api.php?action=wbgetclaims&format=json&property=P18&entity=${qid}`, { ua: UA, delay: 150 });
  return j.claims?.P18?.[0]?.mainsnak?.datavalue?.value || null;
}

// Rechazos ya registrados (para no repetirlos) y obras que se SACARON a propósito con remove-work en cualquier colección
// (curaduría de Guido, duplicada, baja calidad…): esas no se vuelven a bajar aunque sigan en la lista de objetivos.
const logged = new Set(), retiradas = new Set();
const dDir = path.join(ROOT, '_descartes');
if (fs.existsSync(dDir)) for (const f of fs.readdirSync(dDir).filter(x => x.endsWith('.jsonl'))) {
  for (const l of fs.readFileSync(path.join(dDir, f), 'utf8').split(/\r?\n/).filter(Boolean)) {
    let o; try { o = JSON.parse(l); } catch { continue; }
    if (f === `${COL}.jsonl`) logged.add(`${o.title}|${o.reason}`);
    if (o.moved_to) { if (o.qid) retiradas.add(o.qid); if (o.sourceId) retiradas.add(o.sourceId); }
  }
}

const idx = fs.existsSync(path.join(colDir, '_index.json')) ? await loadIndex(colDir) : { collection: COL, items: [] };
let nextN = idx.items.reduce((m, i) => Math.max(m, i.n || 0), 0) + 1;
const descNew = [];
const stats = { ok: 0, ya: 0, dup: 0, baja: 0, nomatch: 0, error: 0, retirada: 0 };
const todo = LIMIT ? targets.slice(0, LIMIT) : targets;
console.log(`HARVEST ${COL} · ${APPLY ? 'APPLY' : 'dry-run'} · ${todo.length} objetivos · piso ${FLOOR}px\n`);

for (const t of todo) {
  const label = `${(t.titulo || '?').slice(0, 40)} — ${t.autor || '?'}`;
  let tmp = null;
  const log = async (reason, extra = {}) => {
    if (!APPLY || logged.has(`${t.titulo}|${reason}`)) return;
    logged.add(`${t.titulo}|${reason}`);
    await logDiscard(ROOT, COL, { kind: 'named', title: t.titulo, artist: t.autor, qid: t.qid || null, reason, ...extra });
  };
  try {
    // 1) Resolver imagen
    let r = null;
    if (t.url) {
      const m = await measureRemote(t.url, { ua: UA });
      r = { sourceId: t.url, url: t.url, w: m.w, h: m.h, license: t.licencia || null, page: t.fuente || t.url };
    } else {
      const file = t.commons || (t.qid ? await p18(t.qid) : null);
      if (file) r = await commonsInfo(file);
    }
    if (!r || !r.w) { stats.nomatch++; console.log(`  ✗ sin imagen   ${label}`); await log('no_match'); continue; }
    // 2) ¿Ya está, o se sacó a propósito antes?
    if ((t.qid && retiradas.has(t.qid)) || retiradas.has(r.sourceId)) { stats.retirada++; console.log(`  − retirada antes (curaduría/remove-work), no se re-baja: ${label}`); continue; }
    const owner = (t.qid && have.get(t.qid)) || have.get(r.sourceId);
    if (owner === COL) { stats.ya++; continue; }
    if (owner) { stats.dup++; console.log(`  = ya está en ${owner}: ${label}`); await log('dup', { note: `ya está en ${owner}` }); continue; }
    // 3) Tamaño declarado (piso)
    const declared = Math.min(Math.max(r.w, r.h), CAP);
    if (declared < FLOOR && !t.aceptar_baja) { stats.baja++; console.log(`  ↓ baja res ${declared}px  ${label}`); await log('low_res', { long: declared, source_url: r.page }); continue; }
    if (!APPLY) { stats.ok++; console.log(`  ✓ ${String(r.w + 'x' + r.h).padEnd(11)} ${label}`); continue; }
    // 4) Descargar (valida magic bytes), medir el archivo REAL y ubicar
    // el temporal va DENTRO de la biblioteca (landscape/ es enlace a ella): así el rename final es en el mismo disco
    fs.mkdirSync(path.join(colDir, 'landscape'), { recursive: true });
    tmp = path.join(colDir, 'landscape', `_tmp_${Date.now()}.img`);
    const buf = await downloadTo(r.url, tmp, { ua: UA });
    const sz = imgSize(buf);
    if (!sz) { fs.rmSync(tmp, { force: true }); stats.error++; console.log(`  ✗ no se pudo medir  ${label}`); await log('download_error', { err: 'no se pudo medir' }); continue; }
    if (Math.max(sz.w, sz.h) < FLOOR && !t.aceptar_baja) { fs.rmSync(tmp, { force: true }); stats.baja++; console.log(`  ↓ archivo real ${Math.max(sz.w, sz.h)}px  ${label}`); await log('low_res', { long: Math.max(sz.w, sz.h), source_url: r.page }); continue; }
    const orientation = orientationOf(sz.w, sz.h);
    const n = nextN++;
    const file = buildFilename(n, t.titulo, t.autor, t.anio);
    fs.mkdirSync(path.join(colDir, orientation), { recursive: true });
    fs.renameSync(tmp, path.join(colDir, orientation, file));
    tmp = null;
    const id = t.qid || r.sourceId;
    const item = { n, file, orientation, title: t.titulo, title_es: t.titulo, artist: t.autor || null, year: t.anio || null,
      school: t.escuela || null, type: t.tecnica || null, holding_museum: t.museo || null, qid: t.qid || null,
      museum: t.url ? new URL(t.url).hostname : 'Wikimedia/Commons', license: t.licencia || r.license || null,
      source_url: t.fuente || r.page, image_url: r.url, width: sz.w, height: sz.h, bytes: buf.length, sourceId: r.sourceId, kind: 'harvest' };
    if (t.d) { item.description = t.d; item.description_source = t.d_fuente || 'Síntesis (de fuente citada en tools/targets)'; descNew.push({ n, id, titulo: t.titulo, d: t.d, ...(t.d_fuente ? { d_fuente: t.d_fuente } : {}) }); }
    if (t.forma) item.forma = t.forma;
    idx.items.push(item);
    await saveIndex(colDir, idx);                    // incremental y atómico: un corte no pierde lo bajado
    if (t.qid) have.set(t.qid, COL);
    have.set(r.sourceId, COL);
    stats.ok++;
    console.log(`  ✓ ${String(sz.w + 'x' + sz.h).padEnd(11)} ${label}`);
    await sleep(1200);
  } catch (e) {
    if (tmp) fs.rmSync(tmp, { force: true });
    stats.error++; console.log(`  ✗ error  ${label}: ${e.message}`); await log('download_error', { err: e.message });
  }
}

// Fichas nuevas → tools/desc/<col>.mjs (clavadas por id; si el archivo ya existe se AGREGAN al final, sin tocar lo previo)
if (APPLY && descNew.length) {
  const dp = path.join(process.cwd(), 'tools/desc', `${COL}.mjs`);
  const lines = descNew.map(e => `  ${JSON.stringify(e)},`).join('\n');
  let out;
  if (!fs.existsSync(dp)) out = `// Fichas de ${COL}. Clave: id (qid/sourceId); n es solo referencia. Ver docs/DESCRIPCIONES.md.\nexport default [\n${lines}\n];\n`;
  else {
    const s = fs.readFileSync(dp, 'utf8');
    const cut = s.lastIndexOf('];');
    out = cut < 0 ? null : s.slice(0, cut).replace(/\}\s*$/, m => m.replace('}', '},')) + `${lines}\n];\n`;
  }
  // validar el módulo antes de reemplazar; si algo no cierra, las fichas quedan aparte y se avisa (nunca se pierden)
  const tmpD = dp.replace(/\.mjs$/, `.tmp-${process.pid}.mjs`);
  let ok = false;
  if (out) { fs.writeFileSync(tmpD, out); try { const m = await import(pathToFileURL(tmpD).href); ok = Array.isArray(m.default); } catch { } }
  if (ok) fs.renameSync(tmpD, dp);
  else {
    fs.rmSync(tmpD, { force: true });
    const side = dp.replace(/\.mjs$/, '.nuevas.json');
    fs.writeFileSync(side, JSON.stringify(descNew, null, 2));
    console.log(`⚠ No pude agregar las fichas a ${path.relative(process.cwd(), dp)}; quedaron en ${path.relative(process.cwd(), side)} para pasarlas a mano.`);
  }
}
console.log(`\n${APPLY ? 'BAJADAS' : 'BAJARÍA'} ${stats.ok} · ya estaban ${stats.ya} · en otra colección ${stats.dup} · baja resolución ${stats.baja} · sin imagen ${stats.nomatch} · errores ${stats.error} · retiradas antes ${stats.retirada}`);
if (!APPLY) console.log('Dry-run: mostrale esto a Guido y, con su OK, corré con --apply.');
else console.log('Siguiente: node tools/audit.mjs --col=' + COL.slice(0, 2) + '  y revisión visual (tools/contact-sheets.mjs).');
