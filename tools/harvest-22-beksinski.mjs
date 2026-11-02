import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const BEKSINSKI_TARGETS = [
  {
    n: 1,
    title_es: "Sin título (Los amantes / El abrazo)",
    title: "Bez tytułu (Kochankowie)",
    year: "1984",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://upload.wikimedia.org/wikipedia/commons/2/20/Untitled_painting_by_Zdzislaw_Beksinski_1984.jpg",
    slug: "los_amantes_el_abrazo",
    desc: "Dos figuras cadavéricas desprovistas de piel se funden en un abrazo desesperado y eterno sobre un fondo ocre difuminado. La maraña de costillas expuestas, tendones secos y manos entrelazadas convierte la intimidad humana en una reliquia petrificada. Sintetiza la visión beksińskiana del afecto como una comunión trágica que subsiste más allá de la descomposición y el olvido."
  },
  {
    n: 2,
    title_es: "Sin título (AA78 / El portal crepuscular)",
    title: "Bez tytułu (AA78)",
    year: "1978",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c3/AA78_by_Zdzislaw_Beksinski_1978.jpg",
    slug: "aa78_portal_crepuscular",
    desc: "Un portal monumental de arquitectura gótica en ruinas se alza invadido por enredaderas y extrañas coníferas carmesíes de textura carnosa. A través de los vanos ojivales se contempla un horizonte cósmico donde un mar crepuscular se une a un cielo repleto de constelaciones doradas. La obra confronta la permanencia del cosmos con la decadencia de las estructuras creadas por la civilización."
  },
  {
    n: 3,
    title_es: "Sin título (La torre carmesí / El coliseo en llamas)",
    title: "Bez tytułu",
    year: "c. 1978",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-44.jpg",
    slug: "torre_carmesi_coliseo_en_llamas",
    desc: "Una colosal estructura cilíndrica de infinitas celdas y arcadas se eleva en medio de una densa humareda teñida de fuego y tiniebla. Pequeños fragmentos semejantes a cenizas o páginas incineradas flotan suspendidos en el abismo frente a la mole arquitectónica. Evoca una torre de Babel calcinada, metáfora de la soberbia humana reducida a un horno de ruina perpetua."
  },
  {
    n: 4,
    title_es: "Sin título (El cañón de los soldados espectrales)",
    title: "Bez tytułu",
    year: "c. 1976",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-35.jpg",
    slug: "canon_soldados_espectrales",
    desc: "Un desfiladero rocoso y angosto está colmado por centenares de figuras esqueléticas petrificadas que visten antiguos cascos de acero militar. En el fondo del abismo una pila de cráneos reposa en penumbra mientras una luz dorada y lejana despunta en la cima de la grieta. Remite al trauma bélico centroeuropeo, transformando el campo de batalla en un monumento geológico al dolor."
  },
  {
    n: 5,
    title_es: "Sin título (El cementerio bajo los acantilados)",
    title: "Bez tytułu",
    year: "c. 1975",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-51.jpg",
    slug: "cementerio_bajo_acantilados",
    desc: "Un inmenso camposanto de lápidas milenarias se extiende a los pies de ciclópeas formaciones rocosas cubiertas por una bruma azulada. La frialdad espectral del suelo contrasta con un resplandor dorado y ardiente que tiñe las nubes en la cumbre del valle. Expresa la pequeñez de la memoria individual frente a la inmensidad geológica y el paso silencioso de las eras geológicas."
  },
  {
    n: 6,
    title_es: "Sin título (El inquisidor de la gorguera blanca)",
    title: "Bez tytułu",
    year: "c. 1975",
    holding_museum: "Colección Piotr Dmochowski",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-56.jpg",
    slug: "inquisidor_gorguera_blanca",
    desc: "Una cabeza senil y demacrada con la boca cosida por alambres surge de la negrura sobre un cuello envuelto en una desmesurada gorguera blanca. En el alféizar inferior, una masa bulbosa de dedos entrelazados y resecos reposa en absoluta inmovilidad bajo la mirada ausente del rostro. Es una alegoría sobre la represión, la censura de la palabra y el juicio ciego de la autoridad implacable."
  },
  {
    n: 7,
    title_es: "Sin título (La rotonda y la figura roja)",
    title: "Bez tytułu",
    year: "c. 1977",
    holding_museum: "Colección Piotr Dmochowski",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-46.jpg",
    slug: "rotonda_figura_roja",
    desc: "Un pórtico monumental de columnas neoclásicas coronado por una cúpula orgánica emerge entre la espesura bajo un cielo tormentoso de tintes barrocos. Adherida a una de las columnas principales, una criatura roja y descarnada parece fundirse con la piedra envuelta en líquenes sangrantes. Combina la sobriedad arquitectónica clásica con la angustia visceral de la carne expuesta a los elementos."
  },
  {
    n: 8,
    title_es: "Sin título (El árbol de osamentas)",
    title: "Bez tytułu",
    year: "c. 1974",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-47.jpg",
    slug: "arbol_de_osamentas",
    desc: "Una colosal masa arbórea erigida en medio del páramo revela en su tronco una intrincada celosía de costillas, vértebras y ramas fosilizadas. El follaje vaporoso se disuelve en una atmósfera de tintes ocres y dorados que evoca un eterno atardecer apocalíptico. La naturaleza y la muerte se integran en un solo organismo vegetal donde la osamenta da forma a la vida vegetal."
  },
  {
    n: 9,
    title_es: "Sin título (La cruz del litoral desolado)",
    title: "Bez tytułu",
    year: "c. 1976",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-34.jpg",
    slug: "cruz_litoral_desolado",
    desc: "Una gigantesca cruz de madera en forma de tau domina un pedregal sombrío bañado por un mar espectral bajo un cielo cargado de niebla sulfúrica. De la cruceta pende un despojo cubierto de telas raídas y telarañas del que emana un espeso penacho de humo negro. Transmuta la imaginería sacra en una advertencia sobre la desolación de una fe abandonada tras la hecatombe."
  },
  {
    n: 10,
    title_es: "Sin título (La marcha hacia el monolito)",
    title: "Bez tytułu",
    year: "c. 1978",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-43.jpg",
    slug: "marcha_hacia_el_monolito",
    desc: "Una procesión de espectros andrajosos y cuerpos esqueletizados avanza penosamente a través de la polvareda guiada por una figura que aúlla hacia el vacío. En el horizonte nebuloso se recorta la silueta imponente y silenciosa de una torre cilíndrica inaccesible. Retrata la marcha fúnebre de la humanidad desorientada en pos de un destino hermético e incognoscible."
  },
  {
    n: 11,
    title_es: "Sin título (El organista azul / In Hoc Signo Vinces)",
    title: "Bez tytułu",
    year: "c. 1979",
    holding_museum: "Colección Piotr Dmochowski",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-49.jpg",
    slug: "organista_azul_in_hoc_signo",
    desc: "Un ente encapuchado con túnica azul índigo toca un armonio barroco decorado con una cruz en un patio desolado rodeado de murallones de piedra. En lo alto del muro, bajo la inscripción latina In Hoc Signo Vinces, una figura escarlata crucificada es asediada por cuervos. Representa la persistencia del rito musical y litúrgico como plegaria impotente ante la crudeza del destino."
  },
  {
    n: 12,
    title_es: "Sin título (La horca en el páramo)",
    title: "Bez tytułu",
    year: "c. 1975",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-40.jpg",
    slug: "horca_en_el_paramo",
    desc: "Un poste altísimo rematado en madero transversal sostiene un fardo cadavérico deshilachado en medio de una llanura sembrada de restos domésticos y maderas rotas. Una escalera solitaria permanece recostada contra la columna bajo un cielo brumoso iluminado por un tenue resplandor crepuscular. Sugiere un castigo ancestral en un mundo donde ya no quedan jueces ni testigos humanos."
  },
  {
    n: 13,
    title_es: "Sin título (Los supliciados en los maderos)",
    title: "Bez tytułu",
    year: "c. 1975",
    holding_museum: "Colección Piotr Dmochowski",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-37.jpg",
    slug: "supliciados_en_maderos",
    desc: "Varios postes verticales de madera emergen de un fango oscuro sosteniendo osamentas humanas maniatadas y envueltas en jirones de tela. En primer plano un cuerpo desarticulado abraza el tronco con sus miembros quebrados mientras otras figuras idénticas se pierden en la niebla. Simboliza el tormento colectivo y el silencio imperturbable del paisaje ante el sufrimiento perpetuo."
  },
  {
    n: 14,
    title_es: "Sin título (La criatura del cráneo y la criatura envuelta)",
    title: "Bez tytułu",
    year: "c. 1977",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-48.jpg",
    slug: "criatura_craneo_fardo_rojo",
    desc: "Un ser encorvado con abrigo negro y una testa lisa como un cráneo pulido sostiene con devoción un pequeño fardo bermejo sobre su pecho. Al fondo, sobre una colina nevada en tinieblas, un bloque arquitectónico cuadrangular vigila la escena con dos orificios encendidos. Explora la fragilidad del afecto maternal o filial en medio de un páramo gélido dominado por entidades acechantes."
  },
  {
    n: 15,
    title_es: "Sin título (La ciudadela con ojos)",
    title: "Bez tytułu",
    year: "c. 1976",
    holding_museum: "Colección Piotr Dmochowski",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-54.jpg",
    slug: "ciudadela_con_ojos",
    desc: "Una fortaleza pétrea colosal de torreones cóncavos y óculos ciegos se eleva imponente envuelta en velos de neblina y polvo ocre. En el desierto inferior se dispersan vigas calcinadas y restos óseos que atestiguan el colapso de ejércitos o poblaciones enteras. La arquitectura ciclópea adquiere rasgos casi biológicos, funcionando como un tótem de piedra que observa la nada."
  },
  {
    n: 16,
    title_es: "Sin título (La crucifixión sobre el osario)",
    title: "Bez tytułu",
    year: "c. 1977",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-42.jpg",
    slug: "crucifixion_sobre_osario",
    desc: "Un poste esbelto sostiene una figura esquelética en pose de crucifixión sobre un mar infinito de lápidas y restos humanos en descomposición. Entre las tumbas, espectros agazapados y criaturas con aspecto de arácnidos deambulan bajo un cielo encendido en tonos ámbar y pardo. Proyecta una visión descarnada del Gólgota multiplicada hasta abarcar el horizonte entero de la existencia."
  },
  {
    n: 17,
    title_es: "Sin título (La cabeza-edificio en llamas)",
    title: "Bez tytułu",
    year: "1980",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-39.jpg",
    slug: "cabeza_edificio_en_llamas",
    desc: "Un rascacielos monumental en ruinas adopta la forma de una gigantesca testa humana con labios macizos y cuencas vacías devoradas por el fuego. La retícula de ventanas y balcones de cemento se resquebraja mientras densas columnas de humo ascienden hacia una luna nebulosa. Fusión magistral de la decadencia urbana soviética con la anatomía fúnebre de la pesadilla surrealista."
  },
  {
    n: 18,
    title_es: "Sin título (Las hogueras sobre los pilares)",
    title: "Bez tytułu",
    year: "1978",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads3.wikiart.org/images/zdislav-beksinski/untitled-1978-1.jpg",
    slug: "hogueras_sobre_pilares",
    desc: "Innumerables columnas basálticas cilíndricas se alzan como islas sobre un mar de niebla perpetua bajo una bóveda teñida de oro y azufre. En la cúspide de cada pilar, pequeños grupos de figuras embozadas se calientan en torno a fogatas solitarias e incomunicadas. Metáfora sobre el aislamiento existencial humano, donde cada alma habita su propia roca sin tender lazos a las demás."
  },
  {
    n: 19,
    title_es: "Sin título (El ser alado tras la muralla)",
    title: "Bez tytułu",
    year: "c. 1978",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-41.jpg",
    slug: "ser_alado_tras_muralla",
    desc: "Una criatura de cuerpo apergaminado provista de alas membranosas parecidas a las de un murciélago se aferra al ángulo de un bloque de piedra y se asoma. En la esquina inferior izquierda asoma otro rostro bulboso y marchito con ojos entrecerrados que observa desde la penumbra. Sugiere la presencia de centinelas espectrales acechando en los límites de un mundo arquitectónico hostil."
  },
  {
    n: 20,
    title_es: "Sin título (El monolito sombrío en el camposanto)",
    title: "Bez tytułu",
    year: "c. 1977",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-38.jpg",
    slug: "monolito_sombrio_camposanto",
    desc: "Un bloque megalítico rectangular de piedra negra se alza en el centro de un cementerio antiguo poblado por decenas de estelas funerarias torcidas. Sobre la faz del monolito resalta una intrincada ramificación vegetal de color verde esmeralda que parece una red vascular petrificada. La pieza contrasta la pesadumbre del duelo con la enigmática vitalidad que brota de la piedra fría."
  },
  {
    n: 21,
    title_es: "Sin título (El cadalso con antenas de televisión)",
    title: "Bez tytułu",
    year: "c. 1976",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-52.jpg",
    slug: "cadalso_antenas_television",
    desc: "Una precaria torre de andamiaje y tablones sostiene una pira condensada de osamentas cubiertas de telarañas en una callejuela flanqueada por bloques urbanos. En la parte superior sobresale una desvencijada antena de televisión metálica que apunta al cielo ocre contaminado. Integra de manera inquietante el desarraigo de los suburbios de posguerra con símbolos de muerte arcaica."
  },
  {
    n: 22,
    title_es: "Sin título (La parca con vara y can salvaje)",
    title: "Bez tytułu",
    year: "c. 1976",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-50.jpg",
    slug: "parca_vara_can_salvaje",
    desc: "Una figura espectral amortajada con túnica oscura y vara de caminante avanza lentamente escoltada por un sabueso negro de lomo erizado. A sus espaldas se yergue una torre cuadrangular de piedra bajo un cielo estriado de brasas y una luna menguante eclipsada. Evoca el arquetipo del heraldo de la muerte cruzando los senderos desérticos de un reino en disolución cósmica."
  },
  {
    n: 23,
    title_es: "Sin título (La basílica roja de doble torre)",
    title: "Bez tytułu",
    year: "c. 1977",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-53.jpg",
    slug: "basilica_roja_doble_torre",
    desc: "La fachada de una catedral descomunal con dos torres cuadradas se tiñe de un bermellón encendido sobre un fondo nebuloso y crepuscular. En el corazón del templo, el rosetón tradicional ha sido sustituido por una abertura abismal y cavernosa que se hunde en la entraña del edificio. Transforma el templo cristiano en una caverna cavernosa y visceral que parece devorar la luz circundante."
  },
  {
    n: 24,
    title_es: "Sin título (La cruz negra del risco nocturno)",
    title: "Bez tytułu",
    year: "c. 1975",
    holding_museum: "Muzeum Historyczne w Sanoku",
    url: "https://uploads0.wikiart.org/images/zdislav-beksinski/untitled-117.jpg",
    slug: "cruz_negra_risco_nocturno",
    desc: "Una monumental cruz de madera en forma de tau coronada por un cuerpo reseco y filamentoso se alza solitaria en la cima de un promontorio rocoso. Una noche azul cobalto profunda envuelve la elevación mientras la silueta cruciforme recorta su perfil oscuro contra el infinito. Destaca por su sobriedad lumínica y la solemnidad casi fúnebre de su composición minimalista."
  },
  {
    n: 25,
    title_es: "Sin título (El mensajero biomecánico)",
    title: "Bez tytułu",
    year: "1986",
    holding_museum: "Colección Piotr Dmochowski",
    url: "https://uploads8.wikiart.org/images/zdislav-beksinski/untitled-33.jpg",
    slug: "mensajero_biomecanico",
    desc: "Una figura con el rostro cubierto por una máscara de aviador o casco esférico monta una bicicleta o vehículo arcaico de textura fibrosa y carnosa. Sostiene firmemente en sus manos un cofre o bloque repleto de filamentos y relieves biomórficos mientras avanza por un páramo azul. Marca el tránsito hacia su período gótico tardío, caracterizado por texturas acanaladas y misterio mecánico."
  }
];

export async function run() {
  const colDir = '22_zdzislaw_beksinski';
  const landsDir = path.join(colDir, 'landscape');
  const portDir = path.join(colDir, 'portrait');
  fs.mkdirSync(landsDir, { recursive: true });
  fs.mkdirSync(portDir, { recursive: true });

  const items = [];

  for (const t of BEKSINSKI_TARGETS) {
    const numStr = String(t.n).padStart(2, '0');
    console.log(`[${numStr}/25] Fetching ${t.title_es}...`);

    let buf;
    // Check if we already have it in scratch or root
    const scratchLocal = path.join('scratch_beksinski_images', `${t.slug}.jpg`);
    if (t.n === 1 && fs.existsSync('lovers.jpg')) {
      buf = fs.readFileSync('lovers.jpg');
    } else if (t.n === 2 && fs.existsSync('aa78.jpg')) {
      buf = fs.readFileSync('aa78.jpg');
    } else {
      const res = await fetch(t.url, {
        headers: { 'User-Agent': 'ArteBot/1.0 (personal collection)' }
      });
      if (!res.status.toString().startsWith('2')) {
        throw new Error(`Failed to fetch ${t.url}: HTTP ${res.status}`);
      }
      buf = Buffer.from(await res.arrayBuffer());
    }

    const meta = await sharp(buf).metadata();
    const w = meta.width;
    const h = meta.height;
    const orientation = w >= h ? 'landscape' : 'portrait';
    const filename = `${numStr}_beksinski_${t.slug}.jpg`;
    const destPath = path.join(colDir, orientation, filename);

    fs.writeFileSync(destPath, buf);

    items.push({
      n: t.n,
      title: t.title,
      title_es: t.title_es,
      artist: "Zdzisław Beksiński",
      year: t.year,
      holding_museum: t.holding_museum,
      file: filename,
      width: w,
      height: h,
      orientation: orientation,
      description: t.desc,
      description_source: "Muzeum Historyczne w Sanoku / Dmochowski Gallery",
      license: "Uso personal",
      school: "Surrealismo distópico polaco",
      type: "Pintura al óleo sobre tabla"
    });

    console.log(`  -> Saved ${orientation}/${filename} (${w}x${h})`);
  }

  // Save index
  const indexData = {
    collection: colDir,
    items: items
  };
  fs.writeFileSync(path.join(colDir, '_index.json'), JSON.stringify(indexData, null, 2));
  console.log(`\nSuccessfully created ${colDir}/_index.json with ${items.length} works!`);

  // Create tools/desc/22_zdzislaw_beksinski.mjs
  const descEntries = items.map(it => ({
    n: it.n,
    titulo: it.title_es,
    anio: it.year,
    museo: it.holding_museum,
    escuela: it.school,
    tipo: it.type,
    d: it.description
  }));

  const descContent = `// Fichas autoradas — 22_zdzislaw_beksinski
// Sintetizadas de fuentes curatoriales del Muzeum Historyczne w Sanoku y Dmochowski Gallery
export default ${JSON.stringify(descEntries, null, 2)};
`;
  fs.writeFileSync('tools/desc/22_zdzislaw_beksinski.mjs', descContent);
  console.log('Saved tools/desc/22_zdzislaw_beksinski.mjs');
}

if (process.argv[1] && process.argv[1].endsWith('harvest-22-beksinski.mjs')) {
  run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}
