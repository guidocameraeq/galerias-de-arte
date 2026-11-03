// Exporta colecciones de la biblioteca a carpetas para la app Museum Slideshow (formato en docs/FORMATO_DRIVE.md).
// Una colección = una subcarpeta <OUT>/<Título>/ con las imágenes y un galeria.json (formato 1). Las imágenes de la biblioteca
// NO se tocan: por defecto se COPIAN tal cual (con la extensión real del contenido); con --max-side=N se escribe una copia reducida
// (derivado de entrega; el original queda intacto). Dry-run por defecto; --apply escribe. Nunca borra nada.
// Uso: node tools/export-drive.mjs (--col=11_rococo[,08_impresionismo] | --all) [--out=RUTA] [--max-side=3840] [--apply]
// Tondos/medallones: tools/forma-tondos.json  { "<qid o sourceId>": "redonda" | "ovalada" }
import fs from 'fs';
import path from 'path';
import { slugify } from './lib.mjs';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const flag = (n) => args.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const APPLY = args.includes('--apply');
const OUT = path.resolve(flag('out') || '_export/Galerías');
const MAXSIDE = flag('max-side') ? Number(flag('max-side')) : 0;

const TITULOS = {
  '01_mitologia_griega_romana': 'Mitología griega y romana', '02_barroco': 'Barroco', '03_gotico': 'Gótico', '04_romanticismo': 'Romanticismo',
  '05_egipcio': 'Antiguo Egipto', '06_macabro_memento_mori': 'Macabro y memento mori', '07_alto_renacimiento': 'Alto Renacimiento',
  '08_impresionismo': 'Impresionismo', '09_postimpresionismo': 'Postimpresionismo', '10_realismo': 'Realismo', '11_rococo': 'Rococó',
  '12_simbolismo_modernismo': 'Simbolismo y Art Nouveau', '13_vanguardias': 'Vanguardias', '14_surrealismo': 'Surrealismo',
  '15_pop_americano': 'Pop Art americano', '16_neoclasicismo': 'Neoclasicismo', '17_dore_divina_comedia': 'Doré, La Divina Comedia',
  '18_escultura_griega': 'Escultura griega', '19_marcelo_canevari': 'Marcelo Canevari', '20_alfred_kubin': 'Alfred Kubin',
  '21_rob_gonsalves': 'Rob Gonsalves', '22_zdzislaw_beksinski': 'Zdzisław Beksiński', '23_mariusz_lewandowski': 'Mariusz Lewandowski',
};
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
if (MAXSIDE) sharp = (await import('sharp')).default;

console.log(`EXPORTAR · ${APPLY ? 'APPLY' : 'dry-run'} · destino ${OUT}${MAXSIDE ? ` · copias reducidas a ${MAXSIDE}px` : ' · originales tal cual'}\n`);
let totObras = 0, totBytes = 0, totProblemas = 0;
for (const col of cols) {
  const colDir = path.join(base, col);
  if (!fs.existsSync(path.join(colDir, '_index.json'))) { console.log(`✗ ${col}: no existe`); totProblemas++; continue; }
  const idx = JSON.parse(fs.readFileSync(path.join(colDir, '_index.json'), 'utf8'));
  const titulo = TITULOS[col] || col.replace(/^\d+_/, '').replace(/_/g, ' ');
  const dir = path.join(OUT, titulo);
  const usedFiles = new Set(), usedIds = new Set(), obras = [], plan = [], problemas = [];
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
    let id = it.qid || it.sourceId || `${col}:${it.n}`;
    if (usedIds.has(id)) id = it.sourceId && !usedIds.has(it.sourceId) ? it.sourceId : `${id}#${it.n}`;
    usedIds.add(id);
    const forma = formaMap[it.qid] || formaMap[it.sourceId];
    const o = { archivo, titulo: ttl, autor: it.artist, anio: it.year ? String(it.year) : undefined, movimiento: it.school || undefined,
      tecnica: it.type || undefined, ubicacion: it.holding_museum || undefined, forma: forma || undefined,
      explicacion: vacio(it.description) ? undefined : it.description, credito: credito(it) || undefined,
      licencia: normLic(it.license) || undefined, fuente: it.source_url || it.image_url || undefined, id };
    Object.keys(o).forEach(k => o[k] === undefined && delete o[k]);
    if (o.explicacion && mdLike(o.explicacion)) problemas.push(`n${it.n}: la explicación parece tener Markdown/HTML`);
    obras.push(o); plan.push({ src, dest: path.join(dir, archivo), size: fs.statSync(src).size });
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
  totObras += obras.length; totBytes += bytes; totProblemas += problemas.length;
  if (!APPLY) continue;
  fs.mkdirSync(dir, { recursive: true });
  let hechos = 0;
  for (const p of plan) {
    if (fs.existsSync(p.dest)) continue;                       // idempotente: no pisa
    if (MAXSIDE) {
      const m = await sharp(p.src).metadata();
      if (Math.max(m.width, m.height) > MAXSIDE) {
        const pipe = sharp(p.src).resize({ width: MAXSIDE, height: MAXSIDE, fit: 'inside', withoutEnlargement: true });
        await (m.format === 'png' ? pipe.png() : m.format === 'webp' ? pipe.webp({ quality: 92 }) : pipe.jpeg({ quality: 92 })).toFile(p.dest);
        hechos++; continue;
      }
    }
    fs.copyFileSync(p.src, p.dest); hechos++;
  }
  fs.writeFileSync(path.join(dir, 'galeria.json'), json, 'utf8');
  console.log(`    escrito: ${hechos} imágenes nuevas + galeria.json`);
}
console.log(`\nTOTAL: ${cols.length} colección(es) · ${totObras} obras · ${(totBytes / 1e9).toFixed(2)} GB origen · problemas: ${totProblemas}${APPLY ? '' : '\nDry-run: agregá --apply para escribir.'}`);
