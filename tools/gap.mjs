// Análisis de brechas: cruza TODO lo que tenemos contra el top de obras más famosas de
// Wikidata (sitelinks). Reporta las famosas que NOS FALTAN, con fama/año/museo/¿imagen?.
// Uso: node tools/gap.mjs [minFame] [tipo=painting|sculpture]
import { loadIndex, listCols } from './lib.mjs';
import { promises as fs } from 'node:fs';

const MINFAME = Number(process.argv[2]) || 28;
const TIPO = process.argv[3] || 'painting';
const TYPE_QID = TIPO === 'sculpture' ? 'wd:Q860861' : 'wd:Q3305213';
const UA = 'Arte-PD-Collection/1.0 (+https://github.com/guidocameraeq/galerias-de-arte)';
const norm = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const key = (title, artist) => norm(title).split(' ').filter(w => w.length > 2).slice(0, 4).join(' ') + '|' + norm(artist).split(' ').filter(Boolean).pop();

const COLS = listCols();
const haveQID = new Set(), haveKey = new Set();
let total = 0;
for (const c of COLS) {
  try {
    const idx = await loadIndex(c);
    for (const it of idx.items) {
      total++;
      if (it.qid) haveQID.add(it.qid);
      haveKey.add(key(it.title, it.artist));
      if (it.title_es) haveKey.add(key(it.title_es, it.artist));
    }
  } catch {}
}
console.error(`Tenemos ${total} obras | ${haveQID.size} con QID | ${haveKey.size} claves título+autor`);

const q = `SELECT ?item ?itemLabel ?creatorLabel ?collLabel (YEAR(?date) AS ?yr) ?n (BOUND(?img) AS ?hasImg) WHERE {
  ?item wdt:P31 ${TYPE_QID} ; wikibase:sitelinks ?n . FILTER(?n >= ${MINFAME})
  OPTIONAL { ?item wdt:P170 ?creator. } OPTIONAL { ?item wdt:P195 ?coll. }
  OPTIONAL { ?item wdt:P571 ?date. } OPTIONAL { ?item wdt:P18 ?img. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} ORDER BY DESC(?n)`;
const r = await fetch('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q), { headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' } });
if (!r.ok) { console.error('SPARQL', r.status); process.exit(1); }
const rows = (await r.json()).results.bindings;

const missing = [];
for (const b of rows) {
  const qid = b.item.value.split('/').pop();
  const title = b.itemLabel?.value || '', artist = b.creatorLabel?.value || '';
  if (haveQID.has(qid) || haveKey.has(key(title, artist))) continue;
  missing.push({ qid, title, artist, yr: b.yr?.value || '?', museum: b.collLabel?.value || '-', fame: Number(b.n.value), img: b.hasImg?.value === 'true' });
}
console.log(`\n=== ${TIPO.toUpperCase()}: top fama >=${MINFAME} → ${rows.length} obras, NOS FALTAN ${missing.length} ===`);
console.log('fama  año   img  obra — autor — museo');
for (const m of missing) {
  const cs = m.yr !== '?' && Number(m.yr) >= 1925 ? '©' : ' ';
  console.log(`${String(m.fame).padStart(3)} ${cs} ${String(m.yr).padStart(5)} ${m.img ? 'PD ' : '?? '} ${m.title.slice(0, 38).padEnd(39)} ${m.artist.slice(0, 20).padEnd(21)} ${m.museum.slice(0, 22)}`);
}
