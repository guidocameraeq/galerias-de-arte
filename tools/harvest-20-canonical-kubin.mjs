// tools/harvest-20-canonical-kubin.mjs
// Descarga e integra las 15 obras canónicas maestras de Alfred Kubin (1877–1959).
// Fuentes: Städtische Galerie im Lenbachhaus (Múnich), Christie's, Artera, Heidi Horten Collection.
// Piso: lado largo >= 1000 px.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import sharp from 'sharp';
import { loadIndex, saveIndex, looksLikeImage } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COL = '20_alfred_kubin';
const colDir = path.join(ROOT, COL);

export const CANONICAL_TARGETS = [
  {
    n: 42,
    title: "Die Hexe",
    title_es: "La Bruja",
    year: "1900",
    school: "Simbolismo / Expresionismo",
    type: "Tinta china y aguada sobre papel",
    holding_museum: "Schlossmuseum Linz / Colección privada",
    museum: "Schlossmuseum Linz",
    license: "Con copyright (uso personal)",
    source_url: "https://www.artchive.com/artwork/the-witch-alfred-kubin-1900/",
    image_url: "https://d2w8kbdekdi1gv.cloudfront.net/eyJidWNrZXQiOiAiYXJ0ZXJhLWltYWdlcy1idWNrZXQiLCAia2V5IjogImFydHdvcmtzLzRmOWEzZTI5LWQyOGUtNGIwZC05OWEwLTAxMzE2Y2FiMTNhNS80ZjlhM2UyOS1kMjhlLTRiMGQtOTlhMC0wMTMxNmNhYjEzYTVfZnVsbC5qcGciLCAiZWRpdHMiOiB7InJlc2l6ZSI6IHsid2lkdGgiOiAxOTIwLCAiaGVpZ2h0IjogMTkyMCwgImZpdCI6ICJpbnNpZGUifX19",
    sourceId: "artchive:the-witch",
    description: "Sobre una rama retorcida que domina un páramo siniestro, una anciana esquelética de cabellera erizada gesticula como una directora de orquesta macabra. Debajo de ella, múltiples cadáveres de ahorcados oscilan colgados de los árboles en medio de una penumbra espectral. La personificación del terror ciego y el destino trágico, inspirada en las visiones de Goya y las pesadillas de la mitología popular germánica.",
    description_source: "Síntesis (fundada en curatoría de Schlossmuseum Linz y WikiArt)"
  },
  {
    n: 43,
    title: "Der Bräutigam",
    title_es: "El Novio",
    year: "1905",
    school: "Simbolismo / Expresionismo",
    type: "Óleo y gouache sobre papel",
    holding_museum: "Colección privada (ex subasta Christie's París)",
    museum: "Christie's",
    license: "Con copyright (uso personal)",
    source_url: "https://www.christies.com/en/lot/lot-6580036",
    image_url: "https://www.christies.com/img/LotImages/2026/PAR/2026_PAR_24844_0033_000(alfred_kubin_der_brautigam085803).jpg?mode=max",
    sourceId: "christies:lot-6580036",
    description: "Una figura fantasmal vestida de gala avanza con paso rígido y rostro cadavérico a través de un paisaje onírico bañado por densas veladuras de color. Tras su matrimonio y el contacto con la Secesión vienesa, Kubin incorporó gouache y óleo para dotar a sus visiones de una fosforescencia cromática inquietante. El cortejo nupcial transformado en una marcha sonámbula hacia lo desconocido.",
    description_source: "Síntesis (fundada en curatoría de Christie's y The Met)"
  },
  {
    n: 44,
    title: "Ruinen",
    title_es: "Ruinas",
    year: "1905",
    school: "Simbolismo / Expresionismo",
    type: "Óleo y gouache sobre papel",
    holding_museum: "Colección privada (ex subasta Christie's París)",
    museum: "Christie's",
    license: "Con copyright (uso personal)",
    source_url: "https://www.christies.com/en/lot/lot-6580036",
    image_url: "https://www.christies.com/img/LotImages/2026/PAR/2026_PAR_24844_0034_000(alfred_kubin_ruinen085846).jpg?mode=max",
    sourceId: "christies:lot-ruinen",
    description: "Torres y arcadas colosales en ruinas emergen entre vapores sulfurosos y celajes ocres donde vagan sombras diminutas y desamparadas. La vibrante aplicación de óleo y témpera sobre papel anticipa las arquitecturas alucinatorias y opresivas de su novela La otra parte. Una meditación expresionista sobre la decadencia ineluctable de las civilizaciones humanas.",
    description_source: "Síntesis (fundada en curatoría de Christie's)"
  },
  {
    n: 45,
    title: "Das Wesen vom Mars",
    title_es: "El ser de Marte",
    year: "1906",
    school: "Simbolismo / Expresionismo",
    type: "Pastel y gouache sobre cartón",
    holding_museum: "Heidi Horten Collection, Viena",
    museum: "Heidi Horten Collection",
    license: "Con copyright (uso personal)",
    source_url: "https://hortencollection.com/about/provenienzforschung/provenienzforschung-alfred-kubin",
    image_url: "https://img.hortencollection.com/nM4canPgnegWeK3B2PpdX-1pLJo=/1200x630/media/4208/download/K-66.jpg",
    sourceId: "horten:K-66",
    description: "Una extraña entidad híbrida con ojos facetados de insecto, lomo espinado y garras de rapaz acecha agazapada sobre un páramo desértico de tonos verdosos y sepias. Kubin emplea pastel y gouache para plasmar un organismo alienígena capaz de retraer su cabeza en un collar protector blindado. Una de las primeras y más desconcertantes representaciones de la vida extraterrestre en el arte moderno europeo.",
    description_source: "Síntesis (fundada en curatoría de la Heidi Horten Collection)"
  },
  {
    n: 46,
    title: "Epidemie",
    title_es: "La Epidemia",
    year: "1900",
    school: "Simbolismo / Expresionismo",
    type: "Pluma, tinta china y aguada sobre papel catastral",
    holding_museum: "Städtische Galerie im Lenbachhaus, Múnich",
    museum: "Lenbachhaus",
    license: "Con copyright (uso personal)",
    source_url: "https://www.lenbachhaus.de/digital/sammlung-online/detail/epidemie-30032498",
    image_url: "https://www.lenbachhaus.de/fileadmin/user_upload/images/Kub_189%23%23KubinA_ONLINE.jpg",
    sourceId: "lenbachhaus:Kub189",
    description: "Un coloso esquelético y putrefacto se alza como una sombra monumental sobre una ciudad indefensa, cubriéndola con el manto negro del contagio. Mediante la técnica del salpicado y densas aguadas de tinta china, Kubin evoca el pavor ancestral ante las plagas invisibles que arrasan comunidades enteras. El desamparo absoluto de la civilización urbana frente a las fuerzas destructivas de la naturaleza.",
    description_source: "Síntesis (fundada en curatoría del Lenbachhaus)"
  },
  {
    n: 47,
    title: "Authentische Ansicht von Perle (Die andere Seite)",
    title_es: "Vista auténtica de Perla (La otra parte)",
    year: "1909",
    school: "Simbolismo / Expresionismo",
    type: "Pluma y tinta china sobre papel",
    holding_museum: "Städtische Galerie im Lenbachhaus, Múnich",
    museum: "Lenbachhaus",
    license: "Con copyright (uso personal)",
    source_url: "https://www.lenbachhaus.de/digital/sammlung-online/detail/authentische-ansicht-von-perle-der-haupt-und-residenzstadt-des-traumreichs-30031557",
    image_url: "https://www.lenbachhaus.de/fileadmin/user_upload/images/Kub_592_KubinA_ONLINE.jpg",
    sourceId: "lenbachhaus:Kub592",
    description: "Una urbe sombría de muros medievales, chimeneas humeantes y torreones clausurados se recorta bajo un cielo plomizo donde nunca brilla el sol. La ilustración cumbre para su novela La otra parte define la capital del Reino de los Sueños fundada por el misterioso magnate Patera. La atmósfera claustrofóbica y decadente que prefiguró el universo literario de Franz Kafka y el surrealismo europeo.",
    description_source: "Síntesis (fundada en curatoría del Lenbachhaus)"
  },
  {
    n: 48,
    title: "Die Pest",
    title_es: "La Peste",
    year: "1903",
    school: "Simbolismo / Expresionismo",
    type: "Pluma, tinta china y aguada sobre papel",
    holding_museum: "Städtische Galerie im Lenbachhaus, Múnich",
    museum: "Lenbachhaus",
    license: "Con copyright (uso personal)",
    source_url: "https://www.lenbachhaus.de/digital/sammlung-online/detail/die-pest-30032183",
    image_url: "https://www.lenbachhaus.de/fileadmin/user_upload/images/Kub_190_KubinA_scan_A3_ONLINE.jpg",
    sourceId: "lenbachhaus:Kub190",
    description: "Una entidad espectral envuelta en jirones oscuros sobrevuela un poblado mientras las campanas doblan a muerto y las calles quedan desiertas. La densa trama de tinta china y aguada sobre papel catastral genera una vibración opresiva que asfixia el espacio urbano. Una alegoría implacable sobre la muerte masiva y la fragilidad del orden social frente a la infección.",
    description_source: "Síntesis (fundada en curatoría del Lenbachhaus)"
  },
  {
    n: 49,
    title: "Die Angst",
    title_es: "La Angustia (El Miedo)",
    year: "1899",
    school: "Simbolismo / Expresionismo",
    type: "Pluma, tinta china y aguada sobre papel",
    holding_museum: "Städtische Galerie im Lenbachhaus, Múnich",
    museum: "Lenbachhaus",
    license: "Con copyright (uso personal)",
    source_url: "https://www.lenbachhaus.de/digital/sammlung-online/detail/die-angst-30031779",
    image_url: "https://www.lenbachhaus.de/fileadmin/user_upload/images/Kub_211%23%23Kubin_ONLINE.jpg",
    sourceId: "lenbachhaus:Kub211",
    description: "Un rostro gigante con ojos desencajados y expresión desquiciada emerge desde un abismo tenebroso para arrastrar a las figuras humanas hacia el fondo. Creada en su etapa fundacional en Múnich, esta pieza resume el interés de Kubin por el psicoanálisis y las patologías de la mente inconsciente. La encarnación más violenta y desnuda del pánico interior devorando la razón.",
    description_source: "Síntesis (fundada en curatoría del Lenbachhaus)"
  },
  {
    n: 50,
    title: "Walpurgisnacht (Tanz)",
    title_es: "Danza de la noche de Walpurgis",
    year: "1923",
    school: "Simbolismo / Expresionismo",
    type: "Pluma y tinta china sobre papel",
    holding_museum: "Städtische Galerie im Lenbachhaus, Múnich",
    museum: "Lenbachhaus",
    license: "Con copyright (uso personal)",
    source_url: "https://www.lenbachhaus.de/digital/sammlung-online/detail/walpurgisnacht-tanz-30032323",
    image_url: "https://www.lenbachhaus.de/fileadmin/user_upload/images/Kub_392_Kubin_ONLINE.jpg",
    sourceId: "lenbachhaus:Kub392",
    description: "Siluetas grotescas de brujas, demonios y sátiros ejecutan una danza desenfrenada alrededor de una hoguera mágica en la cima de una colina sombría. Inspirándose en las escenas del Fausto de Goethe, Kubin despliega un dinamismo febril donde los cuerpos se deforman en espirales de embriaguez mística. El aquelarre pagano como celebración de los instintos primordiales liberados de toda censura moral.",
    description_source: "Síntesis (fundada en curatoría del Lenbachhaus)"
  },
  {
    n: 51,
    title: "Das Geisterpferd (Die andere Seite)",
    title_es: "El caballo fantasma (La otra parte)",
    year: "1909",
    school: "Simbolismo / Expresionismo",
    type: "Pluma y tinta china sobre papel",
    holding_museum: "Städtische Galerie im Lenbachhaus, Múnich",
    museum: "Lenbachhaus",
    license: "Con copyright (uso personal)",
    source_url: "https://www.lenbachhaus.de/digital/sammlung-online/detail/das-geisterpferd-illustration-zu-die-andere-seite-30031566",
    image_url: "https://www.lenbachhaus.de/fileadmin/user_upload/images/Kub_349%23%23KubinA_ONLINE.jpg",
    sourceId: "lenbachhaus:Kub349",
    description: "Un corcel espectral con crin erizada y mirada de fuego irrumpe en galope frenético por las calles empedradas de la ciudad de Perla. La lámina original para la novela La otra parte anuncia la inminente catástrofe que arrasará el reino onírico cuando la ilusión colectiva comience a desmoronarse. El presagio fantástico de la ruina apocalíptica anunciada por una fuerza indomable.",
    description_source: "Síntesis (fundada en curatoría del Lenbachhaus)"
  },
  {
    n: 52,
    title: "Die Todesstunde",
    title_es: "La hora de la muerte",
    year: "1900",
    school: "Simbolismo / Expresionismo",
    type: "Pluma, tinta china y aguada sobre papel",
    holding_museum: "Städtische Galerie im Lenbachhaus, Múnich",
    museum: "Lenbachhaus",
    license: "Con copyright (uso personal)",
    source_url: "https://www.lenbachhaus.de/digital/sammlung-online/detail/die-todesstunde-30032289",
    image_url: "https://www.lenbachhaus.de/fileadmin/user_upload/images/Kub_185_KubinA_ONLINE.jpg",
    sourceId: "lenbachhaus:Kub185",
    description: "En el interior de un aposento en penumbra, una presencia esquelética e inexorable se inclina sobre el lecho de un moribundo señalando el fin de su tiempo terrenal. Los contrastes severos entre la luz mortecina y los negros profundos de la tinta china intensifican la soledad del instante final. La tradición del memento mori centroeuropeo reinterpretada bajo la lente del expresionismo moderno.",
    description_source: "Síntesis (fundada en curatoría del Lenbachhaus)"
  },
  {
    n: 53,
    title: "Die Dame auf dem Pferd",
    title_es: "La dama sobre el caballo",
    year: "1900",
    school: "Simbolismo / Expresionismo",
    type: "Pluma, tinta china y aguada sobre papel",
    holding_museum: "Städtische Galerie im Lenbachhaus, Múnich",
    museum: "Lenbachhaus",
    license: "Con copyright (uso personal)",
    source_url: "https://www.lenbachhaus.de/digital/sammlung-online/detail/die-dame-auf-dem-pferd-30031732",
    image_url: "https://www.lenbachhaus.de/fileadmin/user_upload/images/Kub_422%23%23KubinA_ONLINE.jpg",
    sourceId: "lenbachhaus:Kub422",
    description: "Una amazona de porte hierático y velo misterioso cabalga sobre un corcel negro que se funde con la oscuridad de un paisaje desolado. Kubin explora el arquetipo de la mujer fatal del simbolismo finisecular, fundiendo sensualidad aristocrática con una amenaza siniestra e insondable. La marcha solitaria de la belleza vinculada irremediablemente a la destrucción.",
    description_source: "Síntesis (fundada en curatoría del Lenbachhaus)"
  },
  {
    n: 54,
    title: "Geisternacht",
    title_es: "Noche de fantasmas",
    year: "1898",
    school: "Simbolismo / Expresionismo",
    type: "Tinta china y aguada sobre papel",
    holding_museum: "Städtische Galerie im Lenbachhaus, Múnich",
    museum: "Lenbachhaus",
    license: "Con copyright (uso personal)",
    source_url: "https://www.lenbachhaus.de/digital/sammlung-online/detail/geisternacht-30032557",
    image_url: "https://www.lenbachhaus.de/fileadmin/user_upload/images/Kub_586%23%23KubinA_ONLINE.jpg",
    sourceId: "lenbachhaus:Kub586",
    description: "Apariciones etéreas y formas flotantes recorren un cementerio envuelto en neblinas nocturnas mientras la luna llena ilumina las lápidas agrietadas. Es una de las creaciones más tempranas conservadas de Kubin, donde ya se manifiesta su fascinación por los relatos góticos y la permeabilidad entre el mundo de los vivos y el de los muertos. La evocación lírica y estremecedora del más allá.",
    description_source: "Síntesis (fundada en curatoría del Lenbachhaus)"
  },
  {
    n: 55,
    title: "Nachtstück",
    title_es: "Nocturno",
    year: "1899",
    school: "Simbolismo / Expresionismo",
    type: "Aguada y tinta china sobre papel",
    holding_museum: "Städtische Galerie im Lenbachhaus, Múnich",
    museum: "Lenbachhaus",
    license: "Con copyright (uso personal)",
    source_url: "https://www.lenbachhaus.de/digital/sammlung-online/detail/nachtstueck-30032165",
    image_url: "https://www.lenbachhaus.de/fileadmin/user_upload/images/Kub_315_KubinA_ONLINE.jpg",
    sourceId: "lenbachhaus:Kub315",
    description: "Un paisaje lacustre sumido en sombras profundas refleja los últimos destellos crepusculares mientras siluetas enigmáticas observan desde la orilla. Kubin modula las gradaciones de la aguada para crear un espacio de contemplación melancólica cargado de tensión psicológica. La quietud engañosa de la naturaleza que oculta terrores latentes en la penumbra.",
    description_source: "Síntesis (fundada en curatoría del Lenbachhaus)"
  },
  {
    n: 56,
    title: "Das Ende des Krieges",
    title_es: "El fin de la guerra",
    year: "1920",
    school: "Simbolismo / Expresionismo",
    type: "Pluma y tinta china sobre papel",
    holding_museum: "Städtische Galerie im Lenbachhaus, Múnich",
    museum: "Lenbachhaus",
    license: "Con copyright (uso personal)",
    source_url: "https://www.lenbachhaus.de/digital/sammlung-online/detail/das-ende-des-krieges-30032492",
    image_url: "https://www.lenbachhaus.de/fileadmin/user_upload/images/Kub_367%23%23KubinA_ONLINE.jpg",
    sourceId: "lenbachhaus:Kub367",
    description: "Un soldado desharrapado contempla un horizonte de trincheras arrasadas, cruces de madera improvisadas y árboles desmochados por el fuego de artillería. Tras el colapso del Imperio Austrohúngaro y la devastación de la Primera Guerra Mundial, Kubin registró el amargo despertar de una Europa en ruinas morales y materiales. El testimonio desolador de la tragedia bélica despojada de cualquier épica triunfalista.",
    description_source: "Síntesis (fundada en curatoría del Lenbachhaus)"
  }
];

function sanitize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

async function run() {
  console.log(`=== HARVEST 20_alfred_kubin (15 Obras Canónicas Maestras) ===`);
  const idx = await loadIndex(colDir);

  const descPath = path.join(ROOT, 'tools', 'desc', `${COL}.mjs`);
  let descContent = fs.existsSync(descPath) ? fs.readFileSync(descPath, 'utf8') : 'export default [];\n';

  for (const t of CANONICAL_TARGETS) {
    console.log(`\n--- [n=${t.n}] ${t.title_es} (${t.title}, ${t.year}) ---`);
    console.log(`  Descargando desde: ${t.image_url}`);

    const r = await fetch(t.image_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!r.ok) {
      throw new Error(`HTTP ${r.status} al descargar ${t.image_url}`);
    }

    const buf = Buffer.from(await r.arrayBuffer());
    if (!looksLikeImage(buf)) {
      throw new Error(`El buffer no parece imagen válida para ${t.title_es}`);
    }

    const meta = await sharp(buf).metadata();
    const w = meta.width;
    const h = meta.height;
    const format = meta.format === 'jpeg' ? 'jpg' : meta.format;
    const longSide = Math.max(w, h);
    console.log(`  Medidas en disco: ${w}x${h} (${format}) · ${buf.length} bytes`);

    if (longSide < 1000) {
      throw new Error(`Falla de resolución: ${longSide} < 1000 px para ${t.title_es}`);
    }

    const orientation = w >= h ? 'landscape' : 'portrait';
    const slugTitle = sanitize(t.title_es);
    const slugArtist = sanitize(t.artist || 'Alfred_Kubin');
    const filename = `${t.n}_${slugTitle}_${slugArtist}_${t.year}.${format}`;

    const destDir = path.join(colDir, orientation);
    fs.mkdirSync(destDir, { recursive: true });
    const destPath = path.join(destDir, filename);

    fs.writeFileSync(destPath, buf);
    console.log(`  Guardado en: ${orientation}/${filename}`);

    // Crear item para _index.json
    const item = {
      n: t.n,
      file: filename,
      orientation,
      title: t.title,
      title_es: t.title_es,
      artist: "Alfred Kubin",
      year: t.year,
      school: t.school,
      type: t.type,
      holding_museum: t.holding_museum,
      museum_confidence: "fuente",
      museum: t.museum,
      license: t.license,
      source_url: t.source_url,
      image_url: t.image_url,
      width: w,
      height: h,
      bytes: buf.length,
      sourceId: t.sourceId,
      kind: "named",
      description: t.description,
      description_source: t.description_source
    };

    // Eliminar si ya existía ese n
    idx.items = idx.items.filter(x => x.n !== t.n);
    idx.items.push(item);

    // Preparar ficha en tools/desc/20_alfred_kubin.mjs
    const descEntry = `  {
    n: ${t.n},
    title_es: ${JSON.stringify(t.title_es)},
    description: ${JSON.stringify(t.description)},
    description_source: ${JSON.stringify(t.description_source)}
  }`;

    // Si ya existe la ficha con ese n en el archivo de descripciones, reemplazarla; si no, agregarla
    const regex = new RegExp(`  \\{\\s*"?n"?:\\s*${t.n},[\\s\\S]*?\\n  \\},?`, 'm');
    if (regex.test(descContent)) {
      descContent = descContent.replace(regex, descEntry + ',');
    } else {
      descContent = descContent.replace(/\];\s*$/, `${descEntry},\n];\n`);
    }
  }

  // Ordenar items por n
  idx.items.sort((a, b) => a.n - b.n);
  await saveIndex(colDir, idx);
  console.log(`\n_index.json guardado con éxito. Total obras: ${idx.items.length}`);

  fs.writeFileSync(descPath, descContent);
  console.log(`tools/desc/${COL}.mjs sincronizado con éxito.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch(err => {
    console.error('\nERROR:', err);
    process.exit(1);
  });
}
