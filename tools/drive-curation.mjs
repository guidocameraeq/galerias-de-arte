// Trae al repo la curaduría que Guido hace BORRANDO imágenes en Drive (carpeta "Galerías" que lee la app).
// Compara cada galeria.json de Drive con los archivos que siguen en su carpeta: lo listado que ya no está = borrado por Guido.
// Con --apply, cada obra borrada sale del repo con remove-work (la MUEVE a _dedup_removed/, loguea el descarte como
// "curaduria"), se regenera el galeria.json de esa galería y el registro de candidatas. Nunca borra nada.
// Freno de seguridad: si falta la carpeta entera o más del 30% de una galería, se saltea (¿Drive a medio sincronizar?) salvo --force.
// Dry-run por defecto. Uso: node tools/drive-curation.mjs [--drive=RUTA_GALERIAS] [--force] [--apply]
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { tituloDe, idsGaleria } from './galerias.mjs';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const flag = (n) => args.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const APPLY = args.includes('--apply'), FORCE = args.includes('--force');
const detect = () => {
  for (const L of 'IJKLMNOPQRSTUVWXYZGHFED') for (const my of ['My Drive', 'Mi unidad']) {
    const p = `${L}:\\${my}\\Galerías de arte\\Galerías`;
    if (fs.existsSync(p)) return p;
  }
  return null;
};
const DRIVE = flag('drive') || process.env.ARTE_DRIVE_GALERIAS || detect();
if (!DRIVE || !fs.existsSync(DRIVE)) { console.error('No encuentro la carpeta "Galerías" de Drive (¿Drive para escritorio abierto?). Pasá --drive=RUTA.'); process.exit(2); }
const base = fs.existsSync(path.join(ROOT, 'colecciones')) ? path.join(ROOT, 'colecciones') : ROOT;
const cols = fs.readdirSync(base).filter(d => /^\d\d_/.test(d) && fs.existsSync(path.join(base, d, '_index.json')));
console.log(`CURADURÍA DESDE DRIVE · ${APPLY ? 'APPLY' : 'dry-run'} · ${DRIVE}\n`);

const run = (cmd, a) => spawnSync('node', [cmd, ...a], { cwd: ROOT, encoding: 'utf8' });
let total = 0, tocadas = [];
for (const col of cols) {
  const dir = path.join(DRIVE, tituloDe(col));
  const gj = path.join(dir, 'galeria.json');
  if (!fs.existsSync(gj)) continue;                                    // galería no publicada
  let obras;
  try { obras = JSON.parse(fs.readFileSync(gj, 'utf8')).obras || []; } catch { console.log(`⚠ ${col}: galeria.json ilegible, se saltea`); continue; }
  const faltan = obras.filter(o => !fs.existsSync(path.join(dir, o.archivo)));
  if (!faltan.length) continue;
  const share = faltan.length / obras.length;
  if (share > 0.3 && !FORCE) { console.log(`⚠ ${col}: faltan ${faltan.length}/${obras.length} imágenes (>30%). ¿Drive sincronizando? Se saltea; si es a propósito, --force.`); continue; }
  const items = JSON.parse(fs.readFileSync(path.join(base, col, '_index.json'), 'utf8')).items;
  // Misma regla de ids que export-drive (tools/galerias.mjs): id de Drive → obra exacta, sin adivinar por n
  const byId = new Map([...idsGaleria(items, col)].map(([it, id]) => [id, it]));
  console.log(`${col} → "${tituloDe(col)}": ${faltan.length} borrada(s) por Guido`);
  let fallos = 0;
  for (const o of faltan) {
    const it = byId.get(o.id);
    if (!it) { console.log(`    ? ${o.titulo} (id ${o.id}): no coincide con ninguna obra del índice (¿ya salió, o el índice cambió desde la exportación?). No se toca.`); continue; }
    if ((it.title_es || it.title) !== o.titulo) console.log(`      (aviso: en Drive se llamaba "${o.titulo}")`);
    console.log(`    − n${it.n} ${it.title_es || it.title} — ${it.artist || ''}`);
    total++;
    if (!APPLY) continue;
    const r = run('tools/remove-work.mjs', [col, `--n=${it.n}`, '--why=curaduria', '--note=Borrada por Guido en Drive (curaduría)', '--apply']);
    if (r.status !== 0) { fallos++; console.log(`      ✗ remove-work falló: ${(r.stderr || r.stdout).trim().split('\n').pop()}`); }
  }
  if (fallos) console.log(`    ⚠ ${col}: ${fallos} falla(s); no se regenera su galeria.json (queda la evidencia para reintentar).`);
  else tocadas.push(col);
}
if (APPLY && tocadas.length) {
  console.log('\nRegenerando galeria.json de las galerías tocadas y el registro de candidatas…');
  const e = run('tools/export-drive.mjs', [`--col=${tocadas.join(',')}`, `--out=${DRIVE}`, '--big-max-side=3840', '--apply']);
  console.log((e.stdout || '').trim().split('\n').filter(l => /✓|⚠|escrito|TOTAL/.test(l)).join('\n'));
  run('tools/candidatas.mjs', ['--apply']);
}
console.log(`\n${total} obra(s) ${APPLY ? 'sacadas del repo (recuperables en _dedup_removed/)' : 'saldrían del repo'}${APPLY ? '. Corré node tools/audit.mjs y hacé commit.' : '\nDry-run: con el OK de Guido, --apply.'}`);
