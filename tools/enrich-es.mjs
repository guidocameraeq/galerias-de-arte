// Descripciones en ESPAÑOL 100% precisas: por el QID de Wikidata de cada obra obtiene su
// artículo EXACTO de Wikipedia-es (sitelink) y baja el resumen. Sin búsqueda por título =
// sin mislabel. Idempotente. Uso: node tools/enrich-es.mjs <colDir> [--apply] [--force]
import { getJSON, loadIndex, saveIndex, sleep } from './lib.mjs';

const colDir = process.argv[2];
const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');
const UA = 'Arte-PD-Collection/1.0 (+https://github.com/guidocameraeq/galerias-de-arte)';
const stripHtml = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
function shorten(s, max = 500) {
  s = stripHtml(s); if (s.length <= max) return s;
  const cut = s.slice(0, max), d = cut.lastIndexOf('. ');
  return d > max * 0.5 ? cut.slice(0, d + 1) : cut.replace(/\s+\S*$/, '') + '…';
}
async function esSummary(title) {
  try {
    const j = await getJSON(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`, { ua: UA, retries: 2 });
    return (j && j.extract && j.type !== 'disambiguation') ? j.extract : null;
  } catch { return null; }
}

const idx = await loadIndex(colDir);
const todo = idx.items.filter(it => FORCE || !it.description_source);
// 1) QID -> título exacto del artículo es.wikipedia (en lotes de 50)
const esTitle = {};
const qids = [...new Set(todo.filter(it => it.qid).map(it => it.qid))];
for (let i = 0; i < qids.length; i += 50) {
  try {
    const j = await getJSON(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=sitelinks&sitefilter=eswiki&ids=${qids.slice(i, i + 50).join('|')}`, { ua: UA, retries: 2 });
    for (const q of Object.keys(j.entities || {})) { const t = j.entities[q].sitelinks?.eswiki?.title; if (t) esTitle[q] = t; }
  } catch {}
  await sleep(150);
}
// 2) bajar resumen del artículo exacto
let ok = 0, done = 0;
for (const it of idx.items) {
  if (it.description_source && !FORCE) continue;
  const wt = it.qid ? esTitle[it.qid] : null;
  let text = '', src = '(sin artículo es)';
  if (wt) { const ex = await esSummary(wt); if (ex) { text = shorten(ex); src = `Wikipedia-es: ${wt}`; } await sleep(110); }
  it.description = text; it.description_source = src; done++; if (text) ok++;
  console.log(`#${String(it.n).padStart(3)} ${text ? '✓' : '·'} ${(it.title_es || it.title).slice(0, 30).padEnd(31)} ${src.slice(0, 42)}`);
  if (APPLY) await saveIndex(colDir, idx);
}
console.log(`\n${APPLY ? 'APLICADO' : 'DRY'} ${colDir}: ${done} procesadas, ${ok} con texto es. Total desc: ${idx.items.filter(i => i.description).length}/${idx.items.length}`);
