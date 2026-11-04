// Genera una hoja de contacto (grid etiquetado con nXX) de los grabados de un canto,
// para dedup visual eficiente. Uso: node tools/dore-montage.mjs <Infierno|Purgatorio|Paraiso> <canto-num>
import { loadIndex, colPath } from './lib.mjs';
import sharp from 'sharp';
import path from 'node:path';
import { mkdirSync } from 'node:fs';

const COL = '17_dore_divina_comedia';
const cantica = process.argv[2];              // Infierno | Purgatorio | Paraiso
const canto = +process.argv[3];
mkdirSync('_inspect', { recursive: true });

const idx = await loadIndex(COL);
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const items = idx.items
  .filter(it => norm(it.title_es).toLowerCase().startsWith(norm(cantica).toLowerCase()) && it.canto === canto)
  .sort((a, b) => a.n - b.n);
if (!items.length) { console.log('Sin items para', cantica, canto); process.exit(0); }

const CELL = 300, COLS = Math.min(4, items.length), PAD = 6, LBL = 22;
const ROWS = Math.ceil(items.length / COLS);
const W = COLS * CELL + (COLS + 1) * PAD, H = ROWS * (CELL + LBL) + (ROWS + 1) * PAD;

const cells = [];
for (let i = 0; i < items.length; i++) {
  const it = items[i];
  const c = i % COLS, r = Math.floor(i / COLS);
  const x = PAD + c * (CELL + PAD), y = PAD + r * (CELL + LBL + PAD);
  const src = path.join(colPath(COL), it.orientation, it.file);
  const thumb = await sharp(src).resize(CELL, CELL, { fit: 'inside', background: '#fff' })
    .extend({ bottom: 0, background: '#fff' }).jpeg().toBuffer();
  const meta = await sharp(thumb).metadata();
  cells.push({ input: thumb, left: x, top: y + LBL });
  const label = `n${it.n}  ${it.width}x${it.height}  ${it.sourceId.replace(/[<&]/g, ' ').slice(0, 40)}`;
  const svg = Buffer.from(`<svg width="${CELL}" height="${LBL}"><rect width="100%" height="100%" fill="#222"/><text x="3" y="16" font-family="sans-serif" font-size="13" fill="#fff">${label}</text></svg>`);
  cells.push({ input: svg, left: x, top: y });
}
const out = `_inspect/montage_${norm(cantica)}_${canto}.jpg`;
await sharp({ create: { width: W, height: H, channels: 3, background: '#aaa' } })
  .composite(cells).jpeg({ quality: 84 }).toFile(out);
console.log(`${out}  (${items.length} grabados: ${items.map(i => 'n' + i.n).join(' ')})`);
