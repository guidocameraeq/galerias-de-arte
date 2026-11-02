// Valida cada galeria.json de una carpeta de galerías: JSON válido, archivos existentes, ids sin repetir, largo de explicaciones.
// Uso: node tools/check-prueba-json.mjs [carpeta]   (por defecto _export/Galerías-prueba)
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.argv[2] || '_export/Galerías-prueba');
for (const d of fs.readdirSync(ROOT)) {
  const f = path.join(ROOT, d, 'galeria.json');
  if (!fs.existsSync(f)) continue;
  let j;
  try { j = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { console.log(`${d}: JSON INVÁLIDO (${e.message})`); continue; }
  const miss = [], ids = new Set(), dup = [];
  for (const o of j.obras || []) {
    if (!fs.existsSync(path.join(ROOT, d, o.archivo))) miss.push(o.archivo);
    if (o.id) { if (ids.has(o.id)) dup.push(o.id); ids.add(o.id); }
    const w = o.explicacion ? o.explicacion.split(/\s+/).length : 0;
    console.log(`  ${o.archivo}: ${w} palabras, forma=${o.forma || '-'}`);
  }
  const listed = new Set((j.obras || []).map(o => o.archivo));
  const unlisted = fs.readdirSync(path.join(ROOT, d)).filter(x => /\.(jpe?g|png|webp)$/i.test(x) && !listed.has(x));
  console.log(`${d}: JSON válido · obras ${(j.obras || []).length} · faltan [${miss}] · ids repetidos [${dup}] · imágenes sin listar [${unlisted}]`);
}
