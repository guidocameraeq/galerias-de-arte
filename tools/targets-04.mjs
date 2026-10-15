// Targets curados de la colección 04 (Romanticismo, c.1780-1870).
// Eje: paisaje sublime + lo épico/dramático. (Goya macabro, Fuseli "Nightmare",
// brujería -> reservados para la 06.)  src: 'met' | 'cle' | 'wmc'.
// NOTA: el depto del Met para pintura estadounidense es "The American Wing"
// (valor que trae el objeto), no el displayName del endpoint /departments.
export const TARGETS_04 = [
  // --- A. Romanticismo alemán (Friedrich) ---
  { n: 1,  title: 'Wanderer above the Sea of Fog',   artist: 'Caspar David Friedrich', year: '1818', src: 'wmc', q: 'Friedrich Wanderer above the Sea of Fog' },
  { n: 2,  title: 'The Sea of Ice',                  artist: 'Caspar David Friedrich', year: '1824', src: 'wmc', q: 'Friedrich Sea of Ice Wreck of Hope' },
  { n: 3,  title: 'The Monk by the Sea',             artist: 'Caspar David Friedrich', year: '1810', src: 'wmc', q: 'Friedrich Monk by the Sea' },
  { n: 4,  title: 'Abbey in the Oakwood',            artist: 'Caspar David Friedrich', year: '1810', src: 'wmc', q: 'Friedrich Abbey in the Oakwood' },
  { n: 5,  title: 'Chalk Cliffs on Rugen',           artist: 'Caspar David Friedrich', year: '1818', src: 'wmc', q: 'Friedrich Chalk Cliffs on Rugen' },
  { n: 6,  title: 'Two Men Contemplating the Moon',  artist: 'Caspar David Friedrich', year: '1830', src: 'met', q: 'Friedrich Two Men Contemplating the Moon' },

  // --- B. Romanticismo británico (Turner, Constable) ---
  { n: 7,  title: 'The Fighting Temeraire',          artist: 'J. M. W. Turner',   year: '1838', src: 'wmc', q: 'Turner Fighting Temeraire' },
  { n: 8,  title: 'Rain, Steam and Speed',           artist: 'J. M. W. Turner',   year: '1844', src: 'wmc', q: 'Turner Rain Steam and Speed' },
  { n: 9,  title: 'Snow Storm: Steam-Boat off a Harbour', artist: 'J. M. W. Turner', year: '1842', src: 'wmc', q: 'Turner Snow Storm Steam Boat' },
  { n: 10, title: 'The Slave Ship',                  artist: 'J. M. W. Turner',   year: '1840', src: 'wmc', q: 'Turner Slave Ship slavers' },
  { n: 11, title: 'Whalers',                         artist: 'J. M. W. Turner',   year: '1845', src: 'met', q: 'Turner Whalers' },
  { n: 12, title: 'The Hay Wain',                    artist: 'John Constable',    year: '1821', src: 'wmc', q: 'Constable Hay Wain' },
  { n: 13, title: 'Salisbury Cathedral from the Meadows', artist: 'John Constable', year: '1831', src: 'wmc', q: 'Constable Salisbury Cathedral from the Meadows' },

  // --- C. Romanticismo francés (Gericault, Delacroix) ---
  { n: 14, title: 'The Raft of the Medusa',          artist: 'Theodore Gericault', year: '1819', src: 'wmc', q: 'Gericault Raft of the Medusa' },
  { n: 15, title: 'Liberty Leading the People',      artist: 'Eugene Delacroix',  year: '1830', src: 'wmc', q: 'Delacroix Liberty Leading the People' },
  { n: 16, title: 'The Death of Sardanapalus',       artist: 'Eugene Delacroix',  year: '1827', src: 'wmc', q: 'Delacroix Death of Sardanapalus Louvre' },
  { n: 17, title: 'The Massacre at Chios',           artist: 'Eugene Delacroix',  year: '1824', src: 'wmc', q: 'Delacroix Massacre at Chios' },
  { n: 18, title: 'The Charging Chasseur',           artist: 'Theodore Gericault', year: '1812', src: 'wmc', q: 'Gericault Charging Chasseur' },

  // --- D. Goya (épico/histórico, no lo macabro) ---
  { n: 19, title: 'The Third of May 1808',           artist: 'Francisco de Goya', year: '1814', src: 'wmc', q: 'Goya Third of May 1808' },
  { n: 20, title: 'The Colossus',                    artist: 'Francisco de Goya', year: '1808', src: 'wmc', q: 'Goya Colossus el coloso' },
  { n: 21, title: 'The Second of May 1808',          artist: 'Francisco de Goya', year: '1814', src: 'wmc', q: 'Goya Second of May Charge of the Mamelukes' },

  // --- E. Romanticismo estadounidense (Hudson River School) ---
  { n: 22, title: 'The Oxbow',                       artist: 'Thomas Cole',       year: '1836', src: 'met', q: 'Thomas Cole Oxbow View from Mount Holyoke' },
  { n: 23, title: 'The Course of Empire: Destruction', artist: 'Thomas Cole',     year: '1836', src: 'wmc', q: 'Thomas Cole Course of Empire Destruction' },
  { n: 24, title: 'Heart of the Andes',              artist: 'Frederic Edwin Church', year: '1859', src: 'met', q: 'Frederic Church Heart of the Andes' },
  { n: 25, title: 'Niagara',                         artist: 'Frederic Edwin Church', year: '1857', src: 'wmc', q: 'Frederic Church Niagara 1857' },
  { n: 26, title: 'The Rocky Mountains, Landers Peak', artist: 'Albert Bierstadt', year: '1863', src: 'met', q: 'Bierstadt Rocky Mountains Landers Peak' },
  { n: 27, title: 'Among the Sierra Nevada',         artist: 'Albert Bierstadt',  year: '1868', src: 'wmc', q: 'Bierstadt Among the Sierra Nevada California' },
  { n: 28, title: 'Twilight in the Wilderness',      artist: 'Frederic Edwin Church', year: '1860', src: 'cle', q: 'Frederic Church Twilight in the Wilderness' },
  { n: 29, title: 'Kindred Spirits',                 artist: 'Asher Brown Durand', year: '1849', src: 'wmc', q: 'Asher Durand Kindred Spirits' },

  // --- F. Sublime / marina / catástrofe ---
  { n: 30, title: 'The Ninth Wave',                  artist: 'Ivan Aivazovsky',   year: '1850', src: 'wmc', q: 'Aivazovsky Ninth Wave' },
  { n: 31, title: 'The Last Day of Pompeii',         artist: 'Karl Bryullov',     year: '1833', src: 'wmc', q: 'Bryullov Last Day of Pompeii' },
  { n: 32, title: 'The Great Day of His Wrath',      artist: 'John Martin',       year: '1853', src: 'wmc', q: 'John Martin Great Day of His Wrath' },
  { n: 33, title: 'The Wreck of a Transport Ship',   artist: 'J. M. W. Turner',   year: '1810', src: 'wmc', q: 'Turner Wreck of a Transport Ship' },

  // --- G. Visionario (Blake) ---
  { n: 34, title: 'Newton',                          artist: 'William Blake',     year: '1795', src: 'wmc', q: 'William Blake Newton' },
  { n: 35, title: 'The Ancient of Days',             artist: 'William Blake',     year: '1794', src: 'wmc', q: 'William Blake Ancient of Days' },
];

// ---- Descubrimiento ----
export const MET_SUBJECTS_04 = [   // paisajistas románticos (matchArtist=true): American Wing + European Paintings
  'Turner', 'Constable', 'Cole', 'Church', 'Bierstadt', 'Friedrich', 'Delacroix',
  'Cropsey', 'Durand', 'Kensett', 'Moran', 'Gifford', 'Inness', 'Cropsey', 'Corot',
];
export const MET_DEPTS_PREF_04 = new Set([
  'The American Wing', 'European Paintings',
]);
export const MET_DATE_04 = { min: 1780, max: 1880 };

// Solo categorías por-artista o de escuela acotada (las temáticas amplias tipo
// 'Marine paintings' / 'Mountains in art' traen arte moderno/IA y se eliminaron).
export const WMC_CATEGORIES_04 = [
  'Paintings of the Hudson River School',
  'Paintings by Caspar David Friedrich', 'Paintings by J. M. W. Turner',
  'Paintings by Ivan Aivazovsky', 'Paintings by John Martin (painter)',
  'Paintings by Eugène Delacroix', 'Paintings by Théodore Géricault',
  'Paintings by Thomas Cole', 'Paintings by Frederic Edwin Church',
  'Paintings by Albert Bierstadt', 'Paintings by John Constable',
  'Paintings by Karl Bryullov', 'Paintings by William Blake',
];
export const MAX_YEAR_04 = 1900; // descubrimiento: nada posterior a la época romántica
