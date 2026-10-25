// tools/integrate-dark-art.mjs — Integración de obras desde C:\Users\Usuario\Desktop\Draco\dark_art
// Aplica 8 mejoras sobre obras existentes y 8 ingresos nuevos en sus colecciones correspondientes.
// Uso: node tools/integrate-dark-art.mjs [--apply]
import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { imgSize, orientationOf, buildFilename, loadIndex, saveIndex } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = 'C:/Users/Usuario/Desktop/Draco/dark_art';
const APPLY = process.argv.includes('--apply');

const UPGRADES = [
  {
    col: '06_macabro_memento_mori',
    file: '04_Saturn_Devouring_His_Son_Francisco_de_Goya_1823.jpg',
    sourceFile: 'Saturno_devorando_a_su_hijo_Francisco_de_Goya_1820-1823.jpg',
    expectedSize: { w: 1661, h: 3051 },
    extraIndexUpdates: {
      classification: 'Saturno devorando a su hijo (Pintura negra, mural trasladado a lienzo)',
      sourceId: 'File:Francisco de Goya, Saturno devorando a su hijo (1819-1823).jpg',
      source_url: 'https://commons.wikimedia.org/wiki/File:Francisco_de_Goya,_Saturno_devorando_a_su_hijo_(1819-1823).jpg',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Francisco_de_Goya%2C_Saturno_devorando_a_su_hijo_%281819-1823%29.jpg',
      holding_museum: 'Museo del Prado, Madrid',
      museum_confidence: 'wikidata',
      type: 'Óleo sobre revoco trasladado a lienzo'
    }
  },
  {
    col: '04_romanticismo',
    file: '03_The_Monk_by_the_Sea_Caspar_David_Friedrich_1810.jpg',
    sourceFile: 'El_monje_junto_al_mar_Caspar_David_Friedrich_1808-1810.jpg',
    expectedSize: { w: 3543, h: 2254 }
  },
  {
    col: '04_romanticismo',
    file: '04_Abbey_in_the_Oakwood_Caspar_David_Friedrich_1810.jpg',
    sourceFile: 'La_abadia_entre_robles_Caspar_David_Friedrich_1809-1810.jpg',
    expectedSize: { w: 4000, h: 2563 }
  },
  {
    col: '02_barroco',
    file: '101_Crucifixion_de_San_Pedro_Caravaggio_1600.jpg',
    sourceFile: 'Crucifixion_de_San_Pedro_Caravaggio_1600-1601.jpg',
    expectedSize: { w: 8180, h: 10537 },
    extraIndexUpdates: {
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Crucifixion_of_Saint_Peter-Caravaggio_%28c.1600%29.jpg'
    }
  },
  {
    col: '02_barroco',
    file: '08_The_Taking_of_Christ_Caravaggio_1602.jpg',
    sourceFile: 'El_prendimiento_de_Cristo_Caravaggio_1602.jpg',
    expectedSize: { w: 9893, h: 7666 },
    extraIndexUpdates: {
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/The_Taking_of_Christ-Caravaggio_%28c.1602%29.jpg'
    }
  },
  {
    col: '06_macabro_memento_mori',
    file: '01_The_Triumph_of_Death_Pieter_Bruegel_the_Elder_1562.jpg',
    sourceFile: 'El_triunfo_de_la_Muerte_Pieter_Bruegel_el_Viejo_1562.jpg',
    expectedSize: { w: 5200, h: 3697 }
  },
  {
    col: '02_barroco',
    file: '34_The_Massacre_of_the_Innocents_Rubens_1612.jpg',
    sourceFile: 'La_matanza_de_los_inocentes_Peter_Paul_Rubens_1610.jpg',
    expectedSize: { w: 7120, h: 4992 },
    extraIndexUpdates: {
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Rubens%2C_Peter_Paul_-_Massacre_of_the_Innocents_-_Art_Gallery_of_Ontario.jpg'
    }
  },
  {
    col: '02_barroco',
    file: '02_Judith_Beheading_Holofernes_Caravaggio_1599.jpg',
    sourceFile: 'Judith_decapitando_a_Holofernes_Caravaggio_1598-1599.jpg',
    expectedSize: { w: 3998, h: 2951 },
    extraIndexUpdates: {
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Judith_Beheading_Holofernes-Caravaggio_%28c.1598-9%29.jpg'
    }
  }
];

const NEW_WORKS = [
  {
    col: '06_macabro_memento_mori',
    sourceFile: 'Dos_viejos_comiendo_sopa_Francisco_de_Goya_1820-1823.jpg',
    expectedSize: { w: 3051, h: 1806 },
    n: 40,
    title: 'Dos viejos comiendo sopa',
    title_es: 'Dos viejos comiendo sopa',
    artist: 'Francisco de Goya',
    year: '1823',
    qid: 'Q3291664',
    museum: 'Wikimedia',
    holding_museum: 'Museo del Prado, Madrid',
    museum_confidence: 'wikidata',
    license: 'Dominio público',
    source_url: 'https://commons.wikimedia.org/wiki/File:Dos_viejos_comiendo_sopa.jpg',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Dos_viejos_comiendo_sopa.jpg',
    sourceId: 'File:Dos viejos comiendo sopa.jpg',
    kind: 'named',
    school: 'Romanticismo (España)',
    type: 'Óleo sobre revoco trasladado a lienzo',
    description: 'Dos figuras cadavéricas y grotescas comparten un cuenco: una sostiene una cuchara con mueca macabra mientras la otra, con aspecto de calavera encapuchada, parece susurrarle o vigilarla. Goya pintó esta sobrecogedora escena sobre el dintel de la puerta de su Quinta del Sordo, convirtiendo un acto cotidiano en una pesadilla espectral sobre la decrepitud y la senectud. Obra cumbre de las Pinturas Negras.',
    description_source: 'Síntesis (Claude, fundada en Wikipedia/curatoría)'
  },
  {
    col: '06_macabro_memento_mori',
    sourceFile: 'El_jardin_de_las_delicias_panel_del_infierno_Hieronymus_Bosch_1490-1510.jpg',
    expectedSize: { w: 1778, h: 4324 },
    n: 41,
    title: 'El jardín de las delicias (Panel del Infierno)',
    title_es: 'El jardín de las delicias (Panel del Infierno)',
    artist: 'Hieronymus Bosch',
    year: '1505',
    qid: 'Q321303',
    museum: 'Wikimedia',
    holding_museum: 'Museo del Prado, Madrid',
    museum_confidence: 'wikidata',
    license: 'Dominio público',
    source_url: 'https://commons.wikimedia.org/wiki/File:The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg',
    sourceId: 'File:The Garden of Earthly Delights by Bosch High Resolution.jpg',
    kind: 'named',
    school: 'Renacimiento flamenco',
    type: 'Óleo sobre tabla',
    description: 'El panel derecho del célebre tríptico de El Bosco retrata la condenación eterna como una noche en llamas poblada de monstruos, máquinas de tortura e instrumentos musicales convertidos en suplicio. En el centro domina el enigmático hombre-árbol sobre un lago congelado, rodeado de pecadores sometidos a castigos acordes a sus vicios. Es una de las visiones más aterradoras y visionarias del tormento infernal en toda la historia del arte occidental.',
    description_source: 'Síntesis (Claude, fundada en Wikipedia/curatoría)'
  },
  {
    col: '03_gotico',
    sourceFile: 'La_caida_de_los_angeles_rebeldes_Pieter_Bruegel_el_Viejo_1562.jpg',
    expectedSize: { w: 10000, h: 7218 },
    n: 102,
    title: 'La caída de los ángeles rebeldes',
    title_es: 'La caída de los ángeles rebeldes',
    artist: 'Pieter Bruegel the Elder',
    year: '1562',
    qid: 'Q594406',
    museum: 'Wikimedia',
    holding_museum: 'Museos Reales de Bellas Artes de Bélgica, Bruselas',
    museum_confidence: 'wikidata',
    license: 'Dominio público',
    source_url: 'https://commons.wikimedia.org/wiki/File:Pieter_Bruegel_the_Elder_-_The_Fall_of_the_Rebel_Angels_-_Google_Art_Project.jpg',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Pieter_Bruegel_the_Elder_-_The_Fall_of_the_Rebel_Angels_-_Google_Art_Project.jpg',
    sourceId: 'File:Pieter Bruegel the Elder - The Fall of the Rebel Angels - Google Art Project.jpg',
    kind: 'named',
    school: 'Renacimiento flamenco',
    type: 'Óleo sobre tabla',
    description: 'El arcángel san Miguel, envuelto en una brillante armadura dorada, comanda a las huestes celestiales contra Lucifer y los ángeles sublevados. Los rebeldes se precipitan al abismo transformándose en un enjambre grotesco de monstruos zoomorfos, peces viscosos, insectos y quimeras demoníacas. Con una inventiva que homenajea a El Bosco, Bruegel compone una vorágine cósmica sobre la soberbia y el triunfo del orden divino.',
    description_source: 'Síntesis (Claude, fundada en Wikipedia/curatoría)'
  },
  {
    col: '02_barroco',
    sourceFile: 'La_sepultura_de_Cristo_Caravaggio_1603-1604.jpg',
    expectedSize: { w: 8810, h: 13086 },
    n: 126,
    title: 'La sepultura de Cristo',
    title_es: 'La sepultura de Cristo',
    artist: 'Caravaggio',
    year: '1604',
    qid: 'Q1213151',
    museum: 'Wikimedia',
    holding_museum: 'Pinacoteca Vaticana, Roma',
    museum_confidence: 'wikidata',
    license: 'Dominio público',
    source_url: 'https://commons.wikimedia.org/wiki/File:The_Entombment_of_Christ-Caravaggio_(c.1602-3).jpg',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/The_Entombment_of_Christ-Caravaggio_%28c.1602-3%29.jpg',
    sourceId: 'File:The Entombment of Christ-Caravaggio (c.1602-3).jpg',
    kind: 'named',
    school: 'Barroco (tenebrismo)',
    type: 'Óleo sobre lienzo',
    description: 'Nicodemo y Juan sostienen el cuerpo inerte y pesado de Cristo mientras lo bajan hacia la losa sepulcral que sobresale en escorzo hacia el espacio del espectador. Alrededor, la Virgen María, María Magdalena y María de Cleofás exteriorizan el dolor con gestos que van desde la resignación contenida hasta el llanto desgarrador con los brazos en alto. Es una de las cumbres absolutas del tenebrismo de Caravaggio, aunando monumentalidad escultórica y dramatismo humano.',
    description_source: 'Síntesis (Claude, fundada en Wikipedia/curatoría)'
  },
  {
    col: '02_barroco',
    sourceFile: 'Flagelacion_de_Cristo_Caravaggio_1607.jpg',
    expectedSize: { w: 9312, h: 7112 },
    n: 127,
    title: 'Cristo a la columna',
    title_es: 'Cristo a la columna',
    artist: 'Caravaggio',
    year: '1607',
    qid: 'Q931837',
    museum: 'Wikimedia',
    holding_museum: 'Museo de Bellas Artes de Ruán',
    museum_confidence: 'wikidata',
    license: 'Dominio público',
    source_url: 'https://commons.wikimedia.org/wiki/File:La_Flagellation_du_Christ_-_Le_Caravage_-_Mus%C3%A9e_des_Beaux-Arts_de_Rouen.jpg',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/d/da/La_Flagellation_du_Christ_-_Le_Caravage_-_Mus%C3%A9e_des_Beaux-Arts_de_Rouen.jpg',
    sourceId: 'File:La Flagellation du Christ - Le Caravage - Musée des Beaux-Arts de Rouen.jpg',
    kind: 'named',
    school: 'Barroco (tenebrismo)',
    type: 'Óleo sobre lienzo',
    description: 'Jesús aparece atado a una columna baja, recibiendo la luz frontal que resalta su anatomía exhausta y vulnerable frente a la brutalidad de sus verdugos. Uno de los sayones tira violentamente de su cabello mientras otro empuña un manojo de varas en la penumbra. Pintada durante su primer periodo napolitano, la composición despojada concentra toda la tensión física y espiritual en la crudeza del tormento.',
    description_source: 'Síntesis (Claude, fundada en Wikipedia/curatoría)'
  },
  {
    col: '02_barroco',
    sourceFile: 'Salome_con_la_cabeza_de_Juan_el_Bautista_Caravaggio_1610.jpg',
    expectedSize: { w: 6237, h: 5304 },
    n: 128,
    title: 'Salomé con la cabeza de Juan el Bautista',
    title_es: 'Salomé con la cabeza de Juan el Bautista',
    artist: 'Caravaggio',
    year: '1610',
    qid: 'Q2318325',
    museum: 'Wikimedia',
    holding_museum: 'National Gallery, Londres',
    museum_confidence: 'wikidata',
    license: 'Dominio público',
    source_url: 'https://commons.wikimedia.org/wiki/File:Salome_with_the_Head_of_John_the_Baptist-Caravaggio_(London).jpg',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Salome_with_the_Head_of_John_the_Baptist-Caravaggio_%28London%29.jpg',
    sourceId: 'File:Salome with the Head of John the Baptist-Caravaggio (London).jpg',
    kind: 'named',
    school: 'Barroco (tenebrismo)',
    type: 'Óleo sobre lienzo',
    description: 'El verdugo sostiene por los cabellos la cabeza decapitada del Bautista para depositarla en una bandeja de plata sostenida por Salomé, quien desvía la mirada con frialdad y turbación. Una anciana criada contempla la escena con expresión de asombro y consternación en medio de una profunda atmósfera oscura. Obra tardía de Caravaggio, realizada con pinceladas veloces y sobrias que reflejan la angustia de sus últimos meses de vida.',
    description_source: 'Síntesis (Claude, fundada en Wikipedia/curatoría)'
  },
  {
    col: '04_romanticismo',
    sourceFile: 'Pandemonium_John_Martin_1841.jpg',
    expectedSize: { w: 3224, h: 2127 },
    n: 102,
    title: 'Pandemonium',
    title_es: 'Pandemonium',
    artist: 'John Martin',
    year: '1841',
    qid: 'Q18939074',
    museum: 'Wikimedia',
    holding_museum: 'Museo del Louvre, París',
    museum_confidence: 'wikidata',
    license: 'Dominio público',
    source_url: 'https://commons.wikimedia.org/wiki/File:John_Martin_-_Le_Pandemonium_-_Mus%C3%A9e_du_Louvre.jpg',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/29/John_Martin_-_Le_Pandemonium_-_Mus%C3%A9e_du_Louvre.jpg',
    sourceId: 'File:John Martin - Le Pandemonium - Musée du Louvre.jpg',
    kind: 'named',
    school: 'Romanticismo',
    type: 'Óleo sobre lienzo',
    description: 'Inspirada en el poema El paraíso perdido de John Milton, la pintura representa la construcción del palacio de Satanás en el corazón del Infierno. Satanás se alza con armadura y espada al borde de un abismo sobre ríos de lava y magma candente, arengando a incontables legiones de ángeles caídos. Martin despliega su deslumbrante estética de lo sublime, combinando una arquitectura colosal con una escala cósmica y cataclísmica.',
    description_source: 'Síntesis (Claude, fundada en Wikipedia/curatoría)'
  },
  {
    col: '07_alto_renacimiento',
    sourceFile: 'Los_condenados_al_infierno_Luca_Signorelli_1499-1502.jpg',
    expectedSize: { w: 2592, h: 1952 },
    n: 95,
    title: 'Los condenados al infierno',
    title_es: 'Los condenados al infierno',
    artist: 'Luca Signorelli',
    year: '1502',
    qid: 'Q97377044',
    museum: 'Wikimedia',
    holding_museum: 'Capilla de San Brizio, Catedral de Orvieto',
    museum_confidence: 'wikidata',
    license: 'Dominio público',
    source_url: 'https://commons.wikimedia.org/wiki/File:Signorelli_-_I_dannati_all%27Inferno.jpg',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Signorelli_-_I_dannati_all%27Inferno.jpg',
    sourceId: 'File:Signorelli - I dannati all\'Inferno.jpg',
    kind: 'named',
    school: 'Alto Renacimiento',
    type: 'Fresco',
    description: 'Parte del monumental ciclo sobre el Juicio Final en la capilla de San Brizio, el fresco muestra a una masa de almas torturadas por demonios polícromos bajo la mirada de arcángeles armados. Signorelli realiza un audaz estudio anatómico del desnudo masculino en movimiento y escorzos extremos. Su potencia dramática y crudeza influyeron directamente en el Juicio Final de Miguel Ángel.',
    description_source: 'Síntesis (Claude, fundada en Wikipedia/curatoría)'
  }
];

async function main() {
  console.log(`=== INTEGRATE DARK ART (${APPLY ? 'APPLY' : 'DRY RUN'}) ===\n`);

  const affectedCols = new Set([...UPGRADES.map(u => u.col), ...NEW_WORKS.map(w => w.col)]);
  const indices = {};
  for (const c of affectedCols) {
    indices[c] = await loadIndex(c);
  }

  // Si la carpeta origen ya no existe (fue movida a la papelera tras el paso 4), verificamos el estado
  if (!existsSync(SOURCE_DIR)) {
    console.log(`Carpeta origen ${SOURCE_DIR} ya fue movida a la papelera de reciclaje.`);
    console.log('Verificando que las 16 obras (8 upgrades + 8 nuevas) estén presentes e intactas en el repositorio...\n');

    let allOk = true;
    for (const u of UPGRADES) {
      const idx = indices[u.col];
      const item = idx.items.find(it => it.file === u.file);
      if (!item) {
        console.error(`[FALTA ÍNDICE] Upgrade ${u.col} ${u.file}`);
        allOk = false;
        continue;
      }
      const diskPath = path.join(ROOT, u.col, item.orientation, item.file);
      if (!existsSync(diskPath)) {
        console.error(`[FALTA DISCO] ${diskPath}`);
        allOk = false;
        continue;
      }
      const buf = await fs.readFile(diskPath);
      const sz = imgSize(buf);
      if (sz.w !== u.expectedSize.w || sz.h !== u.expectedSize.h) {
        console.error(`[DIMS MISMATCH] ${u.file}: esperado ${u.expectedSize.w}x${u.expectedSize.h}, obtenido ${sz.w}x${sz.h}`);
        allOk = false;
        continue;
      }
      console.log(`✓ Upgrade verificado: [${u.col}] #${item.n} ${item.title} (${sz.w}x${sz.h}, ${(buf.length / 1e6).toFixed(2)} MB)`);
    }

    for (const w of NEW_WORKS) {
      const idx = indices[w.col];
      const filename = buildFilename(w.n, w.title, w.artist, w.year);
      const item = idx.items.find(it => it.file === filename || it.n === w.n);
      if (!item) {
        console.error(`[FALTA ÍNDICE] Nueva obra ${w.col} #${w.n} ${w.title}`);
        allOk = false;
        continue;
      }
      const diskPath = path.join(ROOT, w.col, item.orientation, item.file);
      if (!existsSync(diskPath)) {
        console.error(`[FALTA DISCO] ${diskPath}`);
        allOk = false;
        continue;
      }
      const buf = await fs.readFile(diskPath);
      const sz = imgSize(buf);
      if (sz.w !== w.expectedSize.w || sz.h !== w.expectedSize.h) {
        console.error(`[DIMS MISMATCH] ${w.title}: esperado ${w.expectedSize.w}x${w.expectedSize.h}, obtenido ${sz.w}x${sz.h}`);
        allOk = false;
        continue;
      }
      console.log(`✓ Nueva obra verificada: [${w.col}] #${item.n} ${item.title} (${sz.w}x${sz.h}, ${(buf.length / 1e6).toFixed(2)} MB)`);
    }

    if (!allOk) {
      throw new Error('Fallo en la verificación de obras de dark_art en el repositorio.');
    }
    console.log('\n¡Todas las 16 obras están perfectamente integradas y verificadas!');
    return;
  }

  console.log('--- 1. UPGRADES (8 obras) ---');
  for (const u of UPGRADES) {
    const srcPath = path.join(SOURCE_DIR, u.sourceFile);
    const buf = await fs.readFile(srcPath);
    const sz = imgSize(buf);
    if (!sz) throw new Error(`No se pudieron leer dimensiones de ${srcPath}`);

    const idx = indices[u.col];
    const item = idx.items.find(it => it.file === u.file);
    if (!item) throw new Error(`No se encontró el item ${u.file} en ${u.col}`);

    console.log(`[UPGRADE] ${u.col} #${item.n} ${item.title}:`);
    console.log(`  Actual:  ${item.width}x${item.height} (${(item.bytes / 1e6).toFixed(2)} MB)`);
    console.log(`  Nuevo:   ${sz.w}x${sz.h} (${(buf.length / 1e6).toFixed(2)} MB)`);

    const destPath = path.join(ROOT, u.col, item.orientation, item.file);

    if (APPLY) {
      await fs.writeFile(destPath, buf);
      item.width = sz.w;
      item.height = sz.h;
      item.bytes = buf.length;
      if (u.extraIndexUpdates) {
        Object.assign(item, u.extraIndexUpdates);
      }
    }
  }

  console.log('\n--- 2. NUEVAS OBRAS (8 obras) ---');
  for (const w of NEW_WORKS) {
    const srcPath = path.join(SOURCE_DIR, w.sourceFile);
    const buf = await fs.readFile(srcPath);
    const sz = imgSize(buf);
    if (!sz) throw new Error(`No se pudieron leer dimensiones de ${srcPath}`);

    const filename = buildFilename(w.n, w.title, w.artist, w.year);
    const orient = orientationOf(sz.w, sz.h);
    const destPath = path.join(ROOT, w.col, orient, filename);

    console.log(`[NEW] ${w.col} #${w.n} ${w.title} (${w.artist}, ${w.year}):`);
    console.log(`  Archivo:     ${filename}`);
    console.log(`  Orientación: ${orient} (${sz.w}x${sz.h}, ${(buf.length / 1e6).toFixed(2)} MB)`);

    const idx = indices[w.col];
    if (idx.items.some(it => it.n === w.n)) {
      throw new Error(`Colisión de n #${w.n} en ${w.col}`);
    }

    const newItem = {
      n: w.n,
      file: filename,
      orientation: orient,
      title: w.title,
      title_es: w.title_es,
      artist: w.artist,
      year: w.year,
      museum: w.museum,
      holding_museum: w.holding_museum,
      museum_confidence: w.museum_confidence,
      license: w.license,
      source_url: w.source_url,
      image_url: w.image_url,
      width: sz.w,
      height: sz.h,
      bytes: buf.length,
      sourceId: w.sourceId,
      kind: w.kind,
      school: w.school,
      type: w.type,
      qid: w.qid,
      description: w.description,
      description_source: w.description_source
    };

    if (APPLY) {
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.writeFile(destPath, buf);
      idx.items.push(newItem);
      idx.items.sort((a, b) => a.n - b.n);
    }
  }

  if (APPLY) {
    for (const c of affectedCols) {
      await saveIndex(c, indices[c]);
      console.log(`\nGuardado ${c}/_index.json (${indices[c].items.length} obras)`);
    }
    console.log('\n¡Cambios aplicados con éxito!');
  } else {
    console.log('\nDRY RUN finalizado sin escribir cambios.');
  }
}

main().catch(err => {
  console.error('\nERROR:', err);
  process.exit(1);
});
