// Registro de candidatas: lo que NO entró en cada colección (y por qué), para curar mejor después.
// Genera <col>/_candidatas.json con las obras que se vieron/buscaron y no están en el índice:
//   estado "pendiente"  = importante y todavía no conseguida (target sin match, baja resolución, error, famosa de Wikidata que falta, lista manual)
//   estado "descartada" = se vio y se sacó/rechazó (duplicada, baja calidad, fuera de tema, baja resolución al descubrir)
// Las obras que SÍ entraron viven en <col>/_index.json (no se duplican acá). Fuentes: _descartes/*.jsonl, brechas de Wikidata (--gap, red)
// y tools/candidatas-manual.json (decisiones del historiador: se mantienen entre corridas). Determinista: se regenera entero.
// Dry-run por defecto. Uso: node tools/candidatas.mjs [--gap] [--min-fame=28] [--apply]
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const APPLY = args.includes('--apply'), GAP = args.includes('--gap');
const MINFAME = Number((args.find(a => a.startsWith('--min-fame=')) || '').slice(11)) || 28;
const UA = 'Arte-PD-Collection/1.0 (eq.chatgpt@gmail.com)';
const base = fs.existsSync(path.join(ROOT, 'colecciones')) ? path.join(ROOT, 'colecciones') : ROOT;
const cols = fs.readdirSync(base).filter(d => /^\d\d_/.test(d) && fs.existsSync(path.join(base, d, '_index.json'))).sort();
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const last = (a) => norm(a).split(' ').filter(Boolean).pop() || '';
const tkey = (t, a) => norm(t).split(' ').filter(w => w.length > 2).slice(0, 4).join(' ') + '|' + last(a);

const out = Object.fromEntries(cols.map(c => [c, []]));
const sinAsignar = [];
let resueltas = 0, fueraAlcance = 0;
const have = { qid: new Set(), key: new Set(), src: new Set() };
const artistCols = {};
for (const c of cols) {
  const idx = JSON.parse(fs.readFileSync(path.join(base, c, '_index.json'), 'utf8'));
  for (const it of idx.items) {
    if (it.qid) have.qid.add(it.qid);
    if (it.sourceId) have.src.add(it.sourceId);
    have.key.add(tkey(it.title, it.artist)); if (it.title_es) have.key.add(tkey(it.title_es, it.artist));
    const k = last(it.artist); if (k) { artistCols[k] ||= {}; artistCols[k][c] = (artistCols[k][c] || 0) + 1; }
  }
}
const yaEntro = (o) => (o.qid && have.qid.has(o.qid)) || (o.sourceId && have.src.has(o.sourceId)) || (o.titulo && have.key.has(tkey(o.titulo, o.autor)));

// 1) Descartes registrados por los scripts
const MOTIVO = { no_match: 'no_encontrada', low_res: 'baja_resolucion', download_error: 'error_descarga', dup: 'duplicada', dup_visual: 'duplicada', baja_calidad: 'baja_calidad', too_modern: 'fuera_de_periodo', junk_title: 'fuera_de_tema', excluded: 'fuera_de_tema' };
const dDir = path.join(ROOT, '_descartes');
if (fs.existsSync(dDir)) for (const f of fs.readdirSync(dDir).filter(x => x.endsWith('.jsonl'))) {
  const col = f.replace(/\.jsonl$/, '');
  if (!out[col]) continue;
  for (const l of fs.readFileSync(path.join(dDir, f), 'utf8').split('\n').filter(Boolean)) {
    const o = JSON.parse(l);
    const named = o.kind === 'named' || o.reason === 'download_error' && o.kind === 'named';
    const e = { estado: named ? 'pendiente' : 'descartada', titulo: o.title || o.file || null, autor: o.artist || null,
      qid: o.qid || null, sourceId: o.sourceId || null, motivo: MOTIVO[o.reason] || o.reason,
      detalle: [o.long && `lado largo ${o.long}px`, o.year && `año ${o.year}`, o.note, o.err && `error: ${o.err}`].filter(Boolean).join(' · ') || null,
      origen: o.stage ? `descarte:${o.stage}` : (named ? 'descarte:target-nombrado' : 'descarte:remove-work') };
    if (o.source_url) e.fuente = o.source_url; else if (o.image_url) e.fuente = o.image_url;
    if (e.estado === 'pendiente' && yaEntro({ qid: e.qid, sourceId: e.sourceId, titulo: e.titulo, autor: e.autor })) { resueltas++; continue; }
    out[col].push(e);
  }
}

// 2) Manual (historiador): tools/candidatas-manual.json  [{col, estado, titulo, autor, qid?, motivo, detalle?}]
const mp = path.join(ROOT, 'tools/candidatas-manual.json');
if (fs.existsSync(mp)) for (const m of JSON.parse(fs.readFileSync(mp, 'utf8'))) {
  if (!out[m.col]) { console.error(`manual: colección desconocida ${m.col}`); continue; }
  out[m.col].push({ estado: m.estado || 'pendiente', titulo: m.titulo, autor: m.autor || null, qid: m.qid || null, sourceId: null, motivo: m.motivo, detalle: m.detalle || null, origen: 'manual' });
}

// 3) Brechas de Wikidata: famosas que NO tenemos, asignadas a la colección más probable (propuesta)
const era = (y, esc) => esc && y < 500 ? '18_escultura_griega' : y < 1500 ? '03_gotico' : y < 1600 ? '07_alto_renacimiento' : y < 1740 ? '02_barroco' : y < 1790 ? '11_rococo' : y < 1815 ? '16_neoclasicismo' : y < 1860 ? '04_romanticismo' : y < 1900 ? '08_impresionismo' : '13_vanguardias';
if (GAP) for (const tipo of ['painting', 'sculpture']) {
  const q = `SELECT ?item ?itemLabel ?creatorLabel ?collLabel (YEAR(?date) AS ?yr) ?n (BOUND(?img) AS ?hasImg) WHERE {
    ?item wdt:P31 wd:${tipo === 'sculpture' ? 'Q860861' : 'Q3305213'} ; wikibase:sitelinks ?n . FILTER(?n >= ${MINFAME})
    OPTIONAL { ?item wdt:P170 ?creator. } OPTIONAL { ?item wdt:P195 ?coll. } OPTIONAL { ?item wdt:P571 ?date. } OPTIONAL { ?item wdt:P18 ?img. }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } } ORDER BY DESC(?n)`;
  const r = await fetch('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q), { headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' } });
  if (!r.ok) { console.error(`gap ${tipo}: SPARQL ${r.status} (se omite)`); continue; }
  for (const b of (await r.json()).results.bindings) {
    const qid = b.item.value.split('/').pop(), titulo = b.itemLabel?.value || '', autor = b.creatorLabel?.value || '';
    const cand = { qid, titulo, autor };
    if (yaEntro(cand) || /^Q\d+$/.test(titulo)) continue;
    const yr = b.yr ? Number(b.yr.value) : null;
    if (tipo === 'sculpture' && (yr == null || yr >= 500)) { fueraAlcance++; continue; }   // monumentos/esculturas modernas: fuera de alcance
    const autorOk = /^https?:/.test(autor) ? '' : autor;
    const ac = artistCols[last(autorOk)];
    const col = ac ? Object.entries(ac).sort((a, b) => b[1] - a[1])[0][0] : (yr != null ? era(yr, tipo === 'sculpture') : null);
    const e = { estado: 'pendiente', titulo, autor: autorOk || null, qid, sourceId: null, motivo: b.hasImg?.value === 'true' ? 'no_conseguida' : 'sin_imagen_libre',
      detalle: [`fama ${b.n.value}`, yr && `año ${yr}`, b.collLabel && `museo ${b.collLabel.value}`, yr >= 1925 && 'probable copyright', col ? (ac ? 'colección por autor ya presente' : 'colección propuesta por época') : null].filter(Boolean).join(' · '),
      origen: 'gap-wikidata', fuente: `https://www.wikidata.org/wiki/${qid}` };
    (col && out[col] ? out[col] : sinAsignar).push(e);
  }
}

// Escritura / resumen
let tot = { pendiente: 0, descartada: 0 };
console.log(`REGISTRO DE CANDIDATAS · ${APPLY ? 'APPLY' : 'dry-run'}${GAP ? ' · con brechas de Wikidata (fama ≥ ' + MINFAME + ')' : ''}\n`);
for (const c of cols) {
  const seen = new Set(), items = [];
  for (const e of out[c]) {
    const k = [e.estado, e.qid || '', e.sourceId || '', norm(e.titulo), e.origen].join('|');
    if (seen.has(k)) continue; seen.add(k); items.push(e);
  }
  items.sort((a, b) => (a.estado === b.estado ? 0 : a.estado === 'pendiente' ? -1 : 1) || String(a.titulo).localeCompare(String(b.titulo)));
  const n = (s) => items.filter(i => i.estado === s).length;
  tot.pendiente += n('pendiente'); tot.descartada += n('descartada');
  const idx = JSON.parse(fs.readFileSync(path.join(base, c, '_index.json'), 'utf8'));
  console.log(`${c.padEnd(30)} entraron ${String(idx.items.length).padStart(3)} · pendientes ${String(n('pendiente')).padStart(3)} · descartadas ${String(n('descartada')).padStart(3)}`);
  if (APPLY) fs.writeFileSync(path.join(base, c, '_candidatas.json'), JSON.stringify({ collection: c, nota: 'Lo que NO entró (las que entraron están en _index.json). Se regenera con tools/candidatas.mjs; las decisiones manuales van en tools/candidatas-manual.json.', cobertura: fs.existsSync(path.join(dDir, c + '.jsonl')) ? 'con historial de descartes (_descartes) + brechas de Wikidata + lista manual' : 'SIN historial de descartes (el script que la armó no los registraba): solo brechas de Wikidata y lista manual', resumen: { entraron: idx.items.length, pendientes: n('pendiente'), descartadas: n('descartada') }, items }, null, 2) + '\n');
}
if (sinAsignar.length) {
  console.log(`\nSin colección propuesta: ${sinAsignar.length}`);
  if (APPLY) fs.writeFileSync(path.join(ROOT, '_descartes/_pendientes_sin_coleccion.json'), JSON.stringify({ nota: 'Famosas de Wikidata que faltan y no se pudieron asignar a una colección', items: sinAsignar }, null, 2) + '\n');
}
console.log(`\nTOTAL pendientes ${tot.pendiente} · descartadas ${tot.descartada}${APPLY ? '' : '\nDry-run: agregá --apply para escribir.'}`);
