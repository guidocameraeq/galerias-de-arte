import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const LEWANDOWSKI_TARGETS = [
  {
    n: 1,
    title_es: "Esencia de la libertad (Mirror Reaper)",
    title: "Esencja wolności",
    year: "2017",
    holding_museum: "Colección privada / Bell Witch",
    slug: "esencia_de_la_libertad",
    url: "https://lewandowski.art/userdata/public/assets//essence_of_freedom_showitem.jpg",
    desc: "Una figura colosal y encapuchada sostiene en alto un gigantesco portal dorado y luminoso sobre la inmensidad del océano nocturno. Una multitud de siluetas humanas y una entidad cadavérica con guadaña avanzan hacia el umbral, mientras una bandada de aves asciende hacia la luz lunar. La composición simboliza el tránsito existencial del alma hacia lo desconocido, donde la muerte actúa como guardiana y el umbral promete una liberación cósmica."
  },
  {
    n: 2,
    title_es: "Encuentro en el otro lado",
    title: "Na spotkanie po tamtej stronie",
    year: "2015",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "encuentro_en_el_otro_lado",
    url: "https://lewandowski.art/environment/cache/images/productGfx_876_0_0/NA-SPOTKANIE-PO-TAMTEJ-STRONIE-70x70-olej-na-p%EF%BF%BD%2Cotniebawe%EF%BF%BD%2Cna-2015r..jpg",
    desc: "Un ser titánico de ropajes oscuros y rostro velado emerge entre nubes carmesíes y rocas milenarias frente a diminutos viajeros que caminan sobre una pasarela. Un abismo de niebla dorada separa ambos extremos mientras astros silenciosos resplandecen en el cenit del firmamento. Alude a la comunión inevitable entre la fragilidad humana y las fuerzas eternas del más allá, planteando el umbral cósmico como un destino de recogimiento y reverencia."
  },
  {
    n: 3,
    title_es: "Amnesia",
    title: "Amnezja",
    year: "2020",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "amnesia",
    url: "https://lewandowski.art/environment/cache/images/productGfx_875_0_0/AMNEZJA-100x80cm-olej-na-plotnie-2020r.jpg",
    desc: "Un busto pétreo y gigantesco de rasgos borrados reposa semioculto tras murallones ciclópeos y andamios que se desmoronan en el vacío. En el fondo, un cielo incendiado por destellos dorados y cenizas ilumina la desolación de una civilización olvidada. Representa la erosión implacable de la memoria histórica y la identidad individual frente al avance silencioso de las eras geológicas y el olvido."
  },
  {
    n: 4,
    title_es: "La gran batalla medieval (Grunwald)",
    title: "Największa bitwa średniowiecznej Europy",
    year: "2021",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "gran_batalla_medieval",
    url: "https://lewandowski.art/environment/cache/images/productGfx_874_0_0/NBSE-150x100cm-olej-na-plotnie-2021r-Sredni.jpg",
    desc: "Una llanura infinita cubierta por una marea de combatientes, lanzas y estandartes se extiende bajo un cielo crepuscular hendido por una espada celestial fulgurante. Las siluetas de caballeros y caballos se desdibujan entre nubes de polvo y estelas de fuego que consumen el horizonte. Reinterpreta el choque histórico de Grunwald como un cataclismo místico donde el destino de los pueblos es juzgado por fuerzas metafísicas superiores."
  },
  {
    n: 5,
    title_es: "El fuego que nunca se apaga",
    title: "Ogień, który nigdy nie gaśnie",
    year: "c. 2018",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "fuego_que_nunca_se_apaga",
    url: "https://lewandowski.art/environment/cache/images/productGfx_1192_0_0/ogien_ktory_nigdy_nie_gasnie_120x60.jpg",
    desc: "Un río de fuego incandescente serpentea entre monolitos ciclópeos y acantilados escarpados bajo una bóveda celeste dominada por una luna espectral. A lo largo de la ribera volcánica, figuras solitarias caminan en procesión guiadas por el reflejo de la llamarada perpetua. Evoca la persistencia irreductible de la conciencia y la esperanza humana ante la noche interminable del cosmos."
  },
  {
    n: 6,
    title_es: "Acto de humildad (Stygian)",
    title: "Akt pokory",
    year: "c. 2019",
    holding_museum: "Colección privada / Atramentus",
    slug: "acto_de_humildad",
    url: "https://lewandowski.art/environment/cache/images/productGfx_599_0_0/akt_pokory_120x60_online.jpg",
    desc: "Un coloso encorvado de espaldas al espectador se postra de rodillas ante un resplandor místico que brota de una profunda fosa en el desierto. Diminutas siluetas contemplan la escena desde riscos lejanos mientras un vórtice de nubes ambarinas envuelve el cielo. Simboliza el reconocimiento de la pequeñez humana y la reverencia obligada ante los misterios insondables del universo."
  },
  {
    n: 7,
    title_es: "La pregunta eterna",
    title: "Odwieczne pytanie",
    year: "c. 2018",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "la_pregunta_eterna",
    url: "https://lewandowski.art/environment/cache/images/productGfx_528_0_0/ODWIECZNE_PYTANIE_120x60_obraz_olejny_mariusz_lewandowski_online.jpg",
    desc: "Dos monolitos ciclópeos de piedra negra flanquean un estrecho cañón marino hacia donde rema una solitaria embarcación bajo un orbe solar envuelto en bruma. El reflejo del sol dibuja un sendero dorado sobre las aguas tranquilas, invitando al navegante a internarse en lo desconocido. Plasma la eterna interrogación metafísica sobre el origen y el destino del ser humano en su periplo por la existencia."
  },
  {
    n: 8,
    title_es: "El convoy de la muerte",
    title: "Konwój śmierci",
    year: "2021",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "convoy_de_la_muerte",
    url: "https://lewandowski.art/environment/cache/images/productGfx_712_0_0/KONWOJ-SMIERCI-100x150cm-olej-na-plotnie-2021r_mariusz_lewandowski_wizualizacja.jpg",
    desc: "Una comitiva fantasmal de carretas, figuras encapuchadas y estandartes fúnebres avanza lentamente a través de un valle de ceniza bajo un cielo teñido de sangre. Monolitos de geometría imposible vigilan el paso de la caravana como centinelas de una era extinguida. Constituye una elegía visual sobre la transitoriedad de la vida terrenal y la marcha inexorable de la humanidad hacia el descanso final."
  },
  {
    n: 9,
    title_es: "Noche fría",
    title: "Nocny chłód",
    year: "2017",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "noche_fria",
    url: "https://lewandowski.art/environment/cache/images/productGfx_949_0_0/NOCNY-CHLOD-40x50-olej-na-plotnie-2017r..jpg",
    desc: "Una solitaria torre gótica se alza en la cumbre de un promontorio nevado rodeado por un mar de hielo bajo una luna ártica que baña el paisaje de azul cobalto. Una pequeña lumbre dorada titila en una de las aspilleras superiores, único indicio de calor en medio de la desolación polar. Expresa el aislamiento del espíritu humano y la búsqueda de refugio interior ante la frialdad implacable del entorno."
  },
  {
    n: 10,
    title_es: "Encantado en la piedra",
    title: "Zaklęte w kamieniu",
    year: "c. 2018",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "encantado_en_la_piedra",
    url: "https://lewandowski.art/environment/cache/images/productGfx_655_0_0/mariusz_lewandowski_obraz_olejny_zaklete_w_kamieniu_70x80.jpg",
    desc: "Una efigie pétrea de proporciones titánicas parece esculpida de manera natural en los acantilados que se precipitan hacia un océano borrascoso. Sobre la frente del gigante rocoso descansa una solitaria edificación medieval acariciada por los últimos rayos del ocaso. Representa la memoria ancestral impregnada en la corteza terrestre, donde el pensamiento y la geología se fusionan en un silencio perenne."
  },
  {
    n: 11,
    title_es: "Los amos de la conciencia",
    title: "Władcy sumień",
    year: "c. 2019",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "amos_de_la_conciencia",
    url: "https://lewandowski.art/environment/cache/images/productGfx_552_0_0/WLADCY_SUMIEN_80x100_obraz_olejny_mariusz_lewandowski_online.jpg",
    desc: "Tres siluetas ciclópeas ataviadas con túnicas sacerdotales de piedra dominan una llanura estéril desde alturas sobrehumanas, proyectando sombras infinitas sobre el suelo. A sus pies, un río de almas diminutas deambula en busca de redención bajo un cielo ocre saturado de niebla. Es una crítica metafísica a los dogmas absolutos y al control moral que las estructuras de poder ejercen sobre el alma humana."
  },
  {
    n: 12,
    title_es: "Nocturno",
    title: "Nokturn",
    year: "2015",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "nocturno",
    url: "https://lewandowski.art/environment/cache/images/productGfx_639_0_0/NOKTURN-60x70%2C-2015.jpg",
    desc: "Una barca solitaria navega por aguas calmas de tono esmeralda hacia un portal en ruinas tallado en la roca viva, bañado por el resplandor de un plenilunio dorado. En las cornisas superiores se divisan arcos derruidos y columnas que parecen respirar el aire de la noche. Transmite una atmósfera de serenidad contemplativa y misterio poético ante el silencio absoluto de la naturaleza nocturna."
  },
  {
    n: 13,
    title_es: "La cruzada: el último paso",
    title: "Krucjata – Ostatni krok",
    year: "c. 2020",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "cruzada_ultimo_paso",
    url: "https://lewandowski.art/environment/cache/images/productGfx_555_0_0/KRUCJATA_OSTATNI_KROK_100x80_obraz_olejny_mariusz_lewandowski_online.jpg",
    desc: "Un guerrero solitario con armadura medieval y capa raída se detiene al borde de un abismo que da paso a una ciudadela colosal suspendida en la niebla. El sendero de roca por el que ha marchado se interrumpe abruptamente sobre un vacío teñido de violeta y oro. Representa la culminación de toda búsqueda heroica o espiritual, donde la fe exige un acto final de entrega ante lo inconmensurable."
  },
  {
    n: 14,
    title_es: "Los esplendores de la Santa Inquisición",
    title: "Blaski Świętej Inkwizycji",
    year: "2015",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "esplendores_de_la_inquisicion",
    url: "https://lewandowski.art/environment/cache/images/productGfx_641_0_0/BLASKI-SWIETEJ-INKWIZYCJI-120x80-olej-na-plotnie100-bawelna-2015r..jpg",
    desc: "Una catedral monumental con arbotantes y agujas infinitas se alza en medio de un mar tempestuoso mientras llamas voraces brotan de sus ventanales principales. En primer plano, escombros calcinados y siluetas desoladas contemplan la hoguera sagrada bajo una noche de tormenta. Funciona como una feroz metáfora sobre el fanatismo religioso y la autodestrucción de las instituciones que sacrifican la compasión en nombre de la pureza."
  },
  {
    n: 15,
    title_es: "Aniquilación",
    title: "Anihilacja",
    year: "c. 2019",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "aniquilacion",
    url: "https://lewandowski.art/environment/cache/images/productGfx_514_0_0/ANIHILACJA_50x40_obraz_olejny_mariusz_lewandowski_online.jpg",
    desc: "Un orbe solar de brillo cegador colapsa en el centro del horizonte, desintegrando cordilleras montañosas y estructuras arquitectónicas en una lluvia de esquirlas ardientes. Ondas de choque luminosas barren el páramo mientras el cielo se desgarra en tonalidades de azufre y carmín. Simboliza el fin de un ciclo cósmico y la inevitable disolución de la materia frente a la potencia creadora y destructora del universo."
  },
  {
    n: 16,
    title_es: "El despertar",
    title: "Przebudzenie",
    year: "c. 2018",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "el_despertar",
    url: "https://lewandowski.art/environment/cache/images/productGfx_548_0_0/PRZEBUDZENIE_50x70_obraz_olejny_mariusz_lewandowski_online.jpg",
    desc: "Una figura antropomorfa colosal despierta de un sueño milenario, incorporándose lentamente de la entraña de una montaña rocosa bajo un cielo dorado. Cascadas de polvo y escombros caen de sus hombros mientras la luz del amanecer delinea su rostro severo. Es una alegoría del despertar de la conciencia primigenia y el renacimiento espiritual que quiebra la inercia del tiempo."
  },
  {
    n: 17,
    title_es: "Los límites de la percepción",
    title: "Granice percepcji",
    year: "c. 2019",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "limites_de_la_percepcion",
    url: "https://lewandowski.art/environment/cache/images/productGfx_521_0_0/GRANICE_PERCEPCJI_70x50_obraz_olejny_mariusz_lewandowski_online.jpg",
    desc: "Una pasarela de piedra suspendida en el aire conduce hacia una grieta dimensional que desgarra la bóveda celeste, revelando un cosmos de infinitas estrellas y nebulosas. Siluetas humanas contemplan el umbral con temor y asombro desde el borde del abismo terrenal. Plantea el desafío de trascender los límites sensoriales e intelectuales para vislumbrar la realidad trascendente que yace oculta tras las apariencias."
  },
  {
    n: 18,
    title_es: "Danza de la muerte",
    title: "Taniec śmierci",
    year: "c. 2017",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "danza_de_la_muerte",
    url: "https://lewandowski.art/environment/cache/images/productGfx_1049_0_0/dance_of_death_visualisation_1.jpg",
    desc: "Una figura cadavérica provista de ropajes raídos y guadaña ejecuta un movimiento grácil en medio de un páramo sombrío flanqueado por cipreses espectrales. En el horizonte, una luna baja y cenicienta proyecta un resplandor fantasmal sobre los restos de una antigua civilización. Reinterpreta el motivo renacentista de la danza macabra como un rito cósmico sereno y despojado de dramatismo moralizante."
  },
  {
    n: 19,
    title_es: "Santuario oscuro",
    title: "Mroczne sanktuarium",
    year: "c. 2018",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "santuario_oscuro",
    url: "https://lewandowski.art/environment/cache/images/productGfx_531_0_0/MROCZNE_SANKTUARIUM_30x40_obraz_olejny_mariusz_lewandowski_online.jpg",
    desc: "Un templo excavado directamente en el interior de una colosal gruta volcánica resplandece débilmente con la luz de cirios rituales y brasas subterráneas. Siluetas encapuchadas ascienden por una escalinata escarpada hacia el altar mayor rodeado de estalactitas góticas. Representa el refugio de los saberes arcanos y la comunión espiritual en los rincones más profundos y recónditos de la psique humana."
  },
  {
    n: 20,
    title_es: "El demiurgo",
    title: "Demiurg",
    year: "2016",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "el_demiurgo",
    url: "https://lewandowski.art/environment/cache/images/productGfx_1067_0_0/demiurg_etsy.jpg",
    desc: "Una deidad colosal de materia terrosa y ojos ígneos modela esferas planetarias y masas de luz entre sus dedos titánicos sobre un abismo estelar. La energía creadora emana de su pecho en filamentos dorados que iluminan el caos primigenio del universo en formación. Alude al mito platónico y gnóstico del creador del mundo material, artífice solitario atrapado en su propia obra monumental."
  },
  {
    n: 21,
    title_es: "Isla desierta",
    title: "Wyspa bezludna",
    year: "2021",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "isla_desierta",
    url: "https://lewandowski.art/environment/cache/images/productGfx_749_0_0/WYSPA-BEZLUDNA-40x50cm-olej-na-plotnie-2021r_Mariusz_Lewandowski_online.jpg",
    desc: "Un peñasco solitario coronado por una única estructura en ruinas emerge de un océano inmóvil teñido de tonos violáceos bajo un crepúsculo eterno. La bruma marina envuelve la base de la roca mientras aves marinas sobrevuelan el almenar en círculos concéntricos. Es una metáfora sobre la soledad existencial y la belleza melancólica del retiro absoluto del bullicio del mundo."
  },
  {
    n: 22,
    title_es: "No temas al destino",
    title: "Nie bój się fatum",
    year: "2022",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "no_temas_al_destino",
    url: "https://lewandowski.art/environment/cache/images/productGfx_972_0_0/mariusz_lewandowski_nie_boj_sie_fatum_2022_140x80.jpg",
    desc: "Una presencia monumental con máscara espectral extiende una mano protectora hacia una figura solitaria que camina por un desierto de dunas rojizas. Un orbe celeste incandescente desciende en el horizonte, bañando el encuentro con una luz dorada y reconfortante. Transmite un mensaje estoico de serenidad ante lo ineludible, transformando el concepto de fatalidad en una guía compasiva."
  },
  {
    n: 23,
    title_es: "El fin del camino",
    title: "Wędrówki kres",
    year: "c. 2019",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "el_fin_del_camino",
    url: "https://lewandowski.art/environment/cache/images/productGfx_481_0_0/WEDROWKI_KRES_70x90_obraz_olejny_mariusz_lewandowski_online.jpg",
    desc: "Un peregrino solitario apoyado en su cayado contempla un portal ciclópeo que se abre hacia una planicie luminosa tras cruzar un desfiladero tormentoso. Los riscos sombríos van cediendo paso a una claridad celestial que acaricia las huellas de su largo recorrido. Evoca el término del viaje vital y la llegada al remanso pacífico que aguarda tras una existencia colmada de esfuerzos."
  },
  {
    n: 24,
    title_es: "El caminante eterno",
    title: "Wieczna tułaczka",
    year: "2021",
    holding_museum: "Colección de la familia Lewandowski",
    slug: "el_caminante_eterno",
    url: "https://lewandowski.art/environment/cache/images/productGfx_640_0_0/Wieczna-tulaczka-30x40-2021.jpg",
    desc: "Una silueta enigmática con túnica andrajosa camina con paso constante sobre una loma que domina un valle sumido en una densa bruma espectral. A lo lejos, torres góticas y agujas de piedra despuntan como espejismos bajo un cielo cargado de presagios. Simboliza la condición errante de la humanidad, condenada a una búsqueda perpetua de sentido a través de paisajes en constante transformación."
  },
  {
    n: 25,
    title_es: "Dualidad existencial (Mordrake)",
    title: "Dwoistość egzystencjalna",
    year: "c. 2020",
    holding_museum: "Colección privada / Xenobiotic",
    slug: "dualidad_existencial",
    url: "https://lewandowski.art/environment/cache/images/productGfx_557_0_0/xenobiotic-art-album.jpg",
    desc: "Dos rostros gigantescos y enfrentados se funden en una sola estructura escultórica de piedra y raíces sobre un terreno quebrado por grietas de magma. De una de las miradas brota un hilo de agua cristalina, mientras de la otra ascienden columnas de humo negro hacia un cielo tormentoso. Explora la coexistencia irreconciliable y a la vez inseparable entre la creación y la destrucción en la naturaleza humana."
  }
];

export async function run() {
  const isApply = process.argv.includes('--apply');
  const colDir = '23_mariusz_lewandowski';

  console.log(`\n============================================================`);
  console.log(`HARVESTER: 23_mariusz_lewandowski (${isApply ? 'APPLY' : 'DRY RUN'})`);
  console.log(`Total canonical targets: ${LEWANDOWSKI_TARGETS.length}`);
  console.log(`============================================================\n`);

  if (!isApply) {
    console.log(`Modo DRY RUN: no se descargan archivos ni se modifica el disco.`);
    console.log(`Ejecutá con '--apply' para descargar y generar la colección.\n`);
    LEWANDOWSKI_TARGETS.forEach(t => {
      console.log(`[#${t.n.toString().padStart(2, '0')}] ${t.title_es}`);
      console.log(`     Título orig.: ${t.title} (${t.year})`);
      console.log(`     Museo/Col.:   ${t.holding_museum}`);
      console.log(`     URL:          ${t.url}`);
      console.log(`     Ficha:        ${t.desc.slice(0, 100)}...`);
    });
    return;
  }

  // Ensure directories
  fs.mkdirSync(path.join(colDir, 'landscape'), { recursive: true });
  fs.mkdirSync(path.join(colDir, 'portrait'), { recursive: true });

  const items = [];

  for (const t of LEWANDOWSKI_TARGETS) {
    const numStr = t.n.toString().padStart(2, '0');
    console.log(`[${numStr}/25] Descargando "${t.title_es}"...`);

    const res = await fetch(t.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (res.status !== 200) {
      throw new Error(`Fallo descarga de #${t.n} (${res.status}): ${t.url}`);
    }

    const buf = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(buf).metadata();
    const w = meta.width;
    const h = meta.height;
    const orientation = w >= h ? 'landscape' : 'portrait';
    const filename = `${numStr}_lewandowski_${t.slug}.jpg`;
    const destPath = path.join(colDir, orientation, filename);

    fs.writeFileSync(destPath, buf);

    items.push({
      n: t.n,
      title: t.title,
      title_es: t.title_es,
      artist: "Mariusz Lewandowski",
      year: t.year,
      holding_museum: t.holding_museum,
      file: filename,
      width: w,
      height: h,
      orientation: orientation,
      description: t.desc,
      description_source: "Estate of Mariusz Lewandowski / Catálogo oficial",
      license: "Uso personal",
      school: "Surrealismo polaco contemporáneo",
      type: "Pintura al óleo sobre lienzo"
    });

    console.log(`  -> Guardado ${orientation}/${filename} (${w}x${h}) [${Math.round(buf.length/1024)} KB]`);
  }

  // Save index
  const indexData = {
    collection: colDir,
    items: items
  };
  fs.writeFileSync(path.join(colDir, '_index.json'), JSON.stringify(indexData, null, 2));
  console.log(`\nCreado exitosamente ${colDir}/_index.json con ${items.length} obras!`);

  // Create tools/desc/23_mariusz_lewandowski.mjs
  const descEntries = items.map(it => ({
    n: it.n,
    titulo: it.title_es,
    anio: it.year,
    museo: it.holding_museum,
    escuela: it.school,
    tipo: it.type,
    d: it.description
  }));

  const descContent = `// Fichas autoradas — 23_mariusz_lewandowski
// Sintetizadas de fuentes curatoriales oficiales del Estate of Mariusz Lewandowski
export default ${JSON.stringify(descEntries, null, 2)};
`;
  fs.writeFileSync('tools/desc/23_mariusz_lewandowski.mjs', descContent);
  console.log('Guardado tools/desc/23_mariusz_lewandowski.mjs');
}

if (process.argv[1] && process.argv[1].endsWith('harvest-23-lewandowski.mjs')) {
  run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}
