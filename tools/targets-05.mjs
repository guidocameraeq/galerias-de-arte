// Targets curados de la colección 05 (Egipcio). Met "Egyptian Art" (dept 10).
// Met-dominante: las primaryImages del Met son dominio público (limpio). Los íconos
// fuera del Met (Nefertiti/Tutankamón) tienen derechos de foto sobre el objeto 3D ->
// se evitan. En Wikimedia se prioriza lo 2D (papiros, retratos de Fayum) vía el filtro
// de licencia. La colección se arma sobre todo con el BARRIDO del departamento.
export const TARGETS_05 = [
  { n: 1,  title: 'Hippopotamus (William)',          artist: 'Anonimo', year: '1961 BC', src: 'met', q: 'Hippopotamus William faience' },
  { n: 2,  title: 'Seated Statue of Hatshepsut',     artist: 'Anonimo', year: '1479 BC', src: 'met', q: 'Seated Statue of Hatshepsut' },
  { n: 3,  title: 'Large Kneeling Statue of Hatshepsut', artist: 'Anonimo', year: '1479 BC', src: 'met', q: 'Large Kneeling Statue of Hatshepsut' },
  { n: 4,  title: 'The Temple of Dendur',            artist: 'Anonimo', year: '10 BC', src: 'met', q: 'Temple of Dendur' },
  { n: 5,  title: 'Fragmentary Head of a Queen',     artist: 'Anonimo', year: '1353 BC', src: 'met', q: 'Fragmentary Head of a Queen yellow jasper' },
  { n: 6,  title: 'Sphinx of Senwosret III',         artist: 'Anonimo', year: '1878 BC', src: 'met', q: 'Sphinx of Senwosret III' },
  { n: 7,  title: 'Statue of Sahure and a Nome God', artist: 'Anonimo', year: '2458 BC', src: 'met', q: 'Sahure and a Nome God' },
  { n: 8,  title: 'Coffin of Khnumnakht',            artist: 'Anonimo', year: '1850 BC', src: 'met', q: 'Coffin of Khnumnakht' },
  { n: 9,  title: 'Relief from the Tomb of Perneb',  artist: 'Anonimo', year: '2381 BC', src: 'met', q: 'Tomb of Perneb relief offering' },
  { n: 10, title: 'Statuette of Isis and Horus',     artist: 'Anonimo', year: '680 BC', src: 'met', q: 'Isis nursing Horus statuette' },
  { n: 11, title: 'Statuette of a Cat',              artist: 'Anonimo', year: '664 BC', src: 'met', q: 'statuette of a cat Bastet' },
  { n: 12, title: 'Book of the Dead Papyrus',        artist: 'Anonimo', year: '1000 BC', src: 'met', q: 'Book of the Dead papyrus' },
  { n: 13, title: 'Mummy Portrait of a Young Woman', artist: 'Anonimo', year: '150', src: 'met', q: 'mummy portrait young woman encaustic Fayum' },
  { n: 14, title: 'Faience Bowl with Lotus',         artist: 'Anonimo', year: '1479 BC', src: 'met', q: 'faience bowl lotus pond' },
  { n: 15, title: 'Head of a Pharaoh',               artist: 'Anonimo', year: '2000 BC', src: 'met', q: 'colossal head pharaoh granite' },
];

// ---- Descubrimiento (motor principal de esta colección) ----
// Términos distintivos egipcios que aparecen en TÍTULO/cultura/clasificación del Met.
export const MET_SUBJECTS_05 = [
  'Hatshepsut', 'sphinx', 'sarcophagus', 'coffin', 'mummy', 'scarab', 'Osiris',
  'Amun', 'Isis', 'Horus', 'Anubis', 'pharaoh', 'relief', 'stela', 'faience',
  'Book of the Dead', 'canopic', 'Akhenaten', 'amulet', 'shabti', 'Senwosret',
  'Thutmose', 'Nefertiti', 'falcon', 'cartonnage',
  // refuerzo (el Met es el motor: más artefactos reales)
  'Ramesses', 'Tutankhamun', 'obelisk', 'ostracon', 'Amarna', 'papyrus',
  'jewelry Egyptian', 'goddess', 'temple relief', 'funerary', 'tomb', 'cat',
];
export const MET_DEPTS_PREF_05 = new Set(['Egyptian Art']);
export const MET_DATE_05 = {}; // sin filtro de fecha (todo es antiguo)
export const MAX_YEAR_05 = 1000; // no hay arte egipcio antiguo post ~800 d.C.: corta TODO lo
                                 // moderno (1890/1994/2023) y, siendo a.C.-consciente, deja los BC y Fayum (120 d.C.)

// Sin 'Book of the Dead'/'Papyrus of Ani': llenas de facsímiles modernos (Wasserman/Budge).
export const WMC_CATEGORIES_05 = [   // 2D seguro (el filtro de licencia PD descarta fotos con derechos)
  'Ancient Egyptian papyri', 'Ancient Egyptian tomb paintings',
  'Fayum mummy portraits', 'Ancient Egyptian reliefs in the Metropolitan Museum of Art',
];
