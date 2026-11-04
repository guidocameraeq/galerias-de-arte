// Pobla la colección 17 (Doré · Divina Comedia): título_es consistente (Cantica · Canto N)
// + descripción de la escena de Dante por canto. Lee _cantos.json (sourceId -> "Cantica N").
import { loadIndex, saveIndex, buildFilename, colPath } from './lib.mjs';
import { readFileSync, promises as fsp } from 'node:fs';
import path from 'node:path';
const COL = '17_dore_divina_comedia';

const roman = (n) => { const v = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let r = ''; for (const [a, s] of v) while (n >= a) { r += s; n -= a; } return r; };
const ES = { Inferno: 'Infierno', Purgatorio: 'Purgatorio', Paradiso: 'Paraíso' };

const CANTOS = {
  Inferno: {
    1: 'Dante, perdido en una selva oscura, intenta subir una colina pero tres fieras —el leopardo, el león y la loba— le cierran el paso. Aparece el poeta Virgilio para guiarlo.',
    2: 'Dante vacila ante el viaje; Virgilio le revela que Beatriz bajó del cielo, movida por la Virgen y Santa Lucía, para pedirle que lo rescatara.',
    3: 'Atraviesan la puerta del Infierno ("Abandonad toda esperanza"). Tras los pusilánimes, el barquero Caronte transporta a las almas condenadas por el río Aqueronte.',
    4: 'El Limbo: los justos no bautizados y los grandes poetas paganos —Homero, Horacio, Ovidio— reciben a Dante en el noble castillo de los sabios.',
    5: 'Los lujuriosos son arrastrados eternamente por un huracán. Dante escucha la historia de Francesca da Rimini y Paolo y se desmaya de compasión.',
    6: 'Bajo una lluvia hedionda yacen los glotones, custodiados por el monstruoso can Cerbero de tres fauces. Dante habla con el florentino Ciacco.',
    7: 'Avaros y pródigos empujan pesos en un choque sin fin; los iracundos se desgarran en la laguna Estigia. Virgilio explica la rueda de la Fortuna.',
    8: 'Flegias cruza la Estigia en su barca; el airado Filippo Argenti se aferra a la borda. Ante las murallas en llamas de la ciudad de Dite, los demonios les niegan el paso.',
    9: 'Las tres Furias amenazan desde la torre, pero un mensajero del Cielo abre las puertas de Dite. Dentro, los heresiarcas arden en sepulcros de fuego.',
    10: 'Entre las tumbas ardientes de los herejes, el altivo Farinata degli Uberti se yergue para hablar con Dante de Florencia y del destino.',
    12: 'El Minotauro guarda el círculo de los violentos. Los centauros, arqueros, vigilan a los tiranos sumergidos en Flegetonte, el río de sangre hirviente.',
    13: 'El bosque de los suicidas: almas convertidas en árboles retorcidos a los que las Arpías desgarran. Habla el espíritu de Pier delle Vigne.',
    14: 'En un desierto de arena ardiente, bajo una lluvia de fuego, yacen los violentos contra Dios. Capaneo blasfema, desafiante incluso en el tormento.',
    15: 'Sobre la arena en llamas corren sin descanso los sodomitas. Dante reconoce con dolor a su viejo maestro, Brunetto Latini.',
    17: 'Gerión, el monstruo de rostro honesto y cuerpo de fraude, transporta a los poetas sobre su lomo al abismo inferior, mientras gimen los usureros.',
    18: 'Las Malebolge: en la primera fosa, rufianes y seductores son azotados por demonios cornudos; en la segunda, los aduladores se hunden en excremento.',
    19: 'Los simoníacos, que vendieron lo sagrado, están enterrados de cabeza con los pies ardiendo. Dante reprende al papa Nicolás III.',
    21: 'Los corruptos hierven en un lago de pez negra, vigilados por los demonios Malebranche, que los enganchan con garfios si asoman.',
    22: 'Los demonios atormentan a los estafadores en la pez hirviente; uno escapa con astucia y desata una reyerta entre los propios diablos.',
    23: 'Los hipócritas avanzan agobiados bajo capas de plomo doradas por fuera. En el suelo, Caifás yace crucificado, pisado por todos.',
    24: 'Entre rocas derrumbadas, los ladrones son mordidos por serpientes que los hacen arder y renacer de sus cenizas una y otra vez.',
    25: 'Continúa el suplicio de los ladrones: serpientes monstruosas se funden con los cuerpos en horrendas metamorfosis. Vanni Fucci blasfema.',
    26: 'Los consejeros fraudulentos arden envueltos cada uno en su propia llama. Desde una de ellas, Ulises narra su último y fatal viaje más allá del mundo.',
    28: 'Los sembradores de discordia son mutilados sin cesar por un demonio: Mahoma aparece abierto en canal y Bertran de Born porta su cabeza cortada como un farol.',
    29: 'En la última fosa, los falsificadores yacen enfermos y leprosos, rascándose furiosamente la costra de su piel.',
    31: 'Los gigantes —Nemrod, Anteo— se alzan en torno al pozo central como torres. Anteo toma a los poetas en su mano y los deposita en el fondo del Infierno.',
    32: 'El lago helado de Cocito aprisiona a los traidores. Dante encuentra al conde Ugolino royendo eternamente el cráneo del arzobispo Ruggieri.',
    33: 'Ugolino relata cómo murió de hambre, encerrado en una torre con sus hijos. Más adentro, los traidores yacen sepultados en el hielo.',
    34: 'En el centro de la Tierra, Lucifer gigantesco y de tres rostros masca a Judas, Bruto y Casio. Los poetas descienden por su cuerpo y salen a "ver de nuevo las estrellas".',
  },
  Purgatorio: {
    1: 'Saliendo del Infierno a una playa solitaria al amanecer, los poetas hallan a Catón el Joven, guardián de la montaña del Purgatorio.',
    2: 'Un ángel-barquero conduce a las almas nuevas cantando un salmo. El músico Casella entona para Dante una canción, hasta que Catón los apremia.',
    3: 'Al pie de la montaña esperan los excomulgados que se reconciliaron al morir, entre ellos el rey Manfredo.',
    4: 'La dura ascensión inicial; en una repisa, los negligentes perezosos descansan a la sombra, como el indolente Belacqua.',
    9: 'Santa Lucía lleva dormido a Dante hasta la puerta del Purgatorio, donde un ángel le graba siete "P" en la frente con la espada.',
    12: 'En la cornisa de los soberbios, relieves esculpidos en el suelo muestran ejemplos de soberbia castigada; un ángel borra la primera "P".',
    16: 'La cornisa de los iracundos, sumida en un humo denso y cegador. Marco Lombardo conversa con Dante sobre el libre albedrío y la corrupción del mundo.',
    19: 'Tras el sueño de la Sirena que seduce, Dante llega a la cornisa de los avaros, que yacen postrados boca abajo contra el suelo.',
    20: 'Entre los avaros, el alma de Hugo Capeto denuncia la codicia de su linaje. De pronto la montaña tiembla y resuena un canto: un alma queda purificada.',
    23: 'En la cornisa de los golosos, las almas demacradas por el hambre y la sed pasan ante un árbol prohibido. Dante reconoce a su amigo Forese Donati.',
    24: 'Continúa la cornisa de los golosos; las sombras consumidas hablan de poesía y de los frutos vedados antes de que un ángel señale el camino.',
    25: 'Estacio explica cómo se forma el alma y el cuerpo aéreo de los muertos, mientras se aproxima el muro de fuego de los lujuriosos.',
    27: 'Dante debe atravesar el muro de fuego que purifica la lujuria. Al otro lado, antes del amanecer, Virgilio se despide: Dante ya es libre y dueño de sí.',
    30: 'En el Paraíso Terrenal, sobre un carro triunfal, aparece Beatriz entre flores. Virgilio ha desaparecido, y ella reprende a Dante por haberse extraviado.',
    32: 'Junto al árbol místico, Dante contempla una procesión y visiones alegóricas de las desventuras de la Iglesia a lo largo de la historia.',
    33: 'Beatriz profetiza la redención; Dante bebe del río Eunoé, que restaura el recuerdo del bien, y queda "puro y dispuesto a subir a las estrellas".',
  },
  Paradiso: {
    3: 'En el cielo de la Luna, las almas que faltaron a sus votos. Piccarda Donati explica a Dante por qué están serenas en el grado más bajo de la gloria.',
    12: 'En el cielo del Sol, dos coronas de espíritus sabios giran y cantan. San Buenaventura narra la vida de Santo Domingo.',
    16: 'En el cielo de Marte, el tatarabuelo de Dante, Cacciaguida, evoca la Florencia antigua, sobria y noble, frente a la corrupción presente.',
    18: 'En el cielo de Júpiter, las almas de los justos forman con su luz letras que componen un mensaje y luego la figura de un águila.',
    19: 'El águila formada por los espíritus justos habla con una sola voz sobre el misterio de la justicia divina y la salvación.',
    20: 'El águila revela qué almas justas la componen, entre ellas paganos salvados, y explica los inescrutables designios de la gracia.',
    21: 'En el cielo de Saturno, los espíritus contemplativos suben y bajan por una escala de oro. San Pedro Damián censura el lujo de los prelados.',
    26: 'San Juan examina a Dante sobre el amor; Dante recupera la vista, más aguda que antes, y conoce al alma de Adán, el primer hombre.',
    27: 'San Pedro fulmina la corrupción de los papas indignos. Los poetas ascienden al Primer Móvil, el cielo que mueve a todos los demás.',
    28: 'Dante contempla un punto de luz cegadora rodeado por nueve círculos de fuego: las jerarquías angélicas que giran en torno a Dios.',
    31: 'La visión suprema: los bienaventurados forman una inmensa Rosa Blanca de luz. San Bernardo reemplaza a Beatriz como último guía hacia Dios.',
  },
};

const cantos = JSON.parse(readFileSync('17_dore_divina_comedia/_cantos.json', 'utf8'));
const idx = await loadIndex('17_dore_divina_comedia');
let pob = 0, sinCanto = 0;
for (const it of idx.items) {
  const v = cantos[it.sourceId]; // "Inferno 3"
  if (!v) { sinCanto++; it.description_source = '(sin canto)'; continue; }
  const [cantica, ns] = v.split(' '); const n = +ns;
  it.title_es = `${ES[cantica]} · Canto ${roman(n)}`;
  it.title = it.title_es;
  it.canto = n;
  const d = CANTOS[cantica]?.[n];
  if (d) { it.description = d; it.description_source = 'Síntesis (Claude, sobre la Divina Comedia)'; pob++; }
  else it.description_source = '(canto sin texto)';
}
// orden lógico Infierno→Purgatorio→Paraíso y por canto; renumera
const ord = { Infierno: 0, Purgatorio: 1, 'Paraíso': 2 };
idx.items.sort((a, b) => (ord[(a.title_es || '').split(' · ')[0]] ?? 9) - (ord[(b.title_es || '').split(' · ')[0]] ?? 9) || (a.canto || 99) - (b.canto || 99) || a.n - b.n);
idx.items.forEach((it, i) => { it.n = i + 1; });
// renombrar archivos en disco (doble pasada con temp para evitar colisiones)
for (let i = 0; i < idx.items.length; i++) {
  const it = idx.items[i]; const tmp = `__tmp${i}.jpg`;
  await fsp.rename(path.join(colPath(COL), it.orientation, it.file), path.join(colPath(COL), it.orientation, tmp));
  it._tmp = tmp;
}
for (const it of idx.items) {
  const nf = buildFilename(it.n, it.title_es || it.title, 'Gustave Doré', '1861');
  await fsp.rename(path.join(colPath(COL), it.orientation, it._tmp), path.join(colPath(COL), it.orientation, nf));
  it.file = nf; delete it._tmp;
}
await saveIndex(COL, idx);
console.log(`Poblados: ${pob}/${idx.items.length} con descripción de canto. Sin canto: ${sinCanto}. Reordenados Infierno→Purgatorio→Paraíso y archivos renombrados.`);
