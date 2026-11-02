// tools/audit.mjs — verificación de SOLO LECTURA de todo el inventario. Sin red, no escribe nada.
// Es la garantía de calidad ejecutable: de acá salen los números de estado (obras, fichas, GB).
// Uso: node tools/audit.mjs [--col=NN] [--all] [--json] [--help]
//   --col=NN  solo esa colección (prefijo numérico, p.ej. --col=17)
//   --all     lista TODOS los avisos (por defecto recorta a 12 por código)
//   --json    salida máquina-legible
// Código de salida: 0 = sin FALLAS (los AVISOS no cuentan) · 1 = hay FALLAS.
import { readFileSync, readdirSync, statSync, existsSync, openSync, readSync, closeSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { jpegSize, pngSize, webpSize } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(0, 9).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(0);
}
const ALL = args.includes('--all'), JSON_OUT = args.includes('--json');
const ONLY = (args.find(a => a.startsWith('--col=')) || '').split('=')[1];

const FLOOR_DEFAULT = 1000;          // piso duro: lado largo (lib.mjs MIN_LONG_SIDE)
const FLOOR_MODERN = 800;            // modernas con copyright 13-15 (CLAUDE/CALIDAD)
const MODERN = new Set(['13', '14', '15']);
const MIN_BYTES = 20000;             // por debajo no puede ser una obra en alta res (páginas de error rondan 2 KB)

const fails = [], warns = [];
const fail = (code, col, n, msg) => fails.push({ code, col, n, msg });
const warn = (code, col, n, msg) => warns.push({ code, col, n, msg });
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');

// ---- formato y dimensiones por cabecera (sin Pillow/sharp) ----
function sniff(b) {
  if (b.length >= 2 && b[0] === 0xFF && b[1] === 0xD8) return 'jpeg';
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return 'png';
  if (b.length >= 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}
function readHead(fp, size, n) {
  const len = Math.min(size, n), buf = Buffer.alloc(len), fd = openSync(fp, 'r');
  try { readSync(fd, buf, 0, len, 0); } finally { closeSync(fd); }
  return buf;
}
function inspect(fp, size) {
  let b = readHead(fp, size, 1 << 20);           // 1 MB alcanza casi siempre
  const fmt = sniff(b);
  if (!fmt) return { fmt: null };
  const dim = (buf) => fmt === 'jpeg' ? jpegSize(buf) : fmt === 'png' ? pngSize(buf) : webpSize(buf);
  let d = dim(b);
  if (!d && size > b.length) { b = readHead(fp, size, size); d = dim(b); }   // cabeceras enormes: leer entero
  return { fmt, w: d?.w, h: d?.h };
}

// ---- recorrido ----
const colsPath = path.join(ROOT, 'colecciones');
const hasCols = existsSync(colsPath) && readdirSync(colsPath).some(d => /^\d{2}_/.test(d));
const COLS_DIR = hasCols ? colsPath : ROOT;
const colDirs = readdirSync(COLS_DIR).filter(d => /^\d{2}_/.test(d) && statSync(path.join(COLS_DIR, d)).isDirectory())
  .filter(d => !ONLY || d.startsWith(ONLY)).sort();
const rows = [];
const qidSeen = new Map();     // qid -> ["col n", ...]
let totalBytes = 0;

for (const col of colDirs) {
  const num = col.slice(0, 2), floor = MODERN.has(num) ? FLOOR_MODERN : FLOOR_DEFAULT;
  const row = { col, obras: 0, fichas: 0, fallas: 0, avisos: 0, bytes: 0 };
  const f0 = fails.length, w0 = warns.length;
  const ip = path.join(COLS_DIR, col, '_index.json');
  let idx;
  try { idx = JSON.parse(readFileSync(ip, 'utf8')); } catch (e) { fail('F-INDEX', col, '-', `_index.json ilegible o ausente (${e.message})`); rows.push(row); continue; }
  if (!idx || Array.isArray(idx) || !Array.isArray(idx.items)) { fail('F-INDEX', col, '-', 'forma inválida: debe ser {collection, items:[…]} (objeto, no array)'); rows.push(row); continue; }

  const items = idx.items, inIndex = new Set(), nSeen = new Set(), titleSeen = new Map();
  row.obras = items.length;

  for (const it of items) {
    const tag = it.n;
    if (nSeen.has(it.n)) fail('F-N-DUP', col, tag, `n repetido`); nSeen.add(it.n);
    if (it.description && String(it.description).trim()) row.fichas++; else warn('W-DESC', col, tag, `sin descripción: ${it.title_es || it.title || it.file}`);
    if (!it.file || !it.orientation) { fail('F-MISSING', col, tag, 'item sin file u orientation'); continue; }
    const key = `${it.orientation}/${it.file}`;
    if (inIndex.has(key)) fail('F-DUPFILE', col, tag, `archivo referenciado dos veces: ${key}`);
    inIndex.add(key);
    if (!String(it.file).startsWith(String(it.n).padStart(2, '0') + '_')) warn('W-PREFIX', col, tag, `el prefijo del nombre no coincide con n: ${it.file}`);

    const fp = path.join(COLS_DIR, col, it.orientation, it.file);
    if (!existsSync(fp)) {
      const other = it.orientation === 'landscape' ? 'portrait' : 'landscape';
      fail('F-MISSING', col, tag, existsSync(path.join(COLS_DIR, col, other, it.file)) ? `está en ${other}/ pero el índice dice ${it.orientation}/: ${it.file}` : `no existe: ${key}`);
      continue;
    }
    const size = statSync(fp).size; row.bytes += size;
    if (size < MIN_BYTES) { fail('F-TINY', col, tag, `pesa ${size} B (¿página de error?): ${key}`); continue; }
    const r = inspect(fp, size);
    if (!r.fmt) { fail('F-MAGIC', col, tag, `no es JPEG/PNG/WebP (¿HTML de error?): ${key}`); continue; }
    if (r.fmt !== 'jpeg') warn('W-EXT', col, tag, `extensión .jpg pero el contenido es ${r.fmt.toUpperCase()}: ${it.file}`);
    if (!r.w || !r.h) { warn('W-DIMS', col, tag, `no pude leer dimensiones de la cabecera: ${key}`); continue; }
    if (it.width !== r.w || it.height !== r.h) fail('F-DIMS', col, tag, `índice ${it.width}x${it.height} ≠ real ${r.w}x${r.h}: ${it.file}`);
    if ((r.w >= r.h ? 'landscape' : 'portrait') !== it.orientation) fail('F-ORIENT', col, tag, `orientation=${it.orientation} pero real ${r.w}x${r.h}: ${it.file}`);
    if (Math.max(r.w, r.h) < floor) warn('W-RES', col, tag, `lado largo ${Math.max(r.w, r.h)} < ${floor}: ${it.title_es || it.title} (${r.w}x${r.h})`);

    if (it.qid) { const a = qidSeen.get(it.qid) || []; a.push(`${col} n${tag}`); qidSeen.set(it.qid, a); }
    if (num !== '17') {      // la 17 repite "Infierno · Canto N" a propósito
      const tk = norm(it.title_es || it.title) + '|' + norm(it.artist);
      if (norm(it.title_es || it.title)) { const a = titleSeen.get(tk) || []; a.push(tag); titleSeen.set(tk, a); }
    }
  }
  for (const [, ns] of titleSeen) if (ns.length > 1) warn('W-TITLE-DUP', col, ns.join(','), `mismo título+autor en n ${ns.join(', ')}`);

  const ns = [...nSeen].filter(x => typeof x === 'number').sort((a, b) => a - b);
  if (ns.some((v, i) => v !== i + 1)) warn('W-N-GAP', col, '-', `n no contiguo 1..${ns.length} (hay saltos tras podas/movidas)`);

  // huérfanos: archivos en disco que el índice no referencia
  for (const o of ['landscape', 'portrait']) {
    const d = path.join(COLS_DIR, col, o);
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d)) if (!inIndex.has(`${o}/${f}`)) fail('F-ORPHAN', col, '-', `en disco pero no en el índice: ${o}/${f}`);
  }
  row.fallas = fails.length - f0; row.avisos = warns.length - w0; totalBytes += row.bytes; rows.push(row);
}
for (const [q, where] of qidSeen) if (where.length > 1) warn('W-QID-DUP', where[0].split(' ')[0], '-', `qid ${q} repetido: ${where.join(' | ')}`);
// Fichas autoradas desfasadas: tools/desc/<col>.mjs se vuelca POR n. Si el índice se podó/renumeró/movió,
// re-correr apply-desc pegaría fichas en obras equivocadas (y la próxima obra con ese n heredaría el texto).
const descDir = path.join(ROOT, 'tools', 'desc');
if (existsSync(descDir)) for (const col of colDirs) {
  const dp = path.join(descDir, col + '.mjs');
  if (!existsSync(dp)) continue;
  try {
    const entries = (await import(pathToFileURL(dp).href)).default || [];
    const byN = new Map(JSON.parse(readFileSync(path.join(COLS_DIR, col, '_index.json'), 'utf8')).items.map(i => [i.n, i]));
    let falta = 0, difiere = 0;
    for (const e of entries) { const i = byN.get(e.n); if (!i) falta++; else if (e.d && e.d !== i.description) difiere++; }
    if (falta || difiere) warn('W-DESC-STALE', col, '-', `tools/desc/${col}.mjs desfasado: ${falta} n inexistentes, ${difiere} fichas distintas del índice → NO re-correr apply-desc sin corregirlo (docs/DESCRIPCIONES.md §2.A)`);
  } catch (e) { warn('W-DESC-STALE', col, '-', `no pude comparar tools/desc/${col}.mjs: ${e.message}`); }
}
// (los avisos W-QID-DUP y W-DESC-STALE se cargan después de cerrar las filas: cuentan en el total pero no en la tabla por colección)

const tot = rows.reduce((a, r) => ({ obras: a.obras + r.obras, fichas: a.fichas + r.fichas }), { obras: 0, fichas: 0 });
const summary = { colecciones: rows.length, obras: tot.obras, fichas: tot.fichas, gb: +(totalBytes / 1e9).toFixed(2), fallas: fails.length, avisos: warns.length };

if (JSON_OUT) { console.log(JSON.stringify({ summary, rows, fails, warns }, null, 2)); process.exit(fails.length ? 1 : 0); }

const pad = (s, n) => String(s).padEnd(n), lpad = (s, n) => String(s).padStart(n);
console.log('AUDIT — Arte (solo lectura)\n');
console.log(pad('Colección', 34) + lpad('Obras', 7) + lpad('Fichas', 8) + lpad('FALLAS', 8) + lpad('AVISOS', 8) + lpad('MB', 8));
for (const r of rows) console.log(pad(r.col, 34) + lpad(r.obras, 7) + lpad(r.fichas, 8) + lpad(r.fallas, 8) + lpad(r.avisos, 8) + lpad((r.bytes / 1e6).toFixed(0), 8));
console.log('\n' + `TOTAL: ${summary.colecciones} colecciones · ${summary.obras} obras · ${summary.fichas} con ficha · ${summary.gb} GB · ${summary.fallas} FALLAS · ${summary.avisos} AVISOS`);

if (fails.length) { console.log('\n== FALLAS (rompen el inventario) =='); for (const f of fails) console.log(`  [${f.code}] ${f.col} n${f.n}: ${f.msg}`); }
if (warns.length) {
  console.log('\n== AVISOS (a revisar; no son error) ==');
  const byCode = {}; for (const w of warns) (byCode[w.code] = byCode[w.code] || []).push(w);
  for (const code of Object.keys(byCode).sort()) {
    const list = byCode[code], show = ALL ? list : list.slice(0, 12);
    console.log(`  ${code} (${list.length})`);
    for (const w of show) console.log(`    ${w.col} n${w.n}: ${w.msg}`);
    if (list.length > show.length) console.log(`    … y ${list.length - show.length} más (usá --all)`);
  }
}
console.log(fails.length ? '\nRESULTADO: ✗ FALLÓ' : '\nRESULTADO: ✓ OK (0 fallas)');
process.exit(fails.length ? 1 : 0);
