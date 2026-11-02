// Estado de las fichas por colección: palabras de la explicación (la app apunta a 80-150), origen (Wikipedia-es vs a mano) y campos completos.
// Solo lectura. Uso: node tools/fichas-stats.mjs
import fs from 'fs';
const root = process.cwd();
const cols = fs.readdirSync(root).filter(d => /^\d\d_/.test(d));
const wc = s => (s || '').trim() ? s.trim().split(/\s+/).length : 0;
const rows = [];
let T = { n: 0, d80: 0, d40: 0, short: 0, wiki: 0, hand: 0, museum: 0, type: 0, year: 0, tes: 0, qid: 0, lic: 0 };
for (const c of cols) {
  const j = JSON.parse(fs.readFileSync(`${root}/${c}/_index.json`, 'utf8'));
  const r = { c, n: j.items.length, w: [], d80: 0, wiki: 0, hand: 0, museum: 0, type: 0, year: 0, tes: 0, qid: 0 };
  for (const it of j.items) {
    const w = wc(it.description); r.w.push(w);
    if (w >= 80) r.d80++;
    if (/^Wikipedia-es/.test(it.description_source || '')) r.wiki++; else r.hand++;
    if (it.holding_museum) r.museum++;
    if (it.type) r.type++;
    if (it.year) r.year++;
    if (it.title_es) r.tes++;
    if (it.qid) r.qid++;
  }
  r.w.sort((a, b) => a - b);
  r.med = r.w[Math.floor(r.w.length / 2)];
  rows.push(r);
  for (const k of ['n', 'd80', 'wiki', 'hand', 'museum', 'type', 'year', 'tes', 'qid']) T[k] += r[k];
}
console.log('col'.padEnd(30), 'obras', 'med.pal', '>=80pal', 'wikiES', 'museo', 'tecnica', 'año', 'title_es', 'qid');
for (const r of rows) console.log(r.c.padEnd(30), String(r.n).padStart(5), String(r.med).padStart(7), String(r.d80).padStart(7), String(r.wiki).padStart(6), String(r.museum).padStart(5), String(r.type).padStart(7), String(r.year).padStart(4), String(r.tes).padStart(8), String(r.qid).padStart(4));
console.log('TOTAL', JSON.stringify(T));
