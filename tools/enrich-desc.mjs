// Enriquece _index.json con una descripción corta por obra (sin re-bajar imágenes).
// Prioridad: Cleveland (texto propio) -> Wikipedia artículo de la obra -> Wikipedia
// del tema/mito -> Met (datos: medium+tags+creditLine). Verifica el match para no
// pegar descripciones equivocadas. Idempotente (salta lo ya descrito salvo --force).
// Uso: node tools/enrich-desc.mjs <colDir> [--apply] [--limit N] [--force] [--only=n1,n2]
import { getJSON, loadIndex, saveIndex, sleep } from './lib.mjs';

const colDir = process.argv[2] || '01_mitologia_griega_romana';
const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');
const LIMIT = (process.argv.find(a => a.startsWith('--limit=')) || '').split('=')[1];
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').split('=')[1];
const UA = 'Arte-PD-Collection/1.0 (+https://github.com/guidocameraeq/galerias-de-arte)';

const stripHtml = (s) => String(s || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&#0?39;|&rsquo;|&apos;/g, "'").replace(/&quot;/g, '"')
  .replace(/&nbsp;/g, ' ').replace(/&ndash;|&mdash;/g, '–').replace(/&[a-z]+;/gi, ' ')
  .replace(/\s+/g, ' ').trim();

function shorten(s, max = 520) {
  s = stripHtml(s);
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastDot = cut.lastIndexOf('. ');
  return (lastDot > max * 0.5 ? cut.slice(0, lastDot + 1) : cut.replace(/\s+\S*$/, '') + '…');
}

const lastWord = (s) => String(s || '').trim().split(/\s+/).pop() || '';

async function wikiSummary(title) {
  try {
    const j = await getJSON(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`, { ua: UA, retries: 2 });
    if (!j || j.type === 'disambiguation' || !j.extract) return null;
    return j; // .title .extract .description
  } catch { return null; }
}
async function wikiSearch(q) {
  try {
    const j = await getJSON(`https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&format=json&srsearch=${encodeURIComponent(q)}`, { ua: UA, retries: 2 });
    return j?.query?.search?.[0]?.title || null;
  } catch { return null; }
}
const norm = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const stripParens = (s) => String(s || '').replace(/\s*\([^)]*\)\s*/g, ' ').trim();

function looksLikePerson(s, it) {   // rechazar la biografía del autor (no es la obra)
  const d = norm(s.description);
  const personDesc = /\b(painter|artist|sculptor|engraver|draughtsman|architect|printmaker|illustrator|poet)\b/.test(d)
    && !/\b(painting|sculpture|fresco|drawing|series|work|portrait of)\b/.test(d);
  const t = norm(stripParens(s.title));
  const titleIsArtist = t === norm(it.artist) || (it.artist_museum && t === norm(it.artist_museum));
  const bio = personDesc && /\bwas (a|an|the)\b/.test(norm(s.extract).slice(0, 60));
  return (personDesc && titleIsArtist) || bio;
}
function goodMatch(s, it) {
  if (looksLikePerson(s, it)) return false;
  const sur = norm(lastWord(it.artist));
  const hay = norm(`${s.title} ${s.extract} ${s.description || ''}`);
  const titleWords = norm(it.title).split(/\W+/).filter(w => w.length > 4);
  if (sur.length > 3 && sur !== 'anonimo' && hay.includes(sur)) return true;       // menciona al autor
  return titleWords.length > 0 && titleWords.every(w => hay.includes(w));            // o el título entero
}

async function getDescription(it) {
  // 1) Cleveland: descripción curatorial propia
  if (it.museum === 'Cleveland') {
    try {
      const j = (await getJSON(`https://openaccess-api.clevelandart.org/api/artworks/${it.sourceId}`, { ua: UA })).data;
      const d = j.description || j.wall_description || j.tombstone;
      if (d) return { text: shorten(d), source: 'Cleveland' };
    } catch {}
  }
  // 2) Wikipedia: artículo de la OBRA (convención "Título (Autor)")
  const sur = lastWord(it.artist);
  const paren = (String(it.title).match(/\(([^)]+)\)/) || [])[1];        // "Rokeby Venus"
  const noParen = String(it.title).replace(/\s*\([^)]*\)\s*/g, ' ').trim(); // "The Toilet of Venus"
  const cands = [...new Set([
    `${it.title} (${it.artist})`,
    it.artist_museum ? `${it.title} (${it.artist_museum})` : null,       // "Orpheus (Gustave Moreau)"
    sur && sur !== it.artist ? `${it.title} (${sur})` : null,
    paren,                                                               // "Rokeby Venus"
    noParen && noParen !== it.title ? `${noParen} (${sur})` : null,      // "The Toilet of Venus (Velazquez)"
    noParen && noParen !== it.title ? noParen : null,
    it.title,
  ].filter(Boolean))];
  for (const c of cands) {
    const s = await wikiSummary(c); await sleep(120);
    if (s && goodMatch(s, it)) return { text: shorten(s.extract), source: `Wikipedia: ${s.title}` };
  }
  // 3) Búsqueda libre y verificación
  const hit = await wikiSearch(`${it.title} ${it.artist}`); await sleep(120);
  if (hit) { const s = await wikiSummary(hit); if (s && goodMatch(s, it)) return { text: shorten(s.extract), source: `Wikipedia: ${s.title}` }; }
  // 4) Tema/mito (blando): el artículo del título tal cual, aunque sea del personaje
  const subj = await wikiSummary(it.title); await sleep(120);
  if (subj && subj.extract) return { text: shorten(subj.extract), source: `Wikipedia (tema): ${subj.title}` };
  // 5) Met: ficha factual (medium + cultura/período + tags; sin el creditLine ruidoso)
  if (it.museum === 'The Met') {
    try {
      const m = await getJSON(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${it.sourceId}`, { ua: UA });
      const tags = (m.tags || []).map(t => t.term).slice(0, 6).join(', ');
      const where = [m.culture, m.period].filter(Boolean).join(', ');
      const bits = [m.medium, where, tags ? `Temas: ${tags}` : ''].filter(Boolean);
      if (bits.length) return { text: bits.join('. '), source: 'Met (datos)' };
    } catch {}
  }
  // 6) Wikimedia: descripción de Commons (extmetadata) como último recurso
  if (it.museum === 'Wikimedia' && /^File:/.test(it.sourceId || '')) {
    try {
      const j = await getJSON(`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=extmetadata&titles=${encodeURIComponent(it.sourceId)}`, { ua: UA });
      const pages = j?.query?.pages || {};
      const meta = Object.values(pages)[0]?.imageinfo?.[0]?.extmetadata || {};
      const d = stripHtml(meta.ImageDescription?.value || '');
      if (d && d.length > 40 && d.toLowerCase() !== String(it.title).toLowerCase()) return { text: shorten(d), source: 'Wikimedia (Commons)' };
    } catch {}
  }
  return { text: '', source: '(sin descripción)' };
}

const idx = await loadIndex(colDir);
let items = idx.items;
if (ONLY) { const set = new Set(ONLY.split(',').map(Number)); items = items.filter(it => set.has(it.n)); }
if (LIMIT) items = items.slice(0, Number(LIMIT));

let done = 0;
for (const it of items) {
  if (it.description_source && !FORCE) { continue; }   // ya intentado (aunque haya quedado vacío)
  const { text, source } = await getDescription(it);
  it.description = text; it.description_source = source;
  done++;
  console.log(`#${String(it.n).padStart(2, '0')} [${source}]\n   ${text.slice(0, 160)}${text.length > 160 ? '…' : ''}`);
  if (APPLY) await saveIndex(colDir, idx);
  await sleep(150);
}
const sinDesc = idx.items.filter(i => i.description === '').length;
console.log(`\n${APPLY ? 'APLICADO' : 'DRY'}: ${done} procesadas. Sin descripción: ${sinDesc}/${idx.items.length}`);
