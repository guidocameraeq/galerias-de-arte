// Normaliza los metadatos de las obras con qid de Wikidata: museo "Museo, Ciudad, País" (Guido, 2026-11-04), título en español
// (etiqueta es de Wikidata cuando falta) y año (solo normaliza el formato; las discrepancias con Wikidata se listan, no se pisan).
// Salida: tools/meta/<col>.json  (overlay por id: { museo, titulo, anio, nota }) que apply-desc.mjs aplica DESPUÉS de las fichas.
// Dry-run por defecto: imprime el resumen y escribe un informe en --report=ARCHIVO. Con --apply escribe los overlays.
// Uso: node tools/meta-fix.mjs [--col=04,07] [--apply] [--report=RUTA.json]
import fs from 'node:fs';
import path from 'node:path';
import { loadIndex, listCols, getJSON, sleep } from './lib.mjs';
import { MUSEOS_FIJOS } from './meta/museos-fijos.mjs';

const args = process.argv.slice(2);
const flag = (n) => args.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const APPLY = args.includes('--apply');
const UA = 'arte-personal-curaduria/1.0 (https://github.com/guidocameraeq/galerias-de-arte)';
const API = 'https://www.wikidata.org/w/api.php';
const cols = flag('col') ? flag('col').split(',').map(c => listCols().find(x => x === c || x.startsWith(c + '_'))).filter(Boolean) : listCols();
const cache = new Map();   // qid -> entidad
async function entities(ids) {
  const need = [...new Set(ids)].filter(q => q && !cache.has(q));
  for (let i = 0; i < need.length; i += 40) {
    const chunk = need.slice(i, i + 40);
    const j = await getJSON(`${API}?action=wbgetentities&format=json&ids=${chunk.join('|')}&props=claims|labels&languages=es|en`, { ua: UA, delay: 250 });
    for (const q of chunk) cache.set(q, j.entities?.[q] || { missing: true });
  }
}
const claimIds = (e, p) => (e?.claims?.[p] || []).map(c => c.mainsnak?.datavalue?.value?.id).filter(Boolean);
const label = (e) => e?.labels?.es?.value || e?.labels?.en?.value || null;
const CITY_TYPES = new Set(['Q515', 'Q1549591', 'Q484170', 'Q5119', 'Q3957', 'Q532', 'Q15284', 'Q747074', 'Q1093829', 'Q484170', 'Q1637706', 'Q2039348', 'Q123705', 'Q200250', 'Q22865']);

async function ciudadPais(museoQ) {
  await entities([museoQ]);
  const m = cache.get(museoQ);
  let chain = claimIds(m, 'P131');
  if (!chain.length) chain = claimIds(m, 'P159');
  await entities(chain);
  let ciudad = null, c0 = null;
  let cur = chain[0], hops = 0;
  while (cur && hops < 4) {
    await entities([cur]);
    const e = cache.get(cur);
    if (hops === 0) c0 = label(e);
    if (claimIds(e, 'P31').some(t => CITY_TYPES.has(t))) { ciudad = label(e); break; }
    cur = claimIds(e, 'P131')[0]; hops++;
  }
  ciudad = ciudad || c0;
  const paisQ = claimIds(m, 'P17')[0];
  if (paisQ) await entities([paisQ]);
  return { museo: label(m), ciudad, pais: paisQ ? label(cache.get(paisQ)) : null };
}

// Ciudad -> país (para nombres que ya traen ciudad pero no país) y casos sueltos.
const CIUDAD_PAIS = { Madrid: 'España', Roma: 'Italia', 'París': 'Francia', Londres: 'Reino Unido', Viena: 'Austria', 'Nueva York': 'Estados Unidos', Siena: 'Italia', Florencia: 'Italia', Copenhague: 'Dinamarca', 'San Petersburgo': 'Rusia', Washington: 'Estados Unidos', Chantilly: 'Francia', Oslo: 'Noruega', 'Ámsterdam': 'Países Bajos', 'Los Ángeles': 'Estados Unidos', Varsovia: 'Polonia', 'Saint-Cloud': 'Francia', Montpellier: 'Francia', 'Aix-en-Provence': 'Francia', 'Gran Mánchester': 'Reino Unido', Adelaida: 'Australia', 'Kingston upon Hull': 'Reino Unido', Mantua: 'Italia', 'Génova': 'Italia', Ruan: 'Francia', Vicenza: 'Italia', Pau: 'Francia', 'Fort Worth': 'Estados Unidos', Basilea: 'Suiza', Toronto: 'Canadá', 'México': 'México', Padua: 'Italia', Colonia: 'Alemania', Winterthur: 'Suiza', 'Dublín': 'Irlanda', Amberes: 'Bélgica', 'Nápoles': 'Italia', Palermo: 'Italia', 'Berlín': 'Alemania', 'San Francisco': 'Estados Unidos', 'Moscú': 'Rusia', Praga: 'República Checa', Figueres: 'España', 'Búfalo': 'Estados Unidos', Atenas: 'Grecia', 'Buenos Aires': 'Argentina', 'Múnich': 'Alemania', Brujas: 'Bélgica', Bruselas: 'Bélgica', Lisboa: 'Portugal', Milán: 'Italia', Venecia: 'Italia', Boston: 'Estados Unidos', Chicago: 'Estados Unidos', Filadelfia: 'Estados Unidos', Cleveland: 'Estados Unidos', 'Ciudad del Vaticano': 'Ciudad del Vaticano' };
const ESPECIALES = { 'Muzeum Historyczne w Sanoku': 'Museo Histórico de Sanok, Sanok, Polonia', 'Museo Czartoryski': 'Museo Czartoryski, Cracovia, Polonia', 'Galería de la Academia de Florencia': 'Galería de la Academia, Florencia, Italia', 'Kunstmuseum Basel': 'Kunstmuseum Basel, Basilea, Suiza', 'Kunsthaus Zúrich': 'Kunsthaus Zúrich, Zúrich, Suiza', 'Museo Gustave Moreau': 'Museo Gustave Moreau, París, Francia', 'Museo Boymans Van Beuningen': 'Museo Boijmans Van Beuningen, Róterdam, Países Bajos', 'Hôtel-Dieu de Beaune': 'Hôtel-Dieu de Beaune, Beaune, Francia', 'Museo de Grenoble': 'Museo de Grenoble, Grenoble, Francia', 'Museo de Bellas Artes y Arqueología de Besanzón': 'Museo de Bellas Artes y Arqueología de Besanzón, Besanzón, Francia', 'Shimane Art Museum': 'Museo de Arte de Shimane, Matsue, Japón', 'British Museum': 'Museo Británico, Londres, Reino Unido', 'Galería Nacional de Dinamarca': 'Galería Nacional de Dinamarca, Copenhague, Dinamarca', 'Staatsgalerie Stuttgart': 'Staatsgalerie Stuttgart, Stuttgart, Alemania', 'iglesia de San Luis de los Franceses': 'Iglesia de San Luis de los Franceses, Roma, Italia' };
const CIUDAD_FIX = { 'Ciudad de Westminster': 'Londres', 'Roma Capitale': 'Roma', 'Manhattan': 'Nueva York', 'Ciudad de Nueva York': 'Nueva York', 'Greater London': 'Londres' };
const STOP = new Set(['museo', 'museum', 'musee', 'galeria', 'gallery', 'galerie', 'arte', 'art', 'del', 'los', 'las', 'the', 'der', 'nacional', 'national', 'bellas', 'artes', 'beaux', 'arts', 'de', 'la', 'el', 'di', 'von', 'van', 'des', 'collection', 'coleccion', 'colecciones', 'estatales']);
const toks = (t) => new Set(String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length >= 4 && !STOP.has(w)));
const solapa = (a, b) => { const A = toks(a), B = toks(b); if (A.size === 0) return true; for (const w of A) if (B.has(w)) return true; return false; };
const YEAR_ES = { 'probably mid-17th century': 'mediados del siglo XVII', 'XVII Secolo': 'siglo XVII', '1st third of 18th century': 'primer tercio del siglo XVIII', 'circa late 15th century': 'finales del siglo XV', '1st quarter of 15th century': 'primer cuarto del siglo XV', '1st half of 15th century': 'primera mitad del siglo XV', 'Late 15th century.': 'finales del siglo XV', '3rd century': 'siglo III', '19th century': 'siglo XIX', 'undated': 'sin fecha' };
const normYear = (y) => {
  if (y == null) return y;
  let s = String(y).trim().replace(/[–—]/g, '-').replace(/_/g, ' ');
  s = s.replace(/^(c|ca|circa)\.?\s*(?=\d)/i, 'c. ');
  s = s.replace(/(\d+)\s*(BCE|BC|a\.?\s*C\.?)$/i, '$1 a. C.');
  s = s.replace(/(^|c\. |-)0+(?=\d)/g, '$1');            // ceros a la izquierda ("0042 a. C." -> "42 a. C.")
  s = s.replace(/^h\.\s*(?=\d)/i, 'c. ');
  return YEAR_ES[s] ?? s;
};

const report = [], pend = [];
let totals = { items: 0, conQid: 0, museoNuevo: 0, tituloNuevo: 0, anioNuevo: 0, sinMuseoWD: 0 };
for (const col of cols) {
  const idx = await loadIndex(col);
  const overlay = {};
  const withQ = idx.items.filter(i => /^Q\d+$/.test(i.qid || ''));
  totals.items += idx.items.length; totals.conQid += withQ.length;
  await entities(withQ.map(i => i.qid));
  for (const it of idx.items) {
    const dupQ = it.qid && idx.items.filter(x => x.qid === it.qid).length > 1;
    const id = (!dupQ && it.qid) || it.sourceId || it.source_url || it.image_url;
    const o = {};
    // 1) museo: tabla fija (normaliza variantes y museos sin qid) → si no, Wikidata (P195/P276 de la obra)
    const fijo = it.holding_museum && MUSEOS_FIJOS[it.holding_museum.trim()];
    if (fijo) o.museo = fijo;
    else if (/^Q\d+$/.test(it.qid || '')) {
      const e = cache.get(it.qid);
      const mq = claimIds(e, 'P195')[0];   // solo la colección (P195): P276 suele ser una ubicación histórica
      if (mq) {
        const cp = await ciudadPais(mq);
        if (cp.museo) {
          const ciudad = CIUDAD_FIX[cp.ciudad] || cp.ciudad;
          const prop = [cp.museo, ciudad, cp.pais].filter((v, i, a) => v && a.indexOf(v) === i).join(', ');
          const ok = prop.split(', ').length >= 2;
          if (!ok) pend.push({ col, n: it.n, id, actual: it.holding_museum || null, motivo: 'Wikidata sin ciudad/país', wd: prop });
          else if (!it.holding_museum || /^https?:/.test(it.holding_museum) || solapa(it.holding_museum, cp.museo)) o.museo = prop;
          else pend.push({ col, n: it.n, id, actual: it.holding_museum, motivo: 'Wikidata discrepa del museo actual (puede ser ubicación histórica)', wd: prop });
        }
      } else totals.sinMuseoWD++;
    }
    // 1b) casos sueltos, URLs basura y país faltante
    if (!o.museo && it.holding_museum) {
      const hm = it.holding_museum.trim();
      if (/^https?:/.test(hm)) o.museo = null;
      else if (ESPECIALES[hm]) o.museo = ESPECIALES[hm];
    }
    {
      const fin = o.museo === undefined ? it.holding_museum : o.museo;
      if (fin && !/^https?:/.test(fin)) {
        const p = fin.split(', ');
        if (p.length === 2 && CIUDAD_PAIS[p[1]]) o.museo = (CIUDAD_PAIS[p[1]] === p[1]) ? fin : fin + ', ' + CIUDAD_PAIS[p[1]];
      }
    }
    if (o.museo !== undefined && o.museo === it.holding_museum) delete o.museo;
    if (o.museo !== undefined) totals.museoNuevo++;
    // 2) título en español: etiqueta es de Wikidata cuando title_es falta o es igual al inglés
    if (/^Q\d+$/.test(it.qid || '') && (!it.title_es || it.title_es === it.title)) {
      const es = cache.get(it.qid)?.labels?.es?.value;
      if (es && es !== it.title) { o.titulo = es; totals.tituloNuevo++; }
    }
    // 3) año: formato; y discrepancia con Wikidata (P571) solo se informa
    const ny = normYear(it.year);
    if (ny !== it.year && ny != null) { o.anio = ny; totals.anioNuevo++; }
    if (Object.keys(o).length) overlay[id] = { n: it.n, ...o, _antes: { museo: it.holding_museum || null, titulo: it.title_es || it.title, anio: it.year || null } };
  }
  report.push({ col, cambios: Object.keys(overlay).length });
  console.log(`${col.padEnd(28)} ${idx.items.length} obras · propuestas ${Object.keys(overlay).length}`);
  if (APPLY && Object.keys(overlay).length) {
    fs.mkdirSync('tools/meta', { recursive: true });
    const clean = Object.fromEntries(Object.entries(overlay).map(([k, v]) => { const { _antes, ...r } = v; return [k, r]; }));
    const fp = path.join('tools/meta', `${col}.json`);
    const prev = fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf8')) : {};   // acumulativo: nunca pierde lo ya normalizado
    const merged = { ...prev };
    for (const [k, v] of Object.entries(clean)) merged[k] = { ...(prev[k] || {}), ...v };   // por campo, no pisa lo anterior
    fs.writeFileSync(fp, JSON.stringify(merged, null, 1));
  }
  if (flag('report')) fs.writeFileSync(flag('report').replace(/(\.json)?$/, `_${col.slice(0, 2)}.json`), JSON.stringify(overlay, null, 1));
}
console.log(JSON.stringify(totals), 'pendientes de revisión:', pend.length);
if (flag('report')) fs.writeFileSync(flag('report').replace(/(.json)?$/, '_pendientes.json'), JSON.stringify(pend, null, 1));
if (APPLY) { fs.mkdirSync('tools/meta', { recursive: true }); fs.writeFileSync('tools/meta/_pendientes.json', JSON.stringify(pend, null, 1)); }
if (!APPLY) console.log('Dry-run. Con --apply escribe tools/meta/<col>.json; después node tools/apply-desc.mjs <col> --apply.');
