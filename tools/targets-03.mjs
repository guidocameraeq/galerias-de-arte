// Targets curados de la colección 03 (Gótico / medieval tardío, c.1250-1500).
// Paneles de fondo de oro (Trecento italiano), primitivos flamencos / gótico
// internacional, manuscritos iluminados y escultura/marfil gótico.
// src: 'met' | 'cle' | 'wmc'.
export const TARGETS_03 = [
  // --- A. Trecento italiano (fondo de oro) ---
  { n: 1,  title: 'Maesta',                          artist: 'Duccio',           year: '1311', src: 'wmc', q: 'Duccio Maesta Siena' },
  { n: 2,  title: 'Madonna and Child',               artist: 'Duccio',           year: '1300', src: 'met', q: 'Duccio Madonna and Child' },
  { n: 3,  title: 'Ognissanti Madonna',              artist: 'Giotto',           year: '1310', src: 'wmc', q: 'Giotto Ognissanti Madonna Uffizi' },
  { n: 4,  title: 'Lamentation of Christ',           artist: 'Giotto',           year: '1305', src: 'wmc', q: 'Giotto Lamentation Scrovegni' },
  { n: 5,  title: 'The Annunciation',                artist: 'Simone Martini',   year: '1333', src: 'wmc', q: 'Simone Martini Annunciation Uffizi' },
  { n: 6,  title: 'Allegory of Good Government',      artist: 'Ambrogio Lorenzetti', year: '1339', src: 'wmc', q: 'Ambrogio Lorenzetti Allegory Good Government Siena' },
  { n: 7,  title: 'Santa Trinita Maesta',            artist: 'Cimabue',          year: '1290', src: 'wmc', q: 'Cimabue Santa Trinita Maesta' },
  { n: 8,  title: 'Adoration of the Magi',           artist: 'Gentile da Fabriano', year: '1423', src: 'wmc', q: 'Gentile da Fabriano Adoration of the Magi Uffizi' },
  { n: 9,  title: 'The Annunciation',                artist: 'Fra Angelico',     year: '1438', src: 'wmc', q: 'Fra Angelico Annunciation San Marco' },
  { n: 10, title: 'Birth of the Virgin',             artist: 'Pietro Lorenzetti', year: '1342', src: 'wmc', q: 'Pietro Lorenzetti Birth of the Virgin' },

  // --- B. Primitivos flamencos / gótico internacional (Norte) ---
  { n: 11, title: 'The Ghent Altarpiece',            artist: 'Jan van Eyck',     year: '1432', src: 'wmc', q: 'Van Eyck Ghent Altarpiece Adoration Mystic Lamb' },
  { n: 12, title: 'The Arnolfini Portrait',          artist: 'Jan van Eyck',     year: '1434', src: 'wmc', q: 'Van Eyck Arnolfini Portrait' },
  { n: 13, title: 'The Crucifixion and the Last Judgment', artist: 'Jan van Eyck', year: '1440', src: 'met', q: 'Van Eyck Crucifixion Last Judgment' },
  { n: 14, title: 'Merode Altarpiece (Annunciation Triptych)', artist: 'Robert Campin', year: '1427', src: 'met', q: 'Campin Annunciation Triptych Merode' },
  { n: 15, title: 'The Descent from the Cross',      artist: 'Rogier van der Weyden', year: '1435', src: 'wmc', q: 'Rogier van der Weyden Descent from the Cross Prado' },
  { n: 16, title: 'The Last Judgment',               artist: 'Rogier van der Weyden', year: '1450', src: 'wmc', q: 'Rogier van der Weyden Beaune Last Judgment' },
  { n: 17, title: 'Portinari Altarpiece',            artist: 'Hugo van der Goes', year: '1475', src: 'wmc', q: 'Hugo van der Goes Portinari Altarpiece Uffizi' },
  { n: 18, title: 'Madonna in the Rose Bower',       artist: 'Stefan Lochner',   year: '1440', src: 'wmc', q: 'Stefan Lochner Madonna Rose Bower Cologne' },
  { n: 19, title: 'Saint Michael Triumphs over the Devil', artist: 'Bartolome Bermejo', year: '1468', src: 'wmc', q: 'Bermejo Saint Michael Triumphant Devil' },
  { n: 20, title: 'The Annunciation',                artist: 'Jan van Eyck',     year: '1436', src: 'wmc', q: 'Van Eyck Annunciation Washington' },

  // --- C. Gótico internacional / manuscritos ---
  { n: 21, title: 'The Wilton Diptych',              artist: 'Anonimo',          year: '1395', src: 'wmc', q: 'Wilton Diptych National Gallery' },
  { n: 22, title: 'Tres Riches Heures - February',   artist: 'Limbourg Brothers', year: '1416', src: 'wmc', q: 'Tres Riches Heures February Limbourg' },
  { n: 23, title: 'Tres Riches Heures - May',        artist: 'Limbourg Brothers', year: '1416', src: 'wmc', q: 'Tres Riches Heures May Limbourg' },
  { n: 24, title: 'The Hunt of the Unicorn',         artist: 'Anonimo',          year: '1500', src: 'met', q: 'Unicorn Tapestries Hunt of the Unicorn' },

  // --- D. Memling / tardío ---
  { n: 25, title: 'Portrait of a Young Man',         artist: 'Hans Memling',     year: '1475', src: 'met', q: 'Memling portrait young man' },
  { n: 26, title: 'The Annunciation',                artist: 'Hans Memling',     year: '1480', src: 'met', q: 'Memling Annunciation' },
  { n: 27, title: 'Madonna and Child',               artist: 'Carlo Crivelli',   year: '1480', src: 'met', q: 'Crivelli Madonna and Child' },
  { n: 28, title: 'The Coronation of the Virgin',    artist: 'Fra Angelico',     year: '1435', src: 'wmc', q: 'Fra Angelico Coronation of the Virgin Louvre' },
];

// ---- Descubrimiento ----
// Met: barrido por DEPARTAMENTO medieval (no por autor: el gótico es anónimo).
// Subjects que aparecen en TÍTULOS de arte religioso gótico; depto + fecha acotan la época.
export const MET_SUBJECTS_03 = [
  'Virgin and Child', 'Madonna', 'Crucifixion', 'Annunciation', 'Nativity',
  'Lamentation', 'Coronation of the Virgin', 'Pieta', 'Last Judgment', 'altarpiece',
];
export const MET_DEPTS_PREF_03 = new Set([
  'Medieval Art', 'The Cloisters', 'European Paintings', 'The Robert Lehman Collection',
]);
export const MET_DATE_03 = { min: 1150, max: 1500 }; // ventana gótica/medieval tardía

export const WMC_CATEGORIES_03 = [
  'Gothic paintings', 'International Gothic', 'Trecento paintings',
  'Early Netherlandish paintings', 'Gothic panel paintings',
  '15th-century illuminated manuscripts', 'Gothic ivory', 'Madonna and Child paintings',
];
