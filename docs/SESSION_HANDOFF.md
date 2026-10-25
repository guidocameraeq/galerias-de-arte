# SESSION_HANDOFF — Arte

> Save game del proyecto. `cierre` lo SOBREESCRIBE ENTERO en cada sesión — acá nunca se apila historia (eso vive en CHANGELOG). Los números de estado se copian de `node tools/audit.mjs`, nunca de memoria. No guarda SHA: `git log` lo da.

**Cierre**: 2026-10-25

## Qué se hizo
- **Nueva Colección 18 (Escultura Griega y Arqueología Antigua, 64 obras maestras):** Se diseñó la separación bipolar para la TV (escultura vs. pintura). Se migraron limpiamente las 9 esculturas clásicas de la 01 hacia la 18 y se cosecharon 55 obras en alta resolución (40 de museos de Grecia: NAMA de Atenas, Acrópolis, Delfos, Olimpia, Heraclión + 15 de museos internacionales: Louvre, Vaticano, Nápoles, Roma).
- **Expansión Épica de la Colección 01 (Pinacoteca Mitológica, 142 obras):** Tras migrar las esculturas, la colección 01 quedó como pinacoteca pura. Se sumaron 35 pinturas mitológicas iniciales y una segunda tanda curada de 42 pinturas épicas orientadas a hazañas y drama cósmico (Zeus y la Titanomaquia, los 8 trabajos de Hércules de Zurbarán del Prado, Perseo petrificando ejércitos, Prometeo encadenado de Rubens, el Tártaro de Tiziano, la Ilíada y la Odisea).
- **Integración de `dark_art` (carpeta externa del usuario):** Se auditó `C:\Users\Usuario\Desktop\Draco\dark_art`. Se aplicaron 8 upgrades masivos de resolución (destacando la corrección histórica de Goya *Saturno devorando a su hijo*, reemplazando el boceto a tiza por el óleo mural de las Pinturas Negras del Prado; Friedrich *Monje junto al mar* a 3500 px; Caravaggio *Crucifixión de San Pedro* a 10.537 px / 86 MP, etc.), se ingresaron 8 obras nuevas en colecciones 02, 03, 04, 06 y 07, y la carpeta externa fue enviada de forma segura a la Papelera de Reciclaje de Windows.
- **Nueva Colección 19 (Marcelo Canevari, 25 obras maestras):** Monografía de arte contemporáneo argentino y "Gótico rioplatense". Obras en Ultra HD (hasta 5472 px) desde Mindy Solomon Gallery, Galería COTT y Commons (*La fiesta del fuego* bifaz de 5400 px, *La hora de las brujas*, *El llamado de la noche*, *Iberá*, *Diecisiete fantasmas*, y la tapa original al óleo de *Post Mortem* de Dillom).
- **Nueva Colección 20 (Alfred Kubin, 41 obras maestras):** Monografía del maestro austríaco del simbolismo oscuro y la pesadilla. Se detectaron y descartaron 33 placeholders grises vacíos del Leopold Museum, conservando 35 obras reales en 3500 px, más 4 piezas de 2000 px del Lenbachhaus (*Der Krieg*, ilustraciones de *Die andere Seite*, *Nach der Schlacht*) y 2 de MoMA/Commons.
- **Nueva Colección 21 (Rob Gonsalves, 25 obras maestras):** Monografía del pintor canadiense de realismo mágico e ilusiones ópticas (*The Sun Sets Sail*, *Sailing Islands*, *Here Comes the Flood*, *Wilderness Gothic*, *Bedtime Aviation*, *Musical Chairs*, etc.) en resoluciones de 1000 a 3000 px desde su Estate oficial y galerías representativas.
- **Robustez y tooling:** Adaptado `tools/remove-work.mjs` para soportar fichas multilínea, `tools/apply-desc.mjs` para soportar prefijos numéricos de colecciones, y harvesters con detección en disco e idempotencia estricta. Actualizados todos los contratos documentales (`AGENTS.md`, `INVENTARIO.md`, `DESCRIPCIONES.md`, `METODO.md`, `tools/README.md`).

## Estado verificado (salida de `node tools/audit.mjs`)
- `TOTAL: 21 colecciones · 1333 obras · 1333 con ficha · 7.34 GB · 0 FALLAS · 61 AVISOS`
- Los avisos son informativos preexistentes (31 `W-EXT` por archivos PNG/WebP servidos con extensión .jpg que no se convierten destructivamente, 5 `W-N-GAP` por huecos históricos en numeración, 6 `W-QID-DUP` por obras que comparten QID temático, y 19 `W-RES` por obras bajo 1000 px ya aceptadas).

## En curso
- Nada a medias. 100% de obras descargadas, indexadas, con fichas autoradas en español y verificadas en disco.

## Próximo paso CONCRETO
- Decidir los puntos pendientes del `docs/TODO.md` 🟠:
  1. Si se renombran o mantienen los 31 archivos `W-EXT` (PNG/WebP en JPG).
  2. Si se vacían o eliminan definitivamente las carpetas `_dedup_removed/` (como la de la col 17).
  3. Revisión/justificación de los 19 casos `W-RES` en `docs/CALIDAD.md §4`.
  4. Si el usuario desea extraer obras adicionales de Rob Gonsalves del banco de reserva (26 obras ya identificadas).

## Bloqueos
- Ninguno técnico.

## Archivos tocados
- Creados: `18_escultura_griega/**`, `19_marcelo_canevari/**`, `20_alfred_kubin/**`, `21_rob_gonsalves/**`.
- Tools creadas: `tools/targets-{18-sculptures,01-paintings,01-epic-myths,19-canevari,20-kubin,21-gonsalves}.mjs`, `tools/harvest-{18-sculptures,01-paintings,01-epic-myths,19-canevari,20-kubin,21-gonsalves}.mjs`, `tools/migrate-greek-sculptures.mjs`, `tools/integrate-dark-art.mjs`, `tools/desc/{18,19,20,21}.mjs`.
- Modificados: `_index.json` de colecciones `01`, `02`, `03`, `04`, `06`, `07`; `tools/desc/{01,02,03,04,06,07}.mjs`; `AGENTS.md`, `docs/{INVENTARIO,DESCRIPCIONES,METODO,TODO,CHANGELOG,SESSION_HANDOFF}.md`, `tools/{README,apply-desc,remove-work}.mjs`.

## Contexto que no está en otro doc
- La carpeta `C:\Users\Usuario\Desktop\Draco\dark_art` fue analizada, contrastada y eliminada hacia la Papelera de Reciclaje de Windows; las 8 obras únicas ingresaron a sus respectivas carpetas y los 8 upgrades fueron pisados sobre los archivos existentes con sus metadatos sincronizados.
