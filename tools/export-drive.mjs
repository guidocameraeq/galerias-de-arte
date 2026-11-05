// Exporta colecciones de la biblioteca a carpetas para la app Museum Slideshow (formato en docs/FORMATO_DRIVE.md).
// Una colección = una subcarpeta <OUT>/<Título>/ con las imágenes y un galeria.json (formato 1). Las imágenes de la biblioteca
// NO se tocan: por defecto se COPIAN tal cual (con la extensión real del contenido); con --max-side=N se escribe una copia reducida
// (derivado de entrega; el original queda intacto). Dry-run por defecto; --apply escribe. Nunca borra nada: lo que ya no está en la
// galería (obra reemplazada, versión vieja con el mismo nombre) se MUEVE a <Drive>/Galerías de arte/_retiradas/<Título>/.
// Sin --out busca solo la carpeta de Drive en cualquier letra (<X>:My Drive|Mi unidadGalerías de arteGalerías).
// Uso: node tools/export-drive.mjs (--col=11_rococo[,08_impresionismo] | --all) [--out=RUTA] [--max-side=3840] [--big-max-side=3840] [--apply]
// Respeta la curaduría hecha en Drive: si una obra estaba en el galeria.json anterior y su imagen ya no está en la carpeta,
// se la considera BORRADA por Guido: NO se vuelve a copiar, y se sigue listando (la app la saltea) hasta que
// tools/drive-curation.mjs la saque del repo. Freno: si falta >30% de una galería, no se toca (salvo --force).
// Si una obra cambia de título (y de nombre de archivo), el archivo viejo se RENOMBRA en lugar de duplicarse.
// Tondos/medallones: tools/forma-tondos.json  { "<qid o sourceId>": "redonda" | "ovalada" }
import fs from 'fs';
import path from 'path';
import { slugify } from './lib.mjs';
import { tituloDe, idsGaleria } from './galerias.mjs';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const flag = (n) => args.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const APPLY = args.includes('--apply');
const detectDrive = () => {
  for (const L of 'DEFGHIJKLMNOPQRSTUVWXYZ') for (const my of ['My Drive', 'Mi unidad']) {
    const p = path.join(`${L}:\\`, my, 'Galerías de arte', 'Galerías');
    if (fs.existsSync(p)) return p;
  }
  return null;
};
const OUT = path.resolve(flag('out') || detectDrive() || (console.error('No encuentro "Galerías de arte/Galerías" en Drive (¿Drive para escritorio abierto?). Pasá --out=RUTA.'), process.exit(2)));
const MAXSIDE = flag('max-side') ? Number(flag('max-side')) : 0;
const FORCE = args.includes('--force');
const BIGSIDE = flag('big-max-side') ? Number(flag('big-max-side')) : 0;   // reduce SOLO los archivos >50 MB (límite de la app)

const base = fs.existsSync(path.join(ROOT, 'colecciones')) ? path.join(ROOT, 'colecciones') : ROOT;
const allCols = fs.readdirSync(base).filter(d => /^\d\d_/.test(d) && fs.existsSync(path.join(base, d, '_index.json')));
const cols = args.includes('--all') ? allCols : (flag('col') || '').split(',').filter(Boolean);
if (!cols.length) { console.error('Uso: node tools/export-drive.mjs (--col=a,b | --all) [--out=RUTA] [--max-side=3840] [--apply]'); process.exit(2); }
const formaMap = fs.existsSync(path.join(ROOT, 'tools/forma-tondos.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/forma-tondos.json'), 'utf8')) : {};

const realExt = (buf) => buf[0] === 0xFF && buf[1] === 0xD8 ? '.jpg' : buf[0] === 0x89 && buf[1] === 0x50 ? '.png' : buf.slice(0, 4).toString() === 'RIFF' ? '.webp' : null;
const normLic = (l = '') => /copyright|uso personal/i.test(l) ? 'Uso personal' : /cc0/i.test(l) ? 'CC0' : /public domain|dominio p/i.test(l) ? 'Dominio público' : (l || '').replace(/\s*\(verificar\)/i, '').trim();
const credito = (it) => {
  const lic = normLic(it.license);
  const via = /commons|wikidata|wikimedia/i.test(it.museum || '') ? 'Wikimedia Commons' : (it.museum || '');
  if (lic === 'Uso personal') return via ? `Imagen para uso personal, vía ${via}` : 'Imagen para uso personal';
  return [lic, via && `vía ${via}`].filter(Boolean).join(', ');
};
const vacio = (d) => !d || /^\(sin /.test(d);
const mdLike = (t) => /(\*\*|__|^#|\]\(|<[a-z/][^>]*>)/m.test(t);

let sharp = null;
if (MAXSIDE || BIGSIDE) sharp = (await import('sharp')).default;

console.log(`EXPORTAR · ${APPLY ? 'APPLY' : 'dry-run'} · destino ${OUT}${MAXSIDE ? ` · copias reducidas a ${MAXSIDE}px` : ' · originales tal cual'}\n`);
let totObras = 0, totBytes = 0, totProblemas = 0;
for (const col of cols) {
  const colDir = path.join(base, col);
  if (!fs.existsSync(path.join(colDir, '_index.json'))) { console.log(`✗ ${col}: no existe`); totProblemas++; continue; }
  const idx = JSON.parse(fs.readFileSync(path.join(colDir, '_index.json'), 'utf8'));
  const titulo = tituloDe(col);
  if (/[<>:"/\\|?*]/.test(titulo)) { console.log(`✗ ${col}: el título "${titulo}" tiene un carácter que Windows/Drive no acepta en carpetas (: / \\ ? * " < > |). Cambialo en tools/galerias.mjs.`); totProblemas++; continue; }
  const dir = path.join(OUT, titulo);
  const usedFiles = new Set(), obras = [], plan = [], problemas = [], borradas = [];
  const ids = idsGaleria(idx.items, col);
  // Exportación anterior (si existe): id → archivo, para renombrar y para detectar lo que Guido borró
  const prevPath = path.join(dir, 'galeria.json');
  const prev = new Map();
  if (fs.existsSync(prevPath)) { try { for (const o of JSON.parse(fs.readFileSync(prevPath, 'utf8')).obras || []) if (o.id) prev.set(o.id, o.archivo); } catch { problemas.push('galeria.json anterior ilegible: no se detectan borrados'); } }
  for (const it of [...idx.items].sort((a, b) => a.n - b.n)) {
    const src = path.join(colDir, it.orientation || 'landscape', it.file);
    if (!fs.existsSync(src)) { problemas.push(`n${it.n}: falta ${it.file}`); continue; }
    const fd = fs.openSync(src, 'r'); const head = Buffer.alloc(16); fs.readSync(fd, head, 0, 16, 0); fs.closeSync(fd);
    const ext = realExt(head);
    if (!ext) { problemas.push(`n${it.n}: ${it.file} no es una imagen válida`); continue; }
    const ttl = it.title_es || it.title;
    let stem = [slugify(it.artist || 'Anonimo', 30), slugify(ttl, 50), slugify(String(it.year || 'sa'), 12)].join('-').toLowerCase().replace(/_/g, '-');
    if (usedFiles.has(stem)) stem += '-' + String(it.n).padStart(3, '0');
    usedFiles.add(stem);
    const archivo = stem + ext;
    const id = ids.get(it);
    const prevFile = [id, it.qid, it.sourceId, it.source_url, it.image_url, `${col}:${it.n}`, `${it.qid}#${it.n}`].filter(Boolean).map(k => prev.get(k)).find(Boolean);
    const borrada = prevFile && !fs.existsSync(path.join(dir, prevFile)) && !fs.existsSync(path.join(dir, archivo));   // Guido la borró en Drive
    if (borrada) borradas.push(`n${it.n} ${ttl}`);
    const forma = formaMap[it.qid] || formaMap[it.sourceId] || it.forma;
    const o = { archivo, titulo: ttl, autor: it.artist, anio: it.year ? String(it.year) : undefined, movimiento: it.school || undefined,
      tecnica: it.type || undefined, ubicacion: it.holding_museum || undefined, forma: forma || undefined,
      explicacion: vacio(it.description) ? undefined : it.description, credito: credito(it) || undefined,
      licencia: normLic(it.license) || undefined, fuente: it.source_url || it.image_url || undefined, id };
    Object.keys(o).forEach(k => o[k] === undefined && delete o[k]);
    if (o.explicacion && mdLike(o.explicacion)) problemas.push(`n${it.n}: la explicación parece tener Markdown/HTML`);
    if (borrada) { o.archivo = prevFile; obras.push(o); continue; }   // se sigue listando (la app la saltea) para que drive-curation la detecte; no se re-sube
    obras.push(o); plan.push({ src, dest: path.join(dir, archivo), prev: prevFile && prevFile !== archivo ? path.join(dir, prevFile) : null, size: fs.statSync(src).size });
  }
  const gal = { formato: 1, titulo, obras };
  const json = JSON.stringify(gal, null, 2) + '\n';
  JSON.parse(json);
  if (Buffer.byteLength(json) > 1e6) problemas.push('galeria.json supera 1 MB');
  const bytes = plan.reduce((s, p) => s + p.size, 0);
  const sinExp = obras.filter(o => !o.explicacion).length;
  const grandes = plan.filter(p => p.size > 50e6).length;
  if (grandes) problemas.push(`${grandes} archivo(s) >50 MB (límite de la app; usar --max-side)`);
  console.log(`${problemas.length ? '⚠' : '✓'} ${col} → "${titulo}": ${obras.length}/${idx.items.length} obras · ${(bytes / 1e6).toFixed(0)} MB · sin explicación: ${sinExp} · tondos marcados: ${obras.filter(o => o.forma).length}`);
  problemas.slice(0, 8).forEach(p => console.log(`    ${p}`));
  if (borradas.length) console.log(`    🗑 ${borradas.length} borrada(s) en Drive (no se re-suben): ${borradas.slice(0, 4).join(' · ')}${borradas.length > 4 ? ' …' : ''} → sacalas del repo con: node tools/drive-curation.mjs`);
  totObras += obras.length; totBytes += bytes; totProblemas += problemas.length;
  if (borradas.length && borradas.length > 0.3 * idx.items.length && !FORCE) { console.log(`    ✗ faltan ${borradas.length}/${idx.items.length} imágenes en Drive (>30%): ¿Drive sincronizando? No se toca esta galería (--force si es a propósito).`); totProblemas++; continue; }
  // Versión vieja con el mismo nombre (obra reemplazada por una de más resolución): mismo nombre, otro tamaño, sin reducción de por medio
  const sideDe = (p) => MAXSIDE || (BIGSIDE && p.size > 50e6 ? BIGSIDE : 0);
  const viejas = plan.filter(p => !sideDe(p) && fs.existsSync(p.dest) && fs.statSync(p.dest).size !== p.size);
  // Archivos en Drive que ya no están en la galería (obra reemplazada o colección reconstruida): se MUEVEN a _retiradas, nunca se borran
  const listados = new Set(obras.map(o => o.archivo));
  const sobrantes = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp)$/i.test(f) && !listados.has(f) && !plan.some(p => p.prev && path.basename(p.prev) === f)) : [];
  if (viejas.length) console.log(`    ↻ ${viejas.length} versión(es) vieja(s) con el mismo nombre: se reemplazan (la vieja va a _retiradas)`);
  if (sobrantes.length) console.log(`    ⇢ ${sobrantes.length} archivo(s) que ya no están en la galería: se mueven a _retiradas`);
  if (!APPLY) continue;
  fs.mkdirSync(dir, { recursive: true });
  const ret = path.join(path.dirname(OUT), '_retiradas', titulo);
  const retirar = (f) => { fs.mkdirSync(ret, { recursive: true }); let d = path.join(ret, f); if (fs.existsSync(d)) d = path.join(ret, `${Date.now()}-${f}`); fs.renameSync(path.join(dir, f), d); };
  for (const p of viejas) retirar(path.basename(p.dest));
  for (const f of sobrantes) retirar(f);
  let hechos = 0, renombradas = 0;
  for (const p of plan) {
    if (fs.existsSync(p.dest) && !viejas.includes(p)) continue;   // idempotente: no pisa (salvo la versión vieja ya apartada; Drive puede tardar en reflejar el movimiento)
    if (p.prev && fs.existsSync(p.prev)) { fs.renameSync(p.prev, p.dest); renombradas++; continue; }   // cambió el título: renombrar, no duplicar
    const side = MAXSIDE || (BIGSIDE && p.size > 50e6 ? BIGSIDE : 0);
    if (side) {
      const m = await sharp(p.src).metadata();
      if (Math.max(m.width, m.height) > side) {
        const pipe = sharp(p.src).resize({ width: side, height: side, fit: 'inside', withoutEnlargement: true });
        await (m.format === 'png' ? pipe.png() : m.format === 'webp' ? pipe.webp({ quality: 92 }) : pipe.jpeg({ quality: 92 })).toFile(p.dest);
        hechos++; continue;
      }
    }
    fs.copyFileSync(p.src, p.dest); hechos++;
  }
  const gj = path.join(dir, 'galeria.json');
  const igual = fs.existsSync(gj) && fs.readFileSync(gj, 'utf8') === json;   // la app baja fichas solo si cambia: no tocar fecha/md5 si el contenido es el mismo
  if (!igual) fs.writeFileSync(gj, json, 'utf8');
  console.log(`    escrito: ${hechos} imágenes nuevas, ${renombradas} renombradas${igual ? ' · galeria.json sin cambios (no se tocó)' : ' + galeria.json'}`);
}
console.log(`\nTOTAL: ${cols.length} colección(es) · ${totObras} obras · ${(totBytes / 1e9).toFixed(2)} GB origen · problemas: ${totProblemas}${APPLY ? '' : '\nDry-run: agregá --apply para escribir.'}`);
