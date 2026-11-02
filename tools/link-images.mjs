// Conecta el repo con la biblioteca de imágenes (que vive FUERA del repo, una ruta distinta por PC).
// Crea en cada colección, enlaces (junctions de Windows) landscape/, portrait/ y _dedup_removed/ -> <biblioteca>/<col>/<lo mismo>,
// así todos los scripts siguen viendo <col>/landscape/... sin cambiar una línea.
//
// Ruta de la biblioteca (la primera que exista): --dir=RUTA · variable ARTE_IMAGENES · archivo local .arte-local.json {"imagenes": "RUTA"} (ignorado por git).
// Dry-run por defecto; --apply crea las carpetas destino y los enlaces. --save guarda --dir en .arte-local.json.
// Uso: node tools/link-images.mjs [--dir=RUTA] [--save] [--apply]
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const flag = (n) => args.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const APPLY = args.includes('--apply');
const LOCAL = path.join(ROOT, '.arte-local.json');
const SUBS = ['landscape', 'portrait', '_dedup_removed'];

let lib = flag('dir') || process.env.ARTE_IMAGENES;
if (!lib && fs.existsSync(LOCAL)) lib = JSON.parse(fs.readFileSync(LOCAL, 'utf8')).imagenes;
if (!lib) { console.error('Falta la ruta: pasá --dir=RUTA, definí ARTE_IMAGENES o creá .arte-local.json {"imagenes":"RUTA"}.'); process.exit(2); }
lib = path.resolve(lib);
if (!fs.existsSync(path.dirname(lib))) { console.error(`No existe ni la carpeta madre de ${lib} (¿disco desconectado?). No hago nada.`); process.exit(2); }
if (args.includes('--save') && APPLY) fs.writeFileSync(LOCAL, JSON.stringify({ imagenes: lib }, null, 2) + '\n');

const base = fs.existsSync(path.join(ROOT, 'colecciones')) ? path.join(ROOT, 'colecciones') : ROOT;
const cols = fs.readdirSync(base).filter(d => /^\d\d_/.test(d) && fs.existsSync(path.join(base, d, '_index.json')));
console.log(`Biblioteca: ${lib}${fs.existsSync(lib) ? '' : '  (todavía no existe)'}\nColecciones: ${cols.length} · modo: ${APPLY ? 'APPLY' : 'dry-run'}\n`);

let linked = 0, already = 0, problems = 0;
for (const c of cols) {
  for (const s of SUBS) {
    const link = path.join(base, c, s);
    const target = path.join(lib, c, s);
    let st = null;
    try { st = fs.lstatSync(link); } catch { /* no existe */ }
    if (st?.isSymbolicLink()) { already++; continue; }                 // ya enlazado (junction aparece como symlink)
    if (st) {
      const n = fs.readdirSync(link).length;
      if (n > 0) { console.log(`  ✗ ${c}/${s}: carpeta REAL con ${n} archivos. Movela a ${target} y volvé a correr (no toco nada).`); problems++; continue; }
      if (APPLY) fs.rmdirSync(link);                                   // vacía: se reemplaza por el enlace
    }
    console.log(`  ${APPLY ? '+' : '·'} ${c}/${s} -> ${target}`);
    if (APPLY) { fs.mkdirSync(target, { recursive: true }); fs.symlinkSync(target, link, 'junction'); }
    linked++;
  }
}
console.log(`\nEnlaces ${APPLY ? 'creados' : 'a crear'}: ${linked} · ya existentes: ${already} · problemas: ${problems}`);
if (!APPLY) console.log('Dry-run: agregá --apply (y --save para recordar la ruta en esta PC).');
