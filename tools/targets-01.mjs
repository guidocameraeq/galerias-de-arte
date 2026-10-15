// Targets curados de la colección 01 (mitología griega/romana).
// src: 'met' | 'cle' (Cleveland) | 'wmc' (Wikimedia Commons)
// q: query de búsqueda. artist/titleHints: para puntuar el match correcto.
export const TARGETS_01 = [
  // --- Met (museos de EE.UU., dominio público vía isPublicDomain) ---
  { n: 3,  title: 'The Birth of Venus',                 artist: 'Cabanel',   year: '1875', src: 'met', q: 'Birth of Venus Cabanel' },
  { n: 4,  title: 'Mars and Venus United by Love',      artist: 'Veronese',  year: '1570s', src: 'met', q: 'Mars and Venus United by Love' },
  { n: 5,  title: 'Venus and Adonis',                   artist: 'Titian',    year: '1550s', src: 'met', q: 'Venus and Adonis Titian' },
  { n: 24, title: 'The Abduction of the Sabine Women',  artist: 'Poussin',   year: '1633', src: 'met', q: 'Abduction of the Sabine Women Poussin' },
  { n: 31, title: 'Pygmalion and Galatea',              artist: 'Gerome',    year: '1890', src: 'met', q: 'Pygmalion and Galatea Gerome' },

  // --- Cleveland (CC0) — dos íconos nombrados ---
  { n: 20, title: 'Apollo Sauroktonos (Cleveland Apollo)', artist: 'Praxiteles', year: 'c350 a.C.', src: 'cle', q: 'Apollo Sauroktonos' },
  { n: 29, title: 'Cupid and Psyche',                   artist: 'David',     year: '1817', src: 'cle', q: 'Cupid and Psyche David' },

  // --- Wikimedia Commons (íconos en museos europeos, dominio público) ---
  { n: 1,  title: 'The Birth of Venus',                 artist: 'Botticelli', year: '1485', src: 'wmc', q: 'Birth of Venus Botticelli' },
  { n: 2,  title: 'Primavera',                          artist: 'Botticelli', year: '1480', src: 'wmc', q: 'Botticelli Primavera' },
  { n: 6,  title: 'The Toilet of Venus (Rokeby Venus)', artist: 'Velazquez',  year: '1647', src: 'wmc', q: 'Rokeby Venus Velazquez' },
  { n: 8,  title: 'Bacchus and Ariadne',               artist: 'Titian',     year: '1523', src: 'wmc', q: 'Bacchus and Ariadne Titian' },
  { n: 9,  title: 'The Bacchanal of the Andrians',     artist: 'Titian',     year: '1525', src: 'wmc', q: 'Bacchanal of the Andrians Titian' },
  { n: 10, title: 'Bacchus',                            artist: 'Caravaggio', year: '1596', src: 'wmc', q: 'Bacchus Caravaggio' },
  { n: 12, title: 'Hercules and the Hydra',            artist: 'Pollaiuolo', year: '1475', src: 'wmc', q: 'Hercules and the Hydra Pollaiuolo' },
  { n: 13, title: 'Hercules and Antaeus',             artist: 'Pollaiuolo', year: '1478', src: 'wmc', q: 'Hercules and Antaeus Pollaiuolo' },
  { n: 16, title: 'Medusa',                             artist: 'Caravaggio', year: '1597', src: 'wmc', q: 'Medusa Caravaggio' },
  { n: 17, title: 'Perseus and Andromeda',            artist: 'Titian',     year: '1554', src: 'wmc', q: 'Perseus and Andromeda Titian Wallace' },
  { n: 19, title: 'Pallas and the Centaur',           artist: 'Botticelli', year: '1482', src: 'wmc', q: 'Pallas and the Centaur Botticelli' },
  { n: 22, title: 'Diana and Actaeon',                artist: 'Titian',     year: '1559', src: 'wmc', q: 'Diana and Actaeon Titian' },
  { n: 23, title: 'Diana the Huntress',               artist: 'School of Fontainebleau', year: '1550', src: 'wmc', q: 'Diana the Huntress Fontainebleau' },
  { n: 25, title: 'The Rape of Europa',               artist: 'Titian',     year: '1562', src: 'wmc', q: 'Rape of Europa Titian' },
  { n: 27, title: 'The Fall of the Giants',           artist: 'Giulio Romano', year: '1535', src: 'wmc', q: 'Fall of the Giants Giulio Romano Palazzo Te' },
  { n: 32, title: 'Prometheus Bound',                 artist: 'Rubens',     year: '1612', src: 'wmc', q: 'Prometheus Bound Rubens' },
  { n: 33, title: 'Echo and Narcissus',               artist: 'Waterhouse', year: '1903', src: 'wmc', q: 'Echo and Narcissus Waterhouse' },
  { n: 34, title: 'Landscape with the Fall of Icarus', artist: 'Bruegel',   year: '1560', src: 'wmc', q: 'Landscape with the Fall of Icarus Bruegel' },
  { n: 35, title: 'The Lament for Icarus',            artist: 'Draper',     year: '1898', src: 'wmc', q: 'Lament for Icarus Draper' },
  { n: 36, title: 'Pandora',                           artist: 'Waterhouse', year: '1896', src: 'wmc', q: 'Pandora Waterhouse 1896' },
  { n: 37, title: 'Danae',                             artist: 'Titian',     year: '1554', src: 'wmc', q: 'Danae Titian' },
  { n: 38, title: 'Orpheus',                           artist: 'Moreau',     year: '1865', src: 'wmc', q: 'Orpheus Gustave Moreau' },
  { n: 40, title: 'Nymphs and Satyr',                 artist: 'Bouguereau', year: '1873', src: 'wmc', q: 'Nymphs and Satyr Bouguereau' },

  // --- Esculturas (fotos en Wikimedia): se intentan, pero ojo licencia (foto de obra 3D
  //     suele ser CC-BY-SA, no PD). Pasan SOLO si la foto es PD/CC0. ---
  { n: 18, title: 'Perseus with the Head of Medusa',  artist: 'Cellini',    year: '1554', src: 'wmc', q: 'Perseus Cellini Loggia bronze' },
  { n: 21, title: 'Apollo and Daphne',                artist: 'Bernini',    year: '1625', src: 'wmc', q: 'Apollo and Daphne Bernini' },
  { n: 26, title: 'The Rape of Proserpina',           artist: 'Bernini',    year: '1622', src: 'wmc', q: 'Rape of Proserpina Bernini' },
  { n: 28, title: 'The Rape of the Sabine Women',     artist: 'Giambologna', year: '1583', src: 'wmc', q: 'Rape of the Sabine Women Giambologna' },
  { n: 30, title: 'Psyche Revived by Cupids Kiss',    artist: 'Canova',     year: '1793', src: 'wmc', q: 'Psyche Revived by Cupid Kiss Canova Louvre' },
];

// Barrido de descubrimiento (Met + Wikimedia)
export const MET_SUBJECTS = [
  'Venus', 'Aphrodite', 'Apollo', 'Hercules', 'Herakles', 'Bacchus', 'Dionysos',
  'Perseus', 'Diana', 'Artemis', 'Jupiter', 'Zeus', 'Mars', 'Minerva', 'Athena',
  'nymph', 'satyr', 'Orpheus', 'Cupid', 'Eros', 'Pan', 'centaur', 'Triton',
];
// En el barrido del Met priorizamos estos departamentos (relevancia mitológica):
export const MET_DEPTS_PREF = new Set([
  'Greek and Roman Art', 'European Paintings', 'Drawings and Prints',
  'European Sculpture and Decorative Arts',
]);

export const WMC_CATEGORIES = [
  'Paintings of Greek myths', 'Paintings of Roman mythology',
  'Paintings of Venus', 'Paintings of Apollo', 'Paintings of Diana (mythology)',
  'Paintings of Bacchus', 'Paintings of Hercules', 'Paintings of Perseus',
  'Mythological paintings', 'Nudes in mythological paintings',
];
