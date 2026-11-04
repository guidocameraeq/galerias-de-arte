// Enriquece _index.json con campos ESTRUCTURADOS desde Wikidata (datos duros, sin alucinar):
// holding_museum (P195), type/medium (P186), school/movement (P135), canon_rank (nº de sitelinks),
// + qid. Match por título; verifica el autor por apellido y elige el de más fama (sitelinks).
// Uso: node tools/wikidata-enrich.mjs <colDir> [--apply] [--limit=N]
import { getJSON, loadIndex, saveIndex, sleep } from './lib.mjs';

const colDir = process.argv[2] || '01_mitologia_griega_romana';
const APPLY = process.argv.includes('--apply');
const LIMIT = Number((process.argv.find(a => a.startsWith('--limit=')) || '').split('=')[1]) || 0;
const UA = 'Arte-PD-Collection/1.0 (+https://github.com/guidocameraeq/galerias-de-arte)';
const WD = 'https://www.wikidata.org/w/api.php';
// tipos de obra de arte (painting, sculpture, fresco, print, drawing, statue, work of art, artwork series, mural)
const ARTWORK = new Set(['Q3305213','Q860861','Q3184121','Q11060274','Q93184','Q179700','Q838948','Q4502142','Q15709879','Q21281546','Q2293009']);
const norm = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const surname = (a) => norm(a).split(/\s+/).filter(Boolean).pop() || '';
const enc = encodeURIComponent;
const claimIds = (cl, p) => (cl[p] || []).map(c => c.mainsnak?.datavalue?.value?.id).filter(Boolean);

async function search(title) {
  try {
    const j = await getJSON(`${WD}?action=wbsearchentities&format=json&language=en&uselang=en&type=item&limit=10&search=${enc(title)}`, { ua: UA, retries: 2 });
    return (j.search || []).map(x => x.id);
  } catch { return []; }
}
async function getEntities(ids) {
  if (!ids.length) return {};
  try {
    const j = await getJSON(`${WD}?action=wbgetentities&format=json&props=claims|sitelinks|labels&languages=es|en&ids=${ids.slice(0, 50).join('|')}`, { ua: UA, retries: 2 });
    return j.entities || {};
  } catch { return {}; }
}
const labelOf = (ent) => ent && (ent.labels?.es?.value || ent.labels?.en?.value || Object.values(ent.labels || {})[0]?.value) || null;

async function enrichItem(it) {
  const ids = await search(it.title); await sleep(90);
  if (!ids.length) return null;
  const ents = await getEntities(ids); await sleep(90);
  const cands = [], creatorQids = new Set();
  for (const id of ids) {
    const e = ents[id]; if (!e) continue;
    const cl = e.claims || {};
    if (!claimIds(cl, 'P31').some(q => ARTWORK.has(q))) continue;
    const creators = claimIds(cl, 'P170');
    creators.forEach(q => creatorQids.add(q));
    cands.push({ id, cl, creators, links: Object.keys(e.sitelinks || {}).length });
  }
  if (!cands.length) return null;
  const cEnts = await getEntities([...creatorQids]); await sleep(90);
  const creatorLabel = (q) => norm(labelOf(cEnts[q]) || '');
  const sur = surname(it.artist);
  const matched = cands.filter(c => sur.length > 3 && sur !== 'anonimo' && c.creators.some(q => creatorLabel(q).includes(sur)));
  const best = (matched.length ? matched : cands).sort((a, b) => b.links - a.links)[0];
  // resolver labels de museo/material/movimiento
  const need = ['P195', 'P186', 'P135'].map(p => claimIds(best.cl, p)[0]).filter(Boolean);
  const lblEnts = await getEntities(need); await sleep(90);
  const lbl = (q) => labelOf(lblEnts[q]);
  const mQ = claimIds(best.cl, 'P195')[0], matQ = claimIds(best.cl, 'P186')[0], movQ = claimIds(best.cl, 'P135')[0];
  return {
    qid: best.id,
    holding_museum: mQ ? lbl(mQ) : null,
    type: matQ ? lbl(matQ) : null,
    school: movQ ? lbl(movQ) : null,
    canon_rank: best.links,
    verified: matched.length > 0,
  };
}

// El museo SEGURO viene de la fuente de descarga (no de Wikidata, por el lío multi-versión).
const SRC_MUSEUM = {
  'The Met': 'Museo Metropolitano de Arte, Nueva York',
  'Cleveland': 'Museo de Arte de Cleveland',
  'AIC': 'Art Institute of Chicago',
};
const idx = await loadIndex(colDir);
let items = idx.items; if (LIMIT) items = items.slice(0, LIMIT);
let ok = 0, mus = 0;
for (const it of items) {
  const r = await enrichItem(it);
  // museo: fuente directa (seguro) > Wikidata SOLO si verificó autor (best-effort) > nada
  const holding = SRC_MUSEUM[it.museum] || (r && r.verified ? r.holding_museum : null);
  const conf = SRC_MUSEUM[it.museum] ? 'fuente' : (r && r.verified && r.holding_museum ? 'wikidata?' : 'falta');
  if (r) {
    ok++; if (holding) mus++;
    if (APPLY) { it.qid = r.qid; it.holding_museum = holding || it.holding_museum; it.museum_confidence = conf; it.type = r.type || it.type; it.school = r.school || it.school; it.canon_rank = r.canon_rank; }
    console.log(`#${String(it.n).padStart(2, '0')} [${String(r.canon_rank).padStart(3)} idiom] ${(it.title).slice(0, 24).padEnd(24)} → ${(holding || '(falta museo)').slice(0, 32).padEnd(32)} (${conf}) ${r.type ? '· ' + r.type : ''}`);
  } else {
    if (APPLY && holding) { it.holding_museum = holding; it.museum_confidence = conf; }
    console.log(`#${String(it.n).padStart(2, '0')} — sin Wikidata; museo x fuente: ${holding || '(falta)'}`);
  }
  await sleep(60);
}
console.log(`\n${APPLY ? 'APLICADO' : 'DRY'}: ${ok}/${items.length} con match Wikidata, ${mus} con museo asignado.`);
if (APPLY) await saveIndex(colDir, idx);
