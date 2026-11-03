// Hojas de contacto para revisar a ojo que cada ficha corresponda a su imagen (miniatura + "n título — autor, año").
// Solo lectura sobre la biblioteca; escribe JPGs en --out. Por defecto, las obras SIN qid válido.
// Uso: node tools/contact-sheets.mjs --out=RUTA [--col=13_vanguardias,14_surrealismo | --all] [--all-items] [--per=20]
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const flag = (n) => args.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const OUT = path.resolve(flag('out') || '_inspect/sheets');
const PER = Number(flag('per') || 20), COLS = 5, CW = 400, IH = 290, LH = 44;
const base = fs.existsSync(path.join(ROOT, 'colecciones')) ? path.join(ROOT, 'colecciones') : ROOT;
const all = fs.readdirSync(base).filter(d => /^\d\d_/.test(d) && fs.existsSync(path.join(base, d, '_index.json')));
const cols = flag('col') ? flag('col').split(',') : all;
const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
fs.mkdirSync(OUT, { recursive: true });
let total = 0;
for (const col of cols) {
  const idx = JSON.parse(fs.readFileSync(path.join(base, col, '_index.json'), 'utf8'));
  const items = idx.items.filter(it => args.includes('--all-items') || !/^Q\d+$/.test(it.qid || ''));
  for (let s = 0; s * PER < items.length; s++) {
    const chunk = items.slice(s * PER, (s + 1) * PER);
    const rows = Math.ceil(chunk.length / COLS);
    const comps = [];
    for (let i = 0; i < chunk.length; i++) {
      const it = chunk[i];
      const x = (i % COLS) * CW, y = Math.floor(i / COLS) * (IH + LH);
      try {
        const buf = await sharp(path.join(base, col, it.orientation || 'landscape', it.file), { limitInputPixels: false })
          .resize(CW - 6, IH - 6, { fit: 'inside', background: '#222' }).jpeg({ quality: 72 }).toBuffer();
        comps.push({ input: buf, left: x + 3, top: y + 3 });
      } catch (e) { /* miniatura vacía: se ve el hueco */ }
      const l1 = cut(`${it.n}  ${it.title_es || it.title}`, 52), l2 = cut(`${it.artist || ''}${it.year ? ', ' + it.year : ''}`, 56);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${LH}"><rect width="100%" height="100%" fill="#111"/><text x="6" y="17" font-family="Arial" font-size="15" font-weight="bold" fill="#fff">${esc(l1)}</text><text x="6" y="37" font-family="Arial" font-size="13" fill="#bbb">${esc(l2)}</text></svg>`;
      comps.push({ input: Buffer.from(svg), left: x, top: y + IH });
    }
    const name = `${col}_${String(s + 1).padStart(2, '0')}.jpg`;
    await sharp({ create: { width: COLS * CW, height: rows * (IH + LH), channels: 3, background: '#333' } })
      .composite(comps).jpeg({ quality: 78 }).toFile(path.join(OUT, name));
    total += chunk.length;
  }
  console.log(`${col}: ${items.length} obras`);
}
console.log(`TOTAL ${total} miniaturas → ${OUT}`);
