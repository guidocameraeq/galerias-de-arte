// Targets curados de la colección 06 (Macabro / memento mori).
// Memento mori, vanitas, danza de la muerte, muerte mitológica, brujería, lo
// siniestro secular. Época semi-renacentista / barroca / clásica.
// EXCLUSIÓN DURA: nada de temática cristiana religiosa ni de Jesús (crucifixiones,
// escenas devocionales de Cristo). Aplicada en el descubrimiento vía `exclude`.
// src: 'met' | 'cle' | 'wmc'.
export const TARGETS_06 = [
  // --- A. Bruegel / Bosch (lo siniestro, semi-renacentista) ---
  { n: 1,  title: 'The Triumph of Death',            artist: 'Pieter Bruegel the Elder', year: '1562', src: 'wmc', q: 'Bruegel Triumph of Death Prado' },
  { n: 2,  title: 'Dulle Griet (Mad Meg)',           artist: 'Pieter Bruegel the Elder', year: '1563', src: 'wmc', q: 'Bruegel Dulle Griet Mad Meg' },
  { n: 3,  title: 'The Garden of Earthly Delights',  artist: 'Hieronymus Bosch', year: '1505', src: 'wmc', q: 'Bosch Garden of Earthly Delights Prado' },
  { n: 4,  title: 'Death and the Miser',             artist: 'Hieronymus Bosch', year: '1490', src: 'wmc', q: 'Bosch Death and the Miser' },

  // --- B. Goya (brujería / muerte) ---
  { n: 5,  title: 'Saturn Devouring His Son',        artist: 'Francisco de Goya', year: '1823', src: 'wmc', q: 'Goya Saturn Devouring His Son' },
  { n: 6,  title: 'Witches Sabbath (The Great He-Goat)', artist: 'Francisco de Goya', year: '1823', src: 'wmc', q: 'Goya Witches Sabbath Great He-Goat' },
  { n: 7,  title: 'Witches Sabbath',                 artist: 'Francisco de Goya', year: '1798', src: 'wmc', q: 'Goya Witches Sabbath 1798 Lazaro' },
  { n: 8,  title: 'Witches Flight',                  artist: 'Francisco de Goya', year: '1798', src: 'wmc', q: 'Goya Vuelo de brujas Witches Flight' },
  { n: 9,  title: 'The Sleep of Reason Produces Monsters', artist: 'Francisco de Goya', year: '1799', src: 'met', q: 'Goya Sleep of Reason Produces Monsters Capricho' },

  // --- C. Renacimiento alemán macabro ---
  { n: 10, title: 'Knight, Death and the Devil',     artist: 'Albrecht Durer', year: '1513', src: 'met', q: 'Durer Knight Death and the Devil engraving' },
  { n: 11, title: 'Death and the Maiden',            artist: 'Hans Baldung Grien', year: '1517', src: 'wmc', q: 'Hans Baldung Death and the Maiden' },
  { n: 12, title: 'The Three Ages of Man and Death', artist: 'Hans Baldung Grien', year: '1510', src: 'wmc', q: 'Hans Baldung Three Ages of Man and Death' },
  { n: 13, title: 'Two Witches',                     artist: 'Hans Baldung Grien', year: '1523', src: 'wmc', q: 'Hans Baldung Two Witches Weather Witches' },
  { n: 14, title: 'The Ambassadors',                 artist: 'Hans Holbein the Younger', year: '1533', src: 'wmc', q: 'Holbein Ambassadors anamorphic skull' },
  { n: 15, title: 'The Dance of Death',              artist: 'Hans Holbein the Younger', year: '1526', src: 'met', q: 'Holbein Dance of Death woodcut' },

  // --- D. Vanitas (bodegón secular) ---
  { n: 16, title: 'Vanitas Still Life',              artist: 'Pieter Claesz', year: '1630', src: 'wmc', q: 'Pieter Claesz Vanitas Still Life skull' },
  { n: 17, title: 'Vanitas Still Life',              artist: 'Harmen Steenwijck', year: '1640', src: 'wmc', q: 'Harmen Steenwijck Vanitas Still Life' },
  { n: 18, title: 'Still Life with a Skull',         artist: 'Philippe de Champaigne', year: '1671', src: 'wmc', q: 'Philippe de Champaigne Vanitas skull tulip hourglass' },
  { n: 19, title: 'Vanitas',                         artist: 'Antonio de Pereda', year: '1634', src: 'wmc', q: 'Antonio de Pereda Vanitas Allegory' },
  { n: 20, title: 'An Allegory of the Vanities of Human Life', artist: 'Harmen Steenwijck', year: '1640', src: 'wmc', q: 'Steenwijck Allegory Vanities Human Life' },

  // --- E. Muerte mitológica / clásica ---
  { n: 21, title: 'Et in Arcadia ego',               artist: 'Nicolas Poussin', year: '1638', src: 'wmc', q: 'Poussin Et in Arcadia ego Louvre shepherds' },
  { n: 22, title: 'Apollo and Marsyas',              artist: 'Jusepe de Ribera', year: '1637', src: 'wmc', q: 'Ribera Apollo and Marsyas flaying' },
  { n: 23, title: 'The Triumph of Death (Palermo)',  artist: 'Anonimo', year: '1446', src: 'wmc', q: 'Triumph of Death Palermo fresco Galleria' },

  // --- F. Lo gótico-onírico / simbolista (estira la época pero icónico) ---
  { n: 24, title: 'The Nightmare',                   artist: 'Henry Fuseli', year: '1781', src: 'wmc', q: 'Fuseli Nightmare incubus' },
  { n: 25, title: 'Isle of the Dead',                artist: 'Arnold Bocklin', year: '1883', src: 'met', q: 'Bocklin Isle of the Dead' },
  { n: 26, title: 'Self-Portrait with Death Playing the Fiddle', artist: 'Arnold Bocklin', year: '1872', src: 'wmc', q: 'Bocklin Self-Portrait with Death Playing the Fiddle' },
  { n: 27, title: 'Witches Sabbath',                 artist: 'Salvator Rosa', year: '1646', src: 'wmc', q: 'Salvator Rosa Witches Sabbath night' },
];

// ---- Descubrimiento ----
// Subjects macabros que aparecen en títulos; depto + fecha + EXCLUSIÓN cristiana.
export const MET_SUBJECTS_06 = [
  'vanitas', 'skull', 'skeleton', 'death', 'witch', 'sorcery', 'Saturn',
  'memento mori', 'allegory of death', 'danse macabre', 'hourglass',
];
export const MET_DEPTS_PREF_06 = new Set(['European Paintings', 'Drawings and Prints']);
export const MET_DATE_06 = { min: 1450, max: 1860 };

// Quitadas 'Skulls in art'/'Skeletons in art'/'Paintings of death': amplísimas y
// llenas de arte moderno/IA. Quedan las histórico-artísticas; MODERN+maxYear filtran el resto.
export const WMC_CATEGORIES_06 = [
  'Vanitas paintings', 'Memento mori', 'Danse Macabre', 'Witchcraft in art',
  'Allegories of death', 'Paintings by Hans Baldung Grien', 'Paintings by Salvator Rosa',
];
export const MAX_YEAR_06 = 1910; // permite simbolistas (Böcklin, Ensor) y corta lo moderno/IA

// Exclusión dura de temática cristiana/Jesús (se testea contra título+tags+clasificación).
export const EXCLUDE_CHRISTIAN_06 =
  /\b(christ|crucifix|jesus|madonna|virgin|baptism|nativity|annunciation|resurrection|pieta|lamentation|trinity|holy family|ecce homo|deposition|last supper|adoration of|evangelist|saint |santa |san |st\.|apostle|gospel|martyrdom of s|cross\b)/i;
