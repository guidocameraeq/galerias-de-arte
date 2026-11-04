// tools/resolve.mjs — resolutores por fuente. Devuelven un "hit" normalizado o null.
// hit = { museum, sourceId, title, artist, year, classification, license,
//         source_url, image_url, w, h, mime, note }
import { getJSON, measureRemote, sleep, MIN_LONG_SIDE } from './lib.mjs';
import { MET_DEPTS_PREF } from './targets-01.mjs';

const UA = 'Arte-PublicDomain-Project/1.0 (+https://github.com/guidocameraeq/galerias-de-arte)';
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const surname = (a) => norm(a).split(/\s+/).filter(Boolean).pop() || '';
const tokens = (t) => norm(t).match(/[a-z0-9]{4,}/g) || [];

// ---------------- MET ----------------
export async function resolveMet(target) {
  const s = await getJSON(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(target.q)}&hasImages=true`,
    { ua: UA, delay: 120 });
  const ids = (s.objectIDs || []).slice(0, 20);
  const want = surname(target.artist), wt = tokens(target.title);
  let best = null, bestScore = -1;
  for (const id of ids) {
    let o;
    try { o = await getJSON(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`, { ua: UA, delay: 90 }); }
    catch { continue; }
    if (!o.isPublicDomain || !o.primaryImage) continue;
    const an = norm(o.artistDisplayName);
    const tn = norm(o.title);
    let sc = 0;
    if (want && an.includes(want)) sc += 4;
    for (const w of wt) if (tn.includes(w)) sc += 1;
    if (MET_DEPTS_PREF.has(o.department)) sc += 0.5;
    if (sc > bestScore) { bestScore = sc; best = o; }
  }
  if (!best || bestScore < 2) return null;          // no hubo match decente
  const m = await measureRemote(best.primaryImage, { ua: UA });
  return {
    museum: 'The Met', sourceId: String(best.objectID),
    title: best.title, artist: best.artistDisplayName || 'Anonimo',
    year: best.objectDate || target.year, classification: best.classification || best.objectName || '',
    license: 'Public Domain', source_url: best.objectURL,
    image_url: best.primaryImage, w: m.w, h: m.h, mime: 'image/jpeg',
    preBuffer: m.fullBuffer, note: `score=${bestScore}`,
  };
}

// ---------------- CLEVELAND ----------------
export async function resolveCleveland(target) {
  const s = await getJSON(
    `https://openaccess-api.clevelandart.org/api/artworks/?q=${encodeURIComponent(target.q)}&cc0=1&has_image=1&limit=15`,
    { ua: UA, delay: 150 });
  const want = surname(target.artist), wt = tokens(target.title);
  let best = null, bestScore = -1;
  for (const o of (s.data || [])) {
    const img = o.images?.full?.url || o.images?.print?.url || o.images?.web?.url;
    if (!img) continue;
    const creators = norm((o.creators || []).map(c => c.description || '').join(' '));
    const tn = norm(o.title);
    let sc = 0;
    if (want && creators.includes(want)) sc += 4;
    for (const w of wt) if (tn.includes(w)) sc += 1;
    if (sc > bestScore) { bestScore = sc; best = o; best._img = img; }
  }
  if (!best || bestScore < 2) return null;
  // Elegir la mejor imagen JPEG (nunca el TIFF, que no podemos medir/convertir sin libs).
  // Dimensiones vienen de la API; preferimos el JPEG más grande disponible (print > web).
  const imgs = best.images || {};
  const jpgCandidates = ['print', 'web', 'full']
    .map(k => imgs[k]).filter(im => im && /\.jpe?g($|\?)/i.test(im.url || ''))
    .map(im => ({ url: im.url, w: parseInt(im.width) || 0, h: parseInt(im.height) || 0 }))
    .sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h));
  let pick = jpgCandidates[0];
  let note = `score=${bestScore}`;
  const tif = imgs.full && /\.tif/i.test(imgs.full.url || '') ? imgs.full : null;
  if (tif) note += ` (TIFF ${tif.width}x${tif.height} disponible, bajado print JPEG)`;
  if (!pick) { // ningún jpeg listado: medir lo que haya
    const m = await measureRemote(best._img, { ua: UA });
    pick = { url: best._img, w: m.w, h: m.h };
  }
  return {
    museum: 'Cleveland', sourceId: String(best.id),
    title: best.title, artist: (best.creators?.[0]?.description) || 'Anonimo',
    year: best.creation_date || target.year, classification: best.type || '',
    license: 'CC0', source_url: best.url || `https://www.clevelandart.org/art/${best.id}`,
    image_url: pick.url, w: pick.w, h: pick.h, mime: 'image/jpeg',
    note,
  };
}

// ---------------- WIKIMEDIA COMMONS ----------------
const PD_OK = (em) => {
  const lic = (em?.License?.value || '').toLowerCase();
  const short = (em?.LicenseShortName?.value || '').toLowerCase();
  const copyrighted = (em?.Copyrighted?.value || '').toLowerCase();
  if (lic === 'cc0' || lic === 'pd' || lic.startsWith('pd-')) return em && short;
  if (/public domain/.test(short) || /cc0/.test(short)) return short;
  if (copyrighted === 'false') return 'not copyrighted';
  return null; // cc-by, cc-by-sa, etc. -> NO
};
const BAD_WORDS = /\b(detail|crop|fragment|copy|engrav|etching|drawing|sketch|study|reverse|x-ray|frame|verso|label|signature|gasometer|installation|exhibition|replica|poster|billboard|interior|gallery view|wallpaper|mural)\b/i;

async function wmcImageInfo(titles) {
  const u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo'
    + '&iiprop=url|size|mime|extmetadata&iiurlwidth=6000&titles=' + encodeURIComponent(titles.join('|'));
  const j = await getJSON(u, { ua: UA, delay: 120 });
  return Object.values(j.query?.pages || {});
}

export async function resolveWMC(target) {
  const ss = await getJSON(
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srlimit=12&srsearch='
    + encodeURIComponent(target.q), { ua: UA, delay: 120 });
  const titles = (ss.query?.search || []).map(r => r.title);
  if (!titles.length) return null;
  const pages = await wmcImageInfo(titles);
  const want = surname(target.artist), wt = tokens(target.title);
  const cands = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0]; if (!ii) continue;
    const em = ii.extmetadata || {};
    if (!PD_OK(em)) continue;                            // licencia no PD/CC0
    const fname = norm(p.title);
    if (BAD_WORDS.test(fname)) continue;                 // detalle/copia/grabado
    const w = ii.width, h = ii.height;
    if (!w || !h) continue;
    const desc = norm((em.ObjectName?.value || '') + ' ' + (em.ImageDescription?.value || '')
      + ' ' + (em.Artist?.value || ''));
    let sc = 0;
    // El nombre del archivo es la señal más fuerte de QUÉ es la imagen
    // (la descripción puede nombrar la obra aunque sea foto de una réplica/instalación).
    if (want && fname.includes(want)) sc += 5;
    else if (want && desc.includes(want)) sc += 2;
    for (const t of wt) {
      if (fname.includes(t)) sc += 1.5;
      else if (desc.includes(t)) sc += 0.5;
    }
    if (ii.mime === 'image/jpeg') sc += 0.3;
    sc += Math.min(1.0, Math.max(w, h) / 6000); // tamaño: solo tiebreaker suave
    if (sc >= 3) cands.push({ p, ii, em, w, h, sc });   // exigente: evita falsos positivos
  }
  if (!cands.length) return null;
  // Elegir: preferir candidatos que pasen el piso de resolución; dentro de cada grupo,
  // mayor score y, a igualdad, más grande. (Para una obra nombrada, siempre la mejor versión usable.)
  const rank = (a, b) => (b.sc - a.sc) || (Math.max(b.w, b.h) - Math.max(a.w, a.h));
  const meetFloor = cands.filter(c => Math.max(c.w, c.h) >= MIN_LONG_SIDE).sort(rank);
  const best = (meetFloor[0] || cands.sort(rank)[0]);
  const bestScore = best.sc;
  const ii = best.ii;
  let { w, h } = best;
  let image_url = ii.url, mime = ii.mime;
  // Techo de 8000px en el lado largo y/o conversión a JPEG (sin upscalear jamás).
  const longSide = Math.max(w, h);
  const needRender = mime !== 'image/jpeg' || longSide > WMC_LONG_CAP;
  if (needRender) {
    // ancho objetivo para que el lado largo quede en <= cap (solo achicar)
    let targetW = w;
    if (longSide > WMC_LONG_CAP) targetW = (w >= h) ? WMC_LONG_CAP : Math.round(w * WMC_LONG_CAP / h);
    const rend = await wmcRender(best.p.title, Math.min(targetW, w));
    if (rend) { image_url = rend.url; w = rend.w; h = rend.h; mime = 'image/jpeg'; }
    else if (mime !== 'image/jpeg') { image_url = ii.thumburl || ii.url; mime = 'image/jpeg'; }
  }
  const artist = (best.em.Artist?.value || target.artist).replace(/<[^>]+>/g, '').trim();
  return {
    museum: 'Wikimedia', sourceId: best.p.title,
    title: target.title, artist: artist || target.artist,
    year: target.year, classification: (best.em.ObjectName?.value || '').replace(/<[^>]+>/g, '').trim(),
    license: (best.em.LicenseShortName?.value || 'Public Domain'),
    source_url: 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(best.p.title),
    image_url, w, h, mime, note: `score=${bestScore.toFixed(1)}`,
  };
}

const WMC_LONG_CAP = 8000; // techo de lado largo para Wikimedia (8K; nunca upscalear)
async function wmcRender(title, targetW) {
  if (!targetW || targetW < 1) return null;
  const u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo'
    + '&iiprop=url|size|mime&iiurlwidth=' + targetW + '&titles=' + encodeURIComponent(title);
  try {
    const j = await getJSON(u, { ua: UA, delay: 100 });
    const ii = Object.values(j.query?.pages || {})[0]?.imageinfo?.[0];
    if (ii?.thumburl) return { url: ii.thumburl, w: ii.thumbwidth, h: ii.thumbheight };
  } catch { /* noop */ }
  return null;
}

export async function resolveTarget(target) {
  let hit = null;
  if (target.src === 'met') hit = await resolveMet(target);
  else if (target.src === 'cle') hit = await resolveCleveland(target);
  else if (target.src === 'wmc') hit = await resolveWMC(target);
  if (hit) {
    // Para targets nombrados usamos el autor curado (limpio) en el nombre de archivo;
    // guardamos el del museo aparte. Evita basura del uploader en el filename.
    hit.artistFull = hit.artist;
    if (target.artist) hit.artist = target.artist;
  }
  return hit;
}
export { UA };
