// Targets curados de la colección 02 (Barroco). Eje: claroscuro / tenebrismo.
// src: 'met' | 'cle' (Cleveland) | 'wmc' (Wikimedia Commons). q: query de búsqueda.
// (Sin duplicar la 01: Caravaggio Baco/Medusa/Los músicos y Rokeby Venus ya están allá.)
export const TARGETS_02 = [
  // --- A. Caravaggio ---
  { n: 1,  title: 'The Calling of Saint Matthew',  artist: 'Caravaggio', year: '1600', src: 'wmc', q: 'Caravaggio Calling of Saint Matthew' },
  { n: 2,  title: 'Judith Beheading Holofernes',   artist: 'Caravaggio', year: '1599', src: 'wmc', q: 'Caravaggio Judith Beheading Holofernes' },
  { n: 3,  title: 'The Supper at Emmaus',          artist: 'Caravaggio', year: '1601', src: 'wmc', q: 'Caravaggio Supper at Emmaus London' },
  { n: 4,  title: 'The Conversion of Saint Paul',  artist: 'Caravaggio', year: '1601', src: 'wmc', q: 'Caravaggio Conversion on the Way to Damascus' },
  { n: 5,  title: 'The Crucifixion of Saint Andrew', artist: 'Caravaggio', year: '1607', src: 'cle', q: 'Caravaggio Crucifixion of Saint Andrew' },
  { n: 6,  title: 'The Denial of Saint Peter',     artist: 'Caravaggio', year: '1610', src: 'met', q: 'Caravaggio Denial of Saint Peter' },
  { n: 7,  title: 'David with the Head of Goliath', artist: 'Caravaggio', year: '1610', src: 'wmc', q: 'Caravaggio David Goliath Borghese' },
  { n: 8,  title: 'The Taking of Christ',          artist: 'Caravaggio', year: '1602', src: 'wmc', q: 'Caravaggio Taking of Christ Dublin' },

  // --- B. Tenebristas y caravaggisti ---
  { n: 9,  title: 'Judith Slaying Holofernes',     artist: 'Artemisia Gentileschi', year: '1620', src: 'wmc', q: 'Artemisia Gentileschi Judith Slaying Holofernes Uffizi' },
  { n: 10, title: 'Self-Portrait as the Allegory of Painting', artist: 'Artemisia Gentileschi', year: '1639', src: 'wmc', q: 'Artemisia Gentileschi Self-Portrait Allegory of Painting' },
  { n: 11, title: 'The Penitent Magdalen',         artist: 'Georges de La Tour', year: '1640', src: 'met', q: 'Georges de La Tour Penitent Magdalen' },
  { n: 12, title: 'The Fortune Teller',            artist: 'Georges de La Tour', year: '1630s', src: 'met', q: 'Georges de La Tour Fortune Teller' },
  { n: 13, title: 'The Newborn',                   artist: 'Georges de La Tour', year: '1648', src: 'wmc', q: 'Georges de La Tour Newborn Nouveau-ne Rennes' },
  { n: 14, title: 'The Clubfoot',                  artist: 'Jusepe de Ribera', year: '1642', src: 'wmc', q: 'Ribera Clubfoot Pied-bot Louvre' },
  { n: 15, title: 'The Martyrdom of Saint Philip', artist: 'Jusepe de Ribera', year: '1639', src: 'wmc', q: 'Ribera Martyrdom of Saint Philip Prado' },
  { n: 16, title: 'Adoration of the Shepherds',    artist: 'Gerrit van Honthorst', year: '1622', src: 'wmc', q: 'Honthorst Adoration of the Shepherds' },

  // --- C. España (Siglo de Oro) ---
  { n: 17, title: 'Las Meninas',                   artist: 'Velazquez', year: '1656', src: 'wmc', q: 'Velazquez Las Meninas Prado' },
  { n: 18, title: 'Juan de Pareja',                artist: 'Velazquez', year: '1650', src: 'met', q: 'Velazquez Juan de Pareja' },
  { n: 19, title: 'The Surrender of Breda',        artist: 'Velazquez', year: '1635', src: 'wmc', q: 'Velazquez Surrender of Breda Las Lanzas' },
  { n: 20, title: 'Portrait of Pope Innocent X',   artist: 'Velazquez', year: '1650', src: 'wmc', q: 'Velazquez Pope Innocent X Doria' },
  { n: 21, title: 'The Waterseller of Seville',    artist: 'Velazquez', year: '1620', src: 'wmc', q: 'Velazquez Waterseller of Seville' },
  { n: 22, title: 'Agnus Dei',                     artist: 'Zurbaran',  year: '1640', src: 'wmc', q: 'Zurbaran Agnus Dei Prado' },
  { n: 23, title: 'Saint Francis in Meditation',   artist: 'Zurbaran',  year: '1639', src: 'wmc', q: 'Zurbaran Saint Francis in Meditation' },
  { n: 24, title: 'The Immaculate Conception',     artist: 'Murillo',   year: '1678', src: 'wmc', q: 'Murillo Immaculate Conception Soult Prado' },

  // --- D. Países Bajos (Siglo de Oro holandés) ---
  { n: 25, title: 'The Night Watch',               artist: 'Rembrandt', year: '1642', src: 'wmc', q: 'Rembrandt Night Watch Rijksmuseum' },
  { n: 26, title: 'The Anatomy Lesson of Dr Nicolaes Tulp', artist: 'Rembrandt', year: '1632', src: 'wmc', q: 'Rembrandt Anatomy Lesson Doctor Tulp' },
  { n: 27, title: 'Aristotle with a Bust of Homer', artist: 'Rembrandt', year: '1653', src: 'met', q: 'Rembrandt Aristotle with a Bust of Homer' },
  { n: 28, title: "Belshazzar's Feast",            artist: 'Rembrandt', year: '1635', src: 'wmc', q: 'Rembrandt Belshazzar Feast' },
  { n: 29, title: 'Self-Portrait',                 artist: 'Rembrandt', year: '1660', src: 'met', q: 'Rembrandt Self-Portrait' },
  { n: 30, title: 'Girl with a Pearl Earring',     artist: 'Vermeer',   year: '1665', src: 'wmc', q: 'Vermeer Girl with a Pearl Earring' },
  { n: 31, title: 'The Milkmaid',                  artist: 'Vermeer',   year: '1658', src: 'wmc', q: 'Vermeer Milkmaid Rijksmuseum' },
  { n: 32, title: 'Young Woman with a Water Pitcher', artist: 'Vermeer', year: '1662', src: 'met', q: 'Vermeer Young Woman with a Water Pitcher' },
  { n: 33, title: 'The Laughing Cavalier',         artist: 'Frans Hals', year: '1624', src: 'wmc', q: 'Frans Hals Laughing Cavalier Wallace' },

  // --- E. Flandes ---
  { n: 34, title: 'The Descent from the Cross',    artist: 'Rubens',    year: '1614', src: 'wmc', q: 'Rubens Descent from the Cross Antwerp' },
  { n: 35, title: 'The Massacre of the Innocents', artist: 'Rubens',    year: '1612', src: 'wmc', q: 'Rubens Massacre of the Innocents' },
  { n: 36, title: 'Charles I at the Hunt',         artist: 'Van Dyck',  year: '1635', src: 'wmc', q: 'Van Dyck Charles I at the Hunt Louvre' },

  // --- F. Italia (barroco clásico) ---
  { n: 37, title: 'Aurora',                        artist: 'Guido Reni', year: '1614', src: 'wmc', q: 'Guido Reni Aurora fresco Rospigliosi' },
  { n: 38, title: 'Samson Captured by the Philistines', artist: 'Guercino', year: '1619', src: 'met', q: 'Guercino Samson Captured by the Philistines' },
  { n: 39, title: 'Saint Cecilia',                 artist: 'Orazio Gentileschi', year: '1620', src: 'wmc', q: 'Orazio Gentileschi Saint Cecilia' },
  { n: 40, title: 'Et in Arcadia ego',             artist: 'Guercino',  year: '1618', src: 'wmc', q: 'Guercino Et in Arcadia ego' },

  // --- G. Opcional: escultura barroca (entra solo si la foto es PD/CC0) ---
  { n: 41, title: 'The Ecstasy of Saint Teresa',   artist: 'Bernini',   year: '1652', src: 'wmc', q: 'Bernini Ecstasy of Saint Teresa Cornaro' },
];

// ---- Descubrimiento (más allá del listado) ----
// Met: por APELLIDO de maestro barroco; se filtra por departamento + rango de fechas
// + que el apellido aparezca (matchArtist). Así se traen sus obras PD en alta.
export const MET_SUBJECTS_02 = [
  'Caravaggio', 'Rembrandt', 'Vermeer', 'Velazquez', 'Rubens', 'Ribera', 'Zurbaran',
  'Murillo', 'Frans Hals', 'Van Dyck', 'La Tour', 'Poussin', 'Claude Lorrain',
  'Guercino', 'Guido Reni', 'Gentileschi', 'Strozzi', 'Valentin', 'Vouet', 'Carracci',
];
export const MET_DEPTS_PREF_02 = new Set([
  'European Paintings', 'Robert Lehman Collection',   // solo pintura (evita dibujos/objetos)
]);
export const MET_DATE_02 = { min: 1580, max: 1780 }; // ventana barroca

export const WMC_CATEGORIES_02 = [   // foco tenebrista/claroscuro (sin la categoría holandesa amplia que arrastra paisajes)
  'Baroque paintings', 'Tenebrism', 'Caravaggisti',
  'Paintings by Caravaggio', 'Paintings by Rembrandt', 'Paintings by Jusepe de Ribera',
  'Paintings by Francisco de Zurbarán', 'Paintings by Diego Velázquez',
  'Paintings by Bartolomé Esteban Murillo', 'Paintings by Georges de La Tour',
];
