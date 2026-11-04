// Clava cada ficha de tools/desc/<col>.mjs a su obra por un id ESTABLE (qid o sourceId), no solo por n.
// Así una poda/renumeración ya no corre las fichas (el bug de 10_realismo n30–40, 2026-11-02).
// Toma el id del alineamiento ACTUAL (n → obra), solo si: el id es único en la colección y el `titulo` de la ficha
// coincide con el title_es de la obra. Orden de id: qid → sourceId → source_url → image_url (el primero único). Lo que no cumple se informa y queda como estaba (por n).
// Idempotente (no toca entradas que ya tienen id). Dry-run por defecto. Uso: node tools/desc-add-ids.mjs [--col=NN_x] [--apply]
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const ROOT = process.cwd();
const APPLY = process.argv.includes('--apply');
const only = (process.argv.find(a => a.startsWith('--col=')) || '').slice(6);
const base = fs.existsSync(path.join(ROOT, 'colecciones')) ? path.join(ROOT, 'colecciones') : ROOT;
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
let tot = { ok: 0, ya: 0, sinId: 0, titulo: 0, faltaN: 0 };
for (const f of fs.readdirSync(path.join(ROOT, 'tools/desc')).filter(x => x.endsWith('.mjs'))) {
  const col = f.replace(/\.mjs$/, '');
  if (only && col !== only) continue;
  const idxP = path.join(base, col, '_index.json');
  if (!fs.existsSync(idxP)) continue;
  const items = JSON.parse(fs.readFileSync(idxP, 'utf8')).items;
  const byN = new Map(items.map(i => [i.n, i]));
  const count = (k, v) => items.filter(i => i[k] === v).length;
  const fp = path.join(ROOT, 'tools/desc', f);
  const entries = (await import(pathToFileURL(fp).href + `?t=${Date.now()}`)).default;
  const idFor = new Map(), problemas = [];
  for (const e of entries) {
    if (e.id) { tot.ya++; continue; }
    const it = byN.get(e.n);
    if (!it) { tot.faltaN++; problemas.push(`n${e.n}: no existe en el índice`); continue; }
    const a = norm(e.titulo), b = norm(it.title_es);
    if (e.titulo && it.title_es && a !== b && !a.includes(b) && !b.includes(a)) { tot.titulo++; problemas.push(`n${e.n}: ficha "${e.titulo}" ≠ obra "${it.title_es}"`); continue; }
    const id = ['qid', 'sourceId', 'source_url', 'image_url'].map(k => it[k] && count(k, it[k]) === 1 ? it[k] : null).find(Boolean) || null;
    if (!id) { tot.sinId++; problemas.push(`n${e.n}: sin qid/sourceId único`); continue; }
    idFor.set(e.n, id); tot.ok++;
  }
  console.log(`${col.padEnd(30)} ids nuevos ${String(idFor.size).padStart(3)} · problemas ${problemas.length}`);
  problemas.slice(0, 6).forEach(p => console.log(`    ${p}`));
  if (!APPLY || !idFor.size) continue;
  let src = fs.readFileSync(fp, 'utf8'), hechos = 0;
  src = src.replace(/(\{\s*)("?)n\2(\s*:\s*)(\d+)(\s*,)/g, (m, open, q, colon, num, comma) => {
    const id = idFor.get(Number(num));
    if (!id) return m;
    hechos++;
    const nl = open.includes('\n');
    const indent = nl ? open.slice(open.lastIndexOf('\n')) : ' ';
    return `${open}${q}n${q}${colon}${num}${comma}${nl ? indent : ' '}${q ? '"id"' : 'id'}${colon}${JSON.stringify(id)},`;
  });
  if (hechos !== idFor.size) { console.log(`    ✗ ${col}: esperaba ${idFor.size} reemplazos y hubo ${hechos}; NO se escribe`); continue; }
  fs.writeFileSync(fp, src);
}
console.log(`\nTOTAL ids ${APPLY ? 'agregados' : 'a agregar'} ${tot.ok} · ya tenían ${tot.ya} · sin id único ${tot.sinId} · título no coincide ${tot.titulo} · n inexistente ${tot.faltaN}`);
if (!APPLY) console.log('Dry-run: agregá --apply para escribir.');
