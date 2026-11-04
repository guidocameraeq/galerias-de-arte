// Nombre de cada colección como galería de la app (carpeta en Drive y "titulo" del galeria.json).
// Al crear una colección nueva, agregala acá (docs/procesos/NUEVA_COLECCION.md paso 8).
export const TITULOS = {
  '01_mitologia_griega_romana': 'Mitología griega y romana', '02_barroco': 'Barroco', '03_gotico': 'Gótico', '04_romanticismo': 'Romanticismo',
  '05_egipcio': 'Antiguo Egipto', '06_macabro_memento_mori': 'Macabro y memento mori', '07_alto_renacimiento': 'Alto Renacimiento',
  '08_impresionismo': 'Impresionismo', '09_postimpresionismo': 'Postimpresionismo', '10_realismo': 'Realismo', '11_rococo': 'Rococó',
  '12_simbolismo_modernismo': 'Simbolismo y Art Nouveau', '13_vanguardias': 'Vanguardias', '14_surrealismo': 'Surrealismo',
  '15_pop_americano': 'Pop Art americano', '16_neoclasicismo': 'Neoclasicismo', '17_dore_divina_comedia': 'Doré, La Divina Comedia',
  '18_escultura_griega': 'Escultura griega', '19_marcelo_canevari': 'Marcelo Canevari', '20_alfred_kubin': 'Alfred Kubin',
  '21_rob_gonsalves': 'Rob Gonsalves', '22_zdzislaw_beksinski': 'Zdzisław Beksiński', '23_mariusz_lewandowski': 'Mariusz Lewandowski',
};
export const tituloDe = (col) => TITULOS[col] || col.replace(/^d+_/, '').replace(/_/g, ' ');

// Id de cada obra en el galeria.json de la app. ÚNICA fuente de esta regla: la usan export-drive.mjs (para escribir)
// y drive-curation.mjs (para volver de un id de Drive a la obra exacta). Orden: qid → sourceId → source_url → image_url;
// si el id ya lo usó una obra anterior (por n), se prueba el sourceId y si no se agrega "#n".
export function idsGaleria(items, col) {
  const ids = new Map(), used = new Set();
  for (const it of [...items].sort((a, b) => a.n - b.n)) {
    let id = it.qid || it.sourceId || it.source_url || it.image_url || `${col}:${it.n}`;
    if (used.has(id)) id = it.sourceId && !used.has(it.sourceId) ? it.sourceId : `${id}#${it.n}`;
    used.add(id); ids.set(it, id);
  }
  return ids;
}
