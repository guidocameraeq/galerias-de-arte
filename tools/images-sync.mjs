// Respaldo y restauración de la biblioteca de imágenes contra Google Drive (Drive para escritorio). SOLO COPIA: nunca borra nada, ni en origen ni en destino.
//   node tools/images-sync.mjs backup  [--apply]   biblioteca local -> Drive/Galerías de arte/Respaldo   (landscape/ y portrait/ de cada colección)
//   node tools/images-sync.mjs restore [--apply]   Drive -> biblioteca local de esta PC, y rearma los enlaces (link-images)
// Dry-run por defecto (robocopy /L): muestra qué copiaría y cuántos MB. Solo copia archivos nuevos o distintos.
// Rutas: biblioteca local = ARTE_IMAGENES o .arte-local.json {"imagenes"}; Respaldo en Drive = --drive=RUTA, ARTE_DRIVE, .arte-local.json {"drive"}
// o autodetección en las unidades: <X>:\My Drive|Mi unidad\Galerías de arte\Respaldo.
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const mode = args.find(a => !a.startsWith('--'));
const flag = (n) => args.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const APPLY = args.includes('--apply');
if (!['backup', 'restore'].includes(mode)) { console.error('Uso: node tools/images-sync.mjs backup|restore [--dir=LOCAL] [--drive=RESPALDO] [--apply]'); process.exit(2); }

const LOCAL = path.join(ROOT, '.arte-local.json');
const cfg = fs.existsSync(LOCAL) ? JSON.parse(fs.readFileSync(LOCAL, 'utf8')) : {};

function detectDrive() {
  for (const L of 'IJKLMNOPQRSTUVWXYZGHFED') for (const my of ['My Drive', 'Mi unidad']) {
    const p = `${L}:\\${my}\\Galerías de arte\\Respaldo`;
    if (fs.existsSync(path.dirname(p))) return p;
  }
  return null;
}
const lib = flag('dir') || process.env.ARTE_IMAGENES || cfg.imagenes;
const drive = flag('drive') || process.env.ARTE_DRIVE || cfg.drive || detectDrive();
if (!lib) { console.error('Falta la biblioteca local: corré antes link-images.mjs --dir=RUTA --save --apply, o pasá --dir=RUTA.'); process.exit(2); }
if (!drive) { console.error('No encuentro "Galerías de arte" en Drive. ¿Drive para escritorio está abierto? Podés pasar --drive=RUTA.'); process.exit(2); }

const [src, dst] = mode === 'backup' ? [path.resolve(lib), path.resolve(drive)] : [path.resolve(drive), path.resolve(lib)];
if (!fs.existsSync(src)) { console.error(`No existe el origen: ${src}`); process.exit(2); }
if (!fs.existsSync(path.dirname(dst))) { console.error(`No existe la carpeta madre del destino: ${path.dirname(dst)} (¿disco o Drive desconectado?).`); process.exit(2); }
console.log(`${mode === 'backup' ? 'RESPALDO' : 'RESTAURACIÓN'} · ${APPLY ? 'APPLY' : 'dry-run'}\n  origen:  ${src}\n  destino: ${dst}\n`);

// robocopy: /E subcarpetas, sin /MIR ni /PURGE => no borra. Se excluye _dedup_removed (obras apartadas) y se copian solo imágenes.
const rc = ['robocopy', src, dst, '*.jpg', '*.jpeg', '*.png', '*.webp', '*.tif', '*.tiff', '/E', '/XD', '_dedup_removed', '/R:2', '/W:3', '/NP', '/NDL', '/NJH', ...(APPLY ? [] : ['/L'])];
const r = spawnSync(rc[0], rc.slice(1), { encoding: 'utf8', shell: false });
const out = (r.stdout || '').split('\n');
const sum = out.filter(l => /Dirs :|Files :|Bytes :|Archivos:|Bytes:|Directorios:/i.test(l));
console.log((APPLY ? out.filter(l => /\*EXTRA|NUEVO|New File|Nuevo|más reciente|Newer|FAILED|ERROR/i.test(l)).slice(0, 15) : out.filter(l => /New File|Nuevo/i.test(l)).slice(0, 8)).join('\n'));
console.log(sum.join('\n') || out.slice(-12).join('\n'));
const code = r.status ?? 99;   // robocopy: 0-7 = ok (bits: 1 copió, 2 extras, 4 diferencias); >=8 = error
if (code >= 8) { console.error(`\n✗ robocopy terminó con error (código ${code}).`); process.exit(1); }
console.log(`\n✓ robocopy código ${code} (0-7 = sin errores).${APPLY ? '' : ' Dry-run: agregá --apply para copiar.'}`);

if (mode === 'restore' && APPLY) {
  console.log('\nRearmando enlaces del repo con la biblioteca…');
  const l = spawnSync('node', ['tools/link-images.mjs', `--dir=${lib}`, '--save', '--apply'], { stdio: 'inherit' });
  process.exit(l.status ?? 0);
}
