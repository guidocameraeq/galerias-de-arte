// tools/lib.mjs — motor reutilizable del proyecto "Arte"
// Node v18+ (usa fetch nativo). Sin dependencias externas.
import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---------- Nombres de archivo ----------
// Sin acentos, sin caracteres raros, sin espacios. Guion bajo como separador.
export function slugify(s, maxLen = 60) {
  if (!s) return 'Sin_titulo';
  const noAccents = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return noAccents
    .replace(/&/g, ' y ')
    .replace(/[^A-Za-z0-9]+/g, '_')   // todo lo no alfanumérico -> _
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, maxLen)
    .replace(/_+$/g, '') || 'Sin_titulo';
}

export function buildFilename(n, title, artist, year) {
  const nn = String(n).padStart(2, '0');
  const t = slugify(title, 60);
  const a = slugify(artist || 'Anonimo', 28);
  const y = (year && String(year).trim()) ? slugify(String(year), 12) : 'sa';
  return `${nn}_${t}_${a}_${y}.jpg`;
}

// ---------- Limpieza de metadata (markup Wikibase/QS, bios, rangos de año) ----------
export const cutQS = (s) => String(s || '')
  .replace(/&amp;/gi, 'and').replace(/&#0?39;|&rsquo;|&apos;/gi, "'").replace(/&[a-z]+;/gi, ' ') // entidades HTML
  .replace(/(date|title|label)\s+QS:.*$/i, '')   // "1809date QS:..." -> "1809" (capta pegados)
  .replace(/\s*QS:.*$/i, '')
  .replace(/\s+/g, ' ').trim();
const dedupGlued = (s) => { const m = String(s || '').match(/^(.+?)\1$/); return m ? m[1].trim() : s; };
export function cleanArtist(s) {
  s = dedupGlued(cutQS(s))
    .replace(/\s*[–-]\s*Artist\b.*$/i, '')
    .replace(/\s*\(\s*\d{3,4}\b.*$/, '')          // "(1769 - 1847)..."
    .replace(/\s*\([^)]*\)\s*$/, '')              // cola entre paréntesis "(Low Countries?)"
    .replace(/\bDetails on Google Art Project\b/i, '')
    .replace(/[,;–-]\s*$/, '').trim();
  // nombre de institución/fuente colado como autor -> anónimo
  if (/\b(rijksmuseum|museum|gallery|galerie|collection|biblioth|library|kunsthalle|pinacotec|metropolitan)\b/i.test(s)) return 'Anonimo';
  return (!s || /^(unknown|anonymous|anonym|anonimo|no name)/i.test(s)) ? 'Anonimo' : s;
}
export function cleanYear(s) {           // rangos/circa/BC -> año limpio (idempotente)
  s = cutQS(s);
  if (!s || /^unknown\b/i.test(s)) return '';
  if (/^c?\d{3,4}(_BC)?$/i.test(s)) return s;   // ya está en forma compacta -> no re-tocar
  if (/\bb\.?\s*c\.?e?\b/i.test(s)) { const m = s.match(/\d+/); return m ? m[0] + '_BC' : ''; }
  const m = s.match(/\d{3,4}/);
  if (m) return (/circa|ca\.?|c\.|between|hacia|after|before/i.test(s) ? 'c' : '') + m[0];
  return s;
}
export function cleanTitle(s) {
  s = cutQS(s)
    .replace(/^\s*(German|Spanish|Dutch|French|Italian|Latin|Russian|Polish|Portuguese|Czech|Swedish|English)\s*:\s*/i, '') // prefijo de idioma
    .replace(/^[^()]{2,45}\(\s*\d{3,4}\s*[-–]\s*\d{3,4}\s*\)\s*(?=\S)/, '')  // "Murillo (1617-1682) Título" -> "Título" (solo si hay título después)
    .replace(/\s*\(\s*\d{3,4}\s*[-–]\s*\d{3,4}\s*\)/g, '')  // fechas-bio sueltas "(1626-1663)" -> fuera (deja "Hendrickje Stoffels")
    .replace(/\s*[-–,]\s*(Museo|Museum|Galleria|Galerie|Gallery|Rijksmuseum|Mauritshuis|Louvre|Prado)\b.*$/i, '') // cola con nombre de museo
    .replace(/([a-z0-9])(label|title)\b/gi, '$1')   // "Baucislabel"/"Luncheontitle"/"45label" -> pegado fuera
    .replace(/\b(label|title)$/i, '')
    .replace(/\s*[-–]?\s*(Getty Center|Google Art Project|National Gallery[^,]*)\s*$/i, '')
    .replace(/\s+/g, ' ').trim();
  return dedupPhrase(s);
}
// Colapsa títulos repetidos/traducidos por palabras (seguro: conserva la 1ª frase completa).
function dedupPhrase(s) {
  const w = s.split(' ');
  // "A A" o "A A'" (2ª mitad repite la 1ª; última palabra puede venir truncada)
  if (w.length >= 4 && w.length % 2 === 0) {
    const h = w.length / 2, a = w.slice(0, h), b = w.slice(h);
    const eq = (x) => x.join(' ').toLowerCase();
    if (a[0].toLowerCase() === b[0].toLowerCase() && eq(a.slice(0, -1)) === eq(b.slice(0, -1))) return a.join(' ');
  }
  // "P … P": el bloque inicial (≥2 palabras) reaparece -> quedarse con P
  for (let len = Math.floor(w.length / 2); len >= 2; len--) {
    const p = w.slice(0, len).join(' ').toLowerCase();
    if (w.slice(len).join(' ').toLowerCase().includes(p)) return w.slice(0, len).join(' ');
  }
  return s;
}

// ---------- Medición de dimensiones (sin Pillow) ----------
export function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xFF || buf[1] !== 0xD8) return null;
  let o = 2;
  while (o < buf.length - 8) {
    if (buf[o] !== 0xFF) { o++; continue; }
    const m = buf[o + 1];
    // SOF markers con dimensiones (excluye C4=DHT, C8=JPG, CC=DAC)
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {
      return { h: buf.readUInt16BE(o + 5), w: buf.readUInt16BE(o + 7) };
    }
    if (m === 0xD8 || m === 0xD9 || (m >= 0xD0 && m <= 0xD7)) { o += 2; continue; }
    if (o + 4 > buf.length) break;
    const len = buf.readUInt16BE(o + 2);
    if (len < 2) break;
    o += 2 + len;
  }
  return null;
}

export function pngSize(buf) {
  if (buf.length < 24) return null;
  const sig = '89504e470d0a1a0a';
  if (buf.slice(0, 8).toString('hex') !== sig) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

// WebP (RIFF....WEBP): VP8X (canvas), VP8 (lossy) y VP8L (lossless). Hay obras guardadas como .jpg que son WebP.
export function webpSize(b) {
  if (!b || b.length < 30 || b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const t = b.toString('ascii', 12, 16);
  if (t === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (t === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (t === 'VP8L') { const v = b.readUInt32LE(21); return { w: (v & 0x3fff) + 1, h: ((v >> 14) & 0x3fff) + 1 }; }
  return null;
}

export function imgSize(buf) {
  return jpegSize(buf) || pngSize(buf) || webpSize(buf) || null;
}

// Mide una imagen remota pidiendo solo el principio (Range). Devuelve {w,h,bytesFetched,ranged}.
// Si el server no soporta Range o no se pudo medir con el trozo, baja entero y mide.
export async function measureRemote(url, { ua } = {}) {
  const headers = { Range: 'bytes=0-262143' };
  if (ua) headers['User-Agent'] = ua;
  try {
    const r = await fetch(url, { headers });
    const buf = Buffer.from(await r.arrayBuffer());
    const sz = imgSize(buf);
    if (sz) return { ...sz, bytesFetched: buf.length, ranged: r.status === 206 };
  } catch { /* cae al full */ }
  // Fallback: bajar entero
  const r2 = await fetch(url, ua ? { headers: { 'User-Agent': ua } } : undefined);
  const buf2 = Buffer.from(await r2.arrayBuffer());
  const sz2 = imgSize(buf2);
  return sz2 ? { ...sz2, bytesFetched: buf2.length, ranged: false, fullBuffer: buf2 }
             : { w: 0, h: 0, bytesFetched: buf2.length, ranged: false, fullBuffer: buf2 };
}

export const orientationOf = (w, h) => (w >= h ? 'landscape' : 'portrait');

// ---------- HTTP con reintento + throttle ----------
export async function getJSON(url, { retries = 4, ua, delay = 0 } = {}) {
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch(url, ua ? { headers: { 'User-Agent': ua } } : undefined);
      if (r.status === 429 || r.status >= 500 || r.status === 403) throw new Error('HTTP ' + r.status);
      const txt = await r.text();
      // A veces (rate-limit/Cloudflare) responde HTML con 200 -> reintentar
      if (/^\s*</.test(txt)) throw new Error('respuesta no-JSON (HTML)');
      const j = JSON.parse(txt);
      if (delay) await sleep(delay);
      return j;
    } catch (e) {
      if (i === retries) throw e;
      await sleep(500 * (i + 1) + 400 * i);
    }
  }
}

// ¿El buffer empieza como una imagen real que el proyecto sabe medir? (magic bytes JPEG/PNG/WebP).
// Una página de error HTML —p.ej. el rate-limit 429 de Wikimedia servido con HTTP 200— NO pasa.
// TIFF queda afuera a propósito: imgSize no lo mide y audit lo marcaría F-MAGIC.
export function looksLikeImage(buf) {
  if (!buf || buf.length < 1000) return false;
  const jpeg = buf[0] === 0xFF && buf[1] === 0xD8;
  const png = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
  const webp = buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
  return jpeg || png || webp;
}

// validate (default true): rechaza lo que no sea imagen. Antes solo se miraba el status HTTP y
// una página de error con 200 se guardaba como .jpg (155 archivos de la col 17 quedaron así).
export async function downloadTo(url, destPath, { ua, preBuffer, retries = 3, validate = true } = {}) {
  let buf = preBuffer;
  if (buf && validate && !looksLikeImage(buf)) throw new Error('preBuffer no es una imagen (¿página de error?)');
  if (!buf) {
    let lastErr;
    for (let i = 0; i <= retries; i++) {
      try {
        const r = await fetch(url, ua ? { headers: { 'User-Agent': ua } } : undefined);
        if (!r.ok) throw new Error('download HTTP ' + r.status);
        const b = Buffer.from(await r.arrayBuffer());
        if (validate && !looksLikeImage(b)) throw new Error('download no es una imagen (' + b.length + ' B, ¿página de error / rate-limit?)');
        buf = b;
        break;
      } catch (e) { lastErr = e; if (i < retries) await sleep(600 * (i + 1)); }  // backoff ante "terminated"/red/rate-limit
    }
    if (!buf) throw lastErr;
  }
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, buf);
  return buf;   // devolver el buffer real para poder medir las dimensiones efectivas
}

// ---------- _index.json e idempotencia ----------
export function resolveColDir(rootDir, colName) {
  if (!colName) return rootDir;
  if (path.isAbsolute(colName) && existsSync(colName)) return colName;
  const inCols = path.join(rootDir, 'colecciones', colName);
  if (existsSync(inCols)) return inCols;
  const inRoot = path.join(rootDir, colName);
  if (existsSync(inRoot)) return inRoot;
  return inCols;
}

export async function loadIndex(colDir) {
  const p = path.join(colDir, '_index.json');
  let txt;
  try { txt = await fs.readFile(p, 'utf8'); }
  catch (e) { if (e.code === 'ENOENT') return { collection: path.basename(colDir), items: [] }; throw e; }
  // JSON roto => LANZA. Antes devolvía un índice vacío y el siguiente saveIndex pisaba la colección entera.
  return JSON.parse(txt);
}
export async function saveIndex(colDir, idx) {
  const p = path.join(colDir, '_index.json');
  await fs.writeFile(p, JSON.stringify(idx, null, 2));
}
// Clave de identidad para no rebajar: "museo:id"
export const idKey = (museum, id) => `${museum}:${id}`;
export function alreadyHave(idx, museum, id) {
  const k = idKey(museum, id);
  return idx.items.some(it => idKey(it.museum, it.sourceId) === k);
}

// ---------- Log de descartes ----------
export async function logDiscard(rootDir, collection, entry) {
  const p = path.join(rootDir, '_descartes', `${collection}.jsonl`);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.appendFile(p, JSON.stringify(entry) + '\n');
}

export const MIN_LONG_SIDE = 1000;      // piso duro anti-basura
export const PREFER_LONG_SIDE = 1920;   // preferencia (solo descubrimiento)
