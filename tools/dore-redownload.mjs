// Re-descarga las imágenes de la colección 17 (Doré) que quedaron como páginas de
// error de Wikimedia (descarga original rate-limited 429 guardada como HTML).
// Robustez: URL autoritativa vía imageinfo, VALIDA magic bytes (rechaza HTML),
// serial+throttle (evita el 429 que causó el bug), re-mide dims reales.
// Uso: node tools/dore-redownload.mjs [--apply] [--limit=N] [--force]
import { loadIndex, saveIndex, getJSON, imgSize, orientationOf, sleep, colPath } from './lib.mjs';
import { promises as fsp, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const COL = '17_dore_divina_comedia';
const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');
const LIM = (process.argv.find(a => a.startsWith('--limit=')) || '').split('=')[1];
const LIMIT = LIM ? +LIM : Infinity;
const UA = 'Arte-PD-Collection/1.0 (+https://github.com/guidocameraeq/galerias-de-arte)';

const isImg = (buf) => buf && buf.length > 1000 &&
  ((buf[0] === 0xFF && buf[1] === 0xD8) ||                                   // JPEG
   (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47)); // PNG

const fileIsValid = (fp) => {
  if (!existsSync(fp)) return false;
  try { const b = readFileSync(fp); return isImg(b); } catch { return false; }
};

// imageinfo: File:Name -> { url, width, height } (lotes de 40)
async function urlsFor(titles) {
  const out = {};
  for (let i = 0; i < titles.length; i += 40) {
    const batch = titles.slice(i, i + 40);
    const u = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size&titles=${batch.map(encodeURIComponent).join('|')}`;
    const j = await getJSON(u, { ua: UA, retries: 4 });
    const pages = j?.query?.pages || {};
    // normalizaciones (espacios/guiones) para mapear de vuelta al title pedido
    const norm = {};
    for (const n of (j?.query?.normalized || [])) norm[n.to] = n.from;
    for (const pid of Object.keys(pages)) {
      const p = pages[pid]; const ii = p.imageinfo?.[0];
      if (!ii) continue;
      const asked = norm[p.title] || p.title;
      out[asked] = { url: ii.url, width: ii.width, height: ii.height };
    }
    await sleep(200);
  }
  return out;
}

async function fetchImg(url, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'image/jpeg,image/png,image/*' } });
      const buf = Buffer.from(await r.arrayBuffer());
      if (r.ok && isImg(buf)) return buf;
      last = `HTTP ${r.status} / ${buf.length}b / magic ${buf.slice(0, 4).toString('hex')}`;
    } catch (e) { last = String(e.message || e); }
    await sleep(800 * (i + 1) + 400 * i); // backoff (rate-limit)
  }
  throw new Error(last);
}

const idx = await loadIndex(COL);
let items = idx.items.filter(it => FORCE || !fileIsValid(path.join(colPath(COL), it.orientation, it.file)));
items = items.slice(0, LIMIT);
console.log(`Colección ${COL}: ${idx.items.length} obras. A re-descargar: ${items.length}${LIM ? ` (limit ${LIMIT})` : ''}. APPLY=${APPLY}`);

const titles = [...new Set(items.map(it => it.sourceId))];
console.log(`Pidiendo URLs autoritativas (imageinfo) para ${titles.length} archivos…`);
const urls = await urlsFor(titles);
const haveUrl = Object.keys(urls).length;
console.log(`URLs resueltas: ${haveUrl}/${titles.length}`);

let ok = 0, fail = 0, moved = 0;
for (const it of items) {
  const meta = urls[it.sourceId];
  if (!meta?.url) { console.log(`· n${it.n} SIN URL  ${it.sourceId}`); fail++; continue; }
  try {
    const buf = await fetchImg(meta.url);
    const sz = imgSize(buf) || { w: meta.width, h: meta.height };
    const ori = orientationOf(sz.w, sz.h);
    const destDir = path.join(colPath(COL), ori);
    const dest = path.join(destDir, it.file);
    if (APPLY) {
      await fsp.mkdir(destDir, { recursive: true });
      await fsp.writeFile(dest, buf);
      // si cambió la orientación respecto a la carpeta vieja, borrar el error-page viejo
      if (ori !== it.orientation) {
        const old = path.join(colPath(COL), it.orientation, it.file);
        if (existsSync(old)) await fsp.rm(old).catch(() => {});
        it.orientation = ori; moved++;
      }
      it.width = sz.w; it.height = sz.h; it.bytes = buf.length;
      it.image_url = meta.url;
    }
    ok++;
    console.log(`✓ n${String(it.n).padStart(3)} ${sz.w}x${sz.h} ${(buf.length/1024/1024).toFixed(1)}MB ${ori}  ${it.sourceId.slice(0,42)}`);
    if (APPLY) await saveIndex(COL, idx);
    await sleep(350); // throttle anti-429
  } catch (e) {
    fail++;
    console.log(`✗ n${it.n} FALLÓ  ${it.sourceId.slice(0,46)}  ::  ${String(e.message||e).slice(0,80)}`);
  }
}
console.log(`\n${APPLY ? 'APLICADO' : 'DRY (sin escribir)'}: OK=${ok} FALLÓ=${fail} reorientados=${moved}`);
if (!APPLY) console.log('Re-ejecutar con --apply para escribir los archivos y actualizar el índice.');
