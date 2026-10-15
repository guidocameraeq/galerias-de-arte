// Polish final del gap-fill: (1) elimina 07 #50 (item basura de Wikidata "ética ambiental");
// (2) escribe a mano título_es + descripción (es) de obras famosas sin artículo es.wikipedia.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { loadIndex, saveIndex } from './lib.mjs';

const SRC = 'Síntesis (Claude, fundada en Wikipedia/curatoría)';
const DATA = {
  '16_neoclasicismo': [
    { n: 18, titulo: 'Bonaparte visitando a los apestados de Jaffa', d: 'Napoleón toca sin miedo a un soldado apestado durante la campaña de Egipto, en un gesto de coraje casi mesiánico. Gros convierte la propaganda en epopeya y anticipa el Romanticismo. Heroísmo y compasión.' },
    { n: 35, d: 'Jasón avanza desnudo y sereno con el vellocino de oro al hombro, en un clasicismo de mármol purísimo. Thorvaldsen, el gran escultor neoclásico danés, rivalizó con Canova. Ideal heroico griego.' },
    { n: 41, titulo: 'Retrato de la princesa María Cristina', d: 'Retrato cortesano de gracia y elegancia por la gran retratista de María Antonieta. Vigée Le Brun captura la delicadeza aristocrática del Antiguo Régimen.' },
    { n: 42, titulo: 'El cántaro roto', d: 'Una joven sostiene un cántaro roto, símbolo transparente de la inocencia perdida. Greuze combina sentimentalismo y moraleja con una seductora ambigüedad. Virtud y sensualidad.' },
  ],
  '04_romanticismo': [
    { n: 76, d: 'Cinco figuras en la orilla —de la infancia a la vejez— se reflejan en cinco barcos en distintos puntos del mar: alegoría del viaje de la vida hacia la muerte. Friedrich medita, melancólico, sobre el tiempo. El ocaso de la existencia.' },
    { n: 80, titulo: 'Dido construyendo Cartago', d: 'La reina Dido supervisa la construcción de Cartago bajo un sol cegador que disuelve la arquitectura en luz dorada. Turner rinde homenaje a Claudio de Lorena y a la grandeza de los imperios. Luz y ambición.' },
    { n: 86, titulo: 'Puesta de sol (hermanos)', d: 'Figuras diminutas contemplan en silencio un sol que se hunde en el horizonte. Friedrich hace del crepúsculo una experiencia espiritual. Contemplación y trascendencia.' },
    { n: 90, titulo: 'El árbol de los cuervos', d: 'Un roble retorcido y desnudo, rodeado de cuervos, se alza sobre un túmulo antiguo al atardecer. Friedrich carga el paisaje de melancolía y presagio de muerte. Naturaleza y soledad.' },
    { n: 91, titulo: 'El Watzmann', d: 'La cumbre nevada del Watzmann se eleva, sublime e inalcanzable, sobre colinas en sombra. Friedrich contrapone la pequeñez humana a la inmensidad de la montaña. Lo sublime romántico.' },
    { n: 99, titulo: 'Amanecer con monstruos marinos', q: 'baja', d: 'Una visión casi abstracta de luz y agua al amanecer, con formas marinas apenas insinuadas. El Turner tardío disuelve el motivo en pura atmósfera. La luz que se vuelve abstracción.' },
    { n: 100, titulo: 'Pescadores en el mar', d: 'Barcas de pescadores se mecen a la luz de la luna entre olas amenazantes. Primera gran obra de Turner, ya obsesionada con la fuerza del mar y la fragilidad humana. Noche y oleaje.' },
  ],
  '10_realismo': [
    { n: 47, titulo: 'Retrato de una desconocida', d: 'Una mujer elegante y altiva mira desde un carruaje en San Petersburgo, enigmática y socialmente ambigua. Kramskoi crea el retrato más célebre del realismo ruso. Belleza y misterio.' },
    { n: 58, titulo: 'Cristo en el desierto', d: 'Cristo, sentado entre rocas áridas al amanecer, medita angustiado sobre su destino, profundamente humano. Kramskoi pinta la duda y la soledad moral. Espiritualidad realista.' },
    { n: 70, titulo: 'Nocturno en negro y oro: el cohete que cae', d: 'Fuegos artificiales se deshacen en chispas sobre un cielo nocturno casi abstracto. Whistler antepuso la armonía de color al tema; un crítico lo acusó de "arrojar pintura" y Whistler lo demandó. Hacia la abstracción.' },
  ],
  '12_simbolismo_modernismo': [
    { n: 59, titulo: 'La orden de liberación', d: 'La esposa de un prisionero jacobita escocés entrega la orden de su liberación mientras sostiene a su hijo dormido. Millais, prerrafaelita, carga la escena de emoción y detalle minucioso. Amor y lealtad.' },
  ],
  '13_vanguardias': [
    { n: 26, titulo: 'Retrato de Wally', d: 'Retrato de Wally Neuzil, modelo y amante de Schiele, de mirada franca e intensa. El expresionismo vienés en su intimidad más tierna y cruda. Juventud y deseo.' },
    { n: 29, titulo: 'Cuadrado rojo', q: 'baja', d: 'Un cuadrado rojo ligeramente irregular sobre fondo blanco, subtitulado "realismo pictórico de una campesina". Malévich lleva el suprematismo a la pura sensación de color y forma. Abstracción radical.' },
    { n: 41, titulo: 'La calle entra en la casa', d: 'Desde un balcón, el bullicio de la ciudad —obreros, caballos, andamios— irrumpe simultáneamente en todas direcciones. Boccioni plasma el dinamismo futurista: velocidad y simultaneidad. La ciudad moderna en erupción.' },
  ],
};

// (1) eliminar 07 #50 basura
const idx7 = await loadIndex('07_alto_renacimiento');
const bad = idx7.items.find(it => it.n === 50);
if (bad && /ética ambiental/i.test(bad.title)) {
  try { await fs.unlink(path.join('07_alto_renacimiento', bad.orientation, bad.file)); } catch {}
  idx7.items = idx7.items.filter(it => it.n !== 50);
  await saveIndex('07_alto_renacimiento', idx7);
  console.log('07 #50 "ética ambiental" ELIMINADO.');
}

// (2) descripciones a mano
for (const col of Object.keys(DATA)) {
  const idx = await loadIndex(col);
  const byN = new Map(idx.items.map(it => [it.n, it]));
  let c = 0;
  for (const d of DATA[col]) {
    const it = byN.get(d.n); if (!it) { console.log(`  !! ${col} #${d.n} no existe`); continue; }
    if (d.titulo) it.title_es = d.titulo;
    it.description = d.d; it.description_source = SRC;
    if (d.q) it.image_quality = d.q;
    c++;
  }
  await saveIndex(col, idx);
  console.log(`${col}: ${c} fichas a mano.`);
}
console.log('LISTO.');
