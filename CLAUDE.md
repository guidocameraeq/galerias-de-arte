# CLAUDE.md — Memoria del proyecto "Arte"

> Este archivo es la memoria viva del proyecto. Leelo al empezar cada sesión y
> actualizalo cuando cambie algo (fuentes, reglas, calibraciones, estado).

## Misión
Construir **colecciones curadas de obras de arte en dominio público**, en alta
resolución, descargadas **exclusivamente vía APIs abiertas de museos**.

**Regla de oro:** la calidad y la relevancia de la obra están por encima de
cualquier criterio de formato. Preferimos **pocas obras excelentes** a muchas
mediocres.

## Colecciones (en orden de prioridad)
1. `01_mitologia_griega_romana` — **LA prioritaria.** Hazañas de dioses, héroes,
   batallas, escenas mitológicas. Ancient (Met dept 13, vasos/escultura/frescos)
   + pintura europea de tema mitológico (Renacimiento → s.XIX).
2. `02_barroco` — pintura clásica barroca, dramática, de claroscuro.
3. `03_gotico` — arte gótico, medieval tardío.
4. `04_romanticismo` — paisajes sublimes, lo dramático, lo épico romántico.
5. `05_egipcio` — Met "Egyptian Art" (dept 10). Arte y artefactos del antiguo Egipto.
6. `06_macabro_memento_mori` — memento mori, vanitas, danza de la muerte, muerte
   mitológica, brujería, lo siniestro secular. Época barroca / semi-renacentista /
   clásica. **EXCLUSIÓN DURA:** nada de temática cristiana religiosa ni de Jesús
   (crucifixiones, escenas devocionales de Cristo). Por ahora queda afuera.

## Fuentes (en este orden — PROHIBIDO scrapear)
Solo APIs oficiales. Prohibido scrapear Google Arts & Culture, navegadores o
sitios HTML, salvo pedido explícito para una obra puntual.

1. **The Met** — `https://collectionapi.metmuseum.org/public/collection/v1/`
   sin API key. Endpoints: `/departments`, `/objects`, `/objects/{id}`,
   `/search?q=...`. Campos útiles por objeto: `primaryImage` (original alta res),
   `isPublicDomain`, `title`, `artistDisplayName`, `objectDate`, `medium`,
   `classification`, `culture`, `department`.
   - **Departamentos:** `Egyptian Art = 10`, `Greek and Roman Art = 13`.
2. **Art Institute of Chicago** — `https://api.artic.edu/api/v1/artworks`
   sin key, IIIF. Dimensiones conocibles antes de bajar vía `info.json`.
3. **Cleveland Museum of Art** — `https://openaccess-api.clevelandart.org/api/artworks/`
   sin key, CC0. Filtro `?cc0=1` y `?has_image=1`.
4. **Wikimedia Commons** — el volumen más grande; clave para los íconos que están
   en museos europeos NO cubiertos por Met/AIC/Cleveland (Botticelli, Tiziano,
   etc.) y para barrer estilos por categorías. API: `commons.wikimedia.org/w/api.php`.
5. **Europeana (opcional)** — requiere API key gratuita. Si no está configurada,
   SALTEAR por ahora. (Estado: sin key.)

## Reglas de filtrado (duras)
- **Licencia (ACTUALIZADO 2026-06-15 — uso personal):** ya NO se filtra por dominio
  público. El proyecto es para uso personal del usuario (slideshow en su TV). Se baja
  la obra **importante igual, tenga o no copyright**. Se **registra** la licencia por
  obra (`license`) pero no se descarta por ella. Las colecciones 01-06 ya hechas son
  PD/CC0; lo nuevo puede no serlo.
  - **Salvedad técnica:** las APIs abiertas solo dan ALTA-RES de lo PD/CC0. Para obras
    modernas con copyright la fuente es despareja y a veces de menor resolución
    (best-effort por obra). Se marca `image_quality` cuando sea baja.
- **La relevancia manda sobre el tamaño.** Si la obra está en `_targets.md`
  (ícono del estilo / top curado), entra **independientemente de dimensiones y
  forma**, siempre que la calidad sea decente. NO descartar por no llegar a Full HD.
- **Piso duro anti-basura: lado largo ≥ 1000 px.** Solo para frenar porquería
  (nada de 480p ni fotos chiquitas/borrosas). Por debajo, descartar. (Ajustable.)
- **Full HD+ (≥1920 px) es PREFERENCIA, no filtro.** Aplicarla solo en el barrido
  de descubrimiento (las obras extra más allá del listado, donde sobra de dónde
  elegir): ahí preferir las más grandes y apuntar a 4K+. Nunca dejar afuera una
  obra importante por esto.
- Para cada obra, **bajar siempre la versión más grande disponible.**
- **Verificar dimensiones reales:** AIC vía IIIF `info.json` antes de bajar; Met
  midiendo el `primaryImage` (ver "Medición" abajo).
- Tiene que tener imagen primaria disponible y descargable.

## Formato / aspect ratio
- **NO recortar, NO editar, NO retocar.** Se respeta el formato y la imagen
  original tal cual.
- **NO filtrar ni descartar por aspect ratio.** Vertical o cuadrada entra igual.
- Separar cada obra por orientación en subcarpetas `landscape/` y `portrait/`
  (apaisadas = wallpaper PC; verticales = celular). Criterio: `w >= h` → landscape,
  si no → portrait. (Cuadradas van a `landscape/`.)

## Convención de nombres
`NN_Titulo_Autor_Año.jpg` — numeración correlativa por colección, **sin acentos,
sin caracteres raros, sin espacios** (guion bajo). Año desconocido → `sa` (sine anno).
Ej: `03_Saturno_devorando_a_su_hijo_Goya_1823.jpg`.

## Metadata (sin catálogo por ahora)
- Datos clave codificados en el nombre del archivo.
- Un `_index.json` por colección con, por obra: `n`, `file`, `orientation`,
  `title`, `artist`, `artist_museum`, `year`, `classification`, `museum`, `license`,
  `source_url`, `image_url`, `width`, `height`, `bytes`, `sourceId`, `kind`.
- **Descripción (opcional, vía `enrich-desc.mjs`):** campos `description` (resumen
  corto) + `description_source`. Prioridad: Cleveland (texto curatorial propio) →
  Wikipedia (artículo de la obra; si no, del mito, marcado `(tema)`) → Met (ficha:
  medium+cultura+tags) → Commons (caption). El matcher verifica autor/título sin
  acentos y **rechaza la biografía del autor** (no es la obra). Sin re-descargar
  imágenes; idempotente (salta lo ya intentado por `description_source`).

## Estructura de carpetas
```
/  (raíz)
├── CLAUDE.md, PLAN.md
├── tools/            ← scripts Node reutilizables (motor de descarga/medición)
├── _descartes/       ← logs de lo descartado (jsonl por colección) y por qué
├── 01_mitologia_griega_romana/
│   ├── _targets.md   ← listado curado de obras objetivo
│   ├── _index.json   ← metadata de lo encontrado
│   ├── landscape/  · portrait/
├── 02_barroco/ ... 06_macabro_memento_mori/   (misma estructura)
```

## Entorno técnico (esta máquina)
- **Windows 11 + PowerShell.** Shell por defecto PowerShell; bash disponible.
- **NO hay Python ni Pillow.** Hay **Node.js v26** → es el motor de todo
  (descarga con `fetch` nativo + medición de imágenes parseando cabeceras).
- `winget` disponible por si hace falta instalar algo. ImageMagick NO instalado.

### Medición de dimensiones sin Pillow (validado)
- **JPEG:** parsear marcadores SOF (`0xFFC0–0xFFCF` excepto C4/C8/CC) → alto/ancho.
- **PNG:** IHDR en offset 16 (ancho/alto big-endian de 4 bytes).
- **Met:** `fetch(primaryImage, {headers:{Range:"bytes=0-131071"}})` devuelve 206
  y con 128 KB alcanza para leer las dimensiones **antes** de bajar el original
  completo. Si el server no soporta Range, bajar entero y medir.
- **AIC:** dimensiones reales desde `https://www.artic.edu/iiif/2/{image_id}/info.json`.
- Implementación reutilizable en `tools/lib.mjs`.

## Manejo por fuente (decisiones técnicas tomadas)
- **Cleveland sirve el `full` como TIFF** (p.ej. 8314×12044). El parser solo lee
  JPEG/PNG y no hay conversor (sin Pillow/ImageMagick) → se baja el **`print`
  (JPEG, ~3400px)**, que es la mejor versión usable; las dimensiones salen de la
  API (`images.*.width/height`), no se miden. Se anota en `note` que existe el TIFF.
- **Wikimedia: techo de lado largo = 8000px** (`WMC_LONG_CAP`). Si el original es
  más grande (p.ej. el gigapíxel del Uffizi de 30000px), se baja un **render JPEG
  de Commons a 8000** (`iiurlwidth`), nunca el monstruo de 100+ MB. Nunca se
  upscalea. Si el original no es JPEG (png/tif) se renderiza a JPEG a su ancho.
- **OJO — Wikimedia CLAMPEA los renders grandes** a ~3840px de ancho (cuanto más
  grande la fuente, más chico el thumb máximo: una fuente enorme cayó a 1920). La
  API *promete* (`thumbwidth`) un tamaño que el server no entrega. **Regla de oro:
  medir SIEMPRE el archivo descargado, no confiar en lo que promete la API.**
  `collect.mjs` ya re-mide el buffer real post-descarga y guarda esas dimensiones;
  `fix-dims.mjs` re-mide del disco como verificación. (Los JPEG ≤8000 se bajan como
  original a resolución completa, sin pérdida; el clamp solo afecta a renders.)
- **Scoring de match en Wikimedia:** el **nombre del archivo** pesa mucho más que la
  descripción (la descripción puede nombrar la obra aunque sea foto de una réplica
  /instalación → caso real: una foto del *Gasometer Oberhausen* matcheaba "Primavera").
  Filtro de palabras-veneno (detail/copy/engraving/installation/replica/…). Entre
  candidatos válidos se **prefiere el que cumpla el piso de 1000px** y, dentro de eso,
  mayor score y mayor tamaño.
- **Nombre de archivo de targets nombrados:** se usa el **autor curado** (mi research)
  y no el campo `Artist` de Wikimedia (que suele traer el usuario que subió la foto:
  "Daderot", "Commonists"…). El autor del museo se guarda igual en `_index.json`
  como `artist_museum`.
- **Esculturas:** una foto de obra 3D NO es PD automáticamente (el fotógrafo tiene
  derechos). Solo entran si la foto está marcada PD/CC0. Varias (Giambologna) no
  tienen foto libre → se descartan legítimamente.

## Calibraciones de API aprendidas (IMPORTANTE)
- **Met:** combinar `hasImages=true` con `departmentId` en `/search` **DEVUELVE 0**
  (bug/sobre-restricción). Soluciones:
  - Búsqueda por término: `search?q=TERM&hasImages=true` (global) y filtrar el
    departamento/licencia en el detalle de cada `/objects/{id}`.
  - Barrido de departamento: `/objects?departmentIds=13` (trae TODOS los IDs del
    dept, sin imágenes garantizadas) → filtrar en el detalle.
- Met `/search` ignora mayúsculas; ojo con grafías (Dionysos vs Dionysus dan
  resultados parecidos pero no idénticos → probar variantes).

## Buenas prácticas operativas
- **Throttle:** pausas entre requests (~150–250 ms Met; respetar rate limits).
  AIC pide User-Agent identificable (`AI-Project (email)`).
- **Idempotente:** si la obra ya está descargada (mismo objectID/id en `_index.json`),
  NO volver a bajar.
- **Loguear descartes** en `_descartes/COLECCION.jsonl` con motivo (low_res,
  not_public_domain, no_image, dup, off_topic).
- Tras cada colección: resumen de cuántas entraron y cuántas se descartaron.

## Tooling (carpeta `tools/`)
- `lib.mjs` — núcleo: slugify/buildFilename, medición JPEG/PNG, measureRemote (Range),
  getJSON con reintentos, downloadTo (devuelve buffer), índice/idempotencia, descartes,
  limpieza de metadata (cutQS/cleanArtist/cleanYear/cleanTitle, idempotentes).
- `resolve.mjs` — resolutores de targets nombrados (Met/Cleveland/Wikimedia) con scoring.
- `discover.mjs` — barrido de descubrimiento (Met subjects+dept, Wikimedia categorías).
- `targets-01.mjs` — datos curados de la colección 01 (targets + subjects + categorías).
- `collect.mjs` — runner: resuelve+descubre+descarga+clasifica+indexa+mide real.
- `cleanup-names.mjs` — normaliza metadata y renombra (re-ejecutable, idempotente).
- `fix-dims.mjs` — re-mide del disco y corrige dims/orientación (verificación).
- `enrich-desc.mjs` — agrega `description`+`description_source` (Cleveland/Wikipedia/
  Met/Commons) con match verificado; sin re-bajar; idempotente.
- `dryrun.mjs` — resuelve targets y reporta sin descargar (para revisar matches).

## Calibraciones de descubrimiento aprendidas (02-06)
- **Anti-basura moderna/IA:** las categorías temáticas amplias de Wikimedia ('Mountains
  in art', 'Skulls in art', 'Marine paintings') traen arte digital/IA/contemporáneo.
  Usar SOLO categorías por-artista o de escuela acotada. Además: filtro de palabras-veneno
  `MODERN` (exoplanet/3d/render/digital/AI…) + `maxYear` por colección (04→1900, 06→1910).
- **maxYear a.C.-consciente (05 egipcio):** no hay arte egipcio antiguo post ~800 d.C., así
  que `maxYear=1000` con detección de "BC/BCE" mata facsímiles/fotos modernas (Wasserman
  1994, Budge 1890) y deja los artefactos a.C. y los Fayum (120 d.C.). Veneno: facsimile/
  published by/photographed by/wallis budge/conservator/library of congress.
- **Dedup por CONTENIDO (no solo id):** título+autor (4 palabras) y autor+dimensiones
  exactas. Cazó 3× *The Natchez* de Delacroix en la 04.
- **Robustez:** `downloadTo` reintenta con backoff (un fallo de red "terminated" cortaba todo).
- **Nombre de institución como autor** (Rijksmuseum, etc.) -> Anónimo en `cleanArtist`.

## Fase 2 — Roadmap (decisiones 2026-06-15)
Objetivo: descripciones "con sentido" + visor con globito para TV + expansión del canon.

### Descripciones (ficha / globito) — meaning-focused, en ESPAÑOL
- Las **escribe el agente sintetizando fuentes** (Wikipedia intro+análisis, texto curatorial),
  NO de memoria. Enfoque: *qué muestra y qué significa*, no ficha de museo seca. Guardar
  `description_source` para trazabilidad; donde la fuente es pobre, quedarse factual sin inventar.
- **Campos del globito:** `title` · `year` — `artist` · `school` — `type/medium` · `museum`
  + descripción. Tamaño chico (no debe molestar).
- Pendiente de confirmar: globito con 1 línea + párrafo largo guardado aparte (recomendado),
  o 2-3 frases directas. Idioma: **español**.

### Clasificación — "guardar una vez, ver de muchas formas"
- **Físico (carpetas): un solo eje = escuela/época** (lo actual). Las obras del canon caen ahí.
- **Vistas generadas del índice (sin duplicar archivos):** por autor, por museo, por año,
  por `canon_rank`. El visor HTML filtra en vivo. NO duplicar carpetas por eje.
- Campos nuevos en `_index.json`: `school`, `type`, `canon_rank` (fama Wikidata), `description`(es).

### Fuentes — modelo en 3 niveles
- **Nivel 1 — APIs de museo (metadata limpia + descripciones propias):** Met, Cleveland, AIC
  (subusadas: elevar) + sumar **NGA Washington (CC0)**, **Rijksmuseum** (API propia), **Smithsonian**.
  Son sobre todo museos de EE.UU. + holandés.
- **Nivel 2 — Wikimedia + Wikidata (agregador de TODOS los museos, incl. europeos):** el Louvre,
  Prado, Uffizi, National Gallery, Vaticano **NO tienen API abierta de alta-res** → Wikimedia ES la
  vía para su PD. Las obras europeas top **ya entran por acá**. Wikidata: (a) **fame-ranking**
  (sitelinks = nº de idiomas) para el top-canon y para puntuar descubrimiento; (b) **backfill del
  museo real** (P195) para las 238 obras hoy con `museum=Wikimedia` → arregla la vista "por museo"
  y llena el campo Museo del globito. (Match por título + autor para no traer homónimos.)
- **Nivel 3 — Navegador (Chrome MCP) — best-effort, caso por obra:** obras **con copyright** (s.XX,
  Guernica…) y gigapíxeles que no salen por API. Visores de zoom / Google Arts&Culture / sitio del
  museo. Calidad despareja; se arma cuando lleguemos al canon moderno.

### Top-canon
- Bajar de Wikidata el top-N de pinturas/esculturas por fama → buscar imagen (PD por API; moderna
  best-effort) → dedup contra lo ya bajado → cae en su carpeta de escuela con `canon_rank`.
- Techo: el s.XX con copyright es difícil de conseguir en alta-res (ver salvedad de licencia).

### Visor / globito (paso futuro)
- **Opción A elegida:** copia con texto QUEMADO (`_captioned/`) para el modo reposo nativo de la TV.
  No toca los originales. Probable upgrade: visor HTML casteable con globito flotante real.
- Para quemar texto sin Pillow: instalar ImageMagick (winget) o lib de Node.

### Orden de ejecución acordado
1) Reescribir descripciones de las 331 actuales (es, meaning-focused). 2) Prototipo visor/globito.
3) En paralelo: sumar fuentes + arrancar top-canon (por época o movimiento, a confirmar).

## Fase 3 — Canon Europeo (adquisición Wikidata-first)
Objetivo: sumar las obras europeas MÁS importantes (ranking de fama real), organizadas por movimiento.
- **Mecanismo (el "cómo"):** por cada obra, `QID Wikidata → P18 (imagen) → Special:FilePath (full-res)
  → medir/capar 8000 → indexar`. El **museo (P195), fama (sitelinks), movimiento (P135), año (P571) y
  autor (P170)** salen del MISMO item → metadata precisa y SIN lío de versiones (bajamos la imagen propia
  de esa obra, no una homónima). Más limpio que el método targets+barrido de 01-06.
  - Ranking rápido: `?item wikibase:sitelinks ?n` (precalculado; NO usar COUNT → timeout).
  - Dedup contra todo lo ya bajado (QID + título+autor).
- **Organización:** nuevas colecciones por movimiento (`07_alto_renacimiento`, `08_impresionismo`,
  `09_postimpresionismo`, luego realismo/rococó/simbolismo/El Greco…). Mismo pipeline de descripción.
- **Copyright (2 vías):** PD (hasta ~1900) por Wikidata/Wikimedia, alta-res = el grueso. Modernas con
  copyright (Guernica, Picasso, Dalí…) = vía aparte con Chrome MCP (zoom/Arts&Culture), best-effort,
  marcadas `image_quality`; se hacen al final.
- Tool nuevo a crear: `canon.mjs` (query Wikidata + dedup + descarga P18 + índice con museo/fama/movimiento/año).

## Fase 4 — Modernas con copyright + revisión con navegador (MANDATO AUTÓNOMO)
**Mandato del usuario (2026-06-15):** trabajar en secuencia, tomar TODAS las decisiones, completar
los módulos modernos (13-15) y LUEGO **revisar 01-12 con el navegador (Chrome MCP)** para que no se
pierdan piezas importantes por baja resolución. Al terminar: reporte final + resumen de decisiones.
Si se acerca una compactación, actualizar esta doc y el PLAN. **El usuario está ausente.**

**Hallazgos de investigación (en vivo):**
- **Google Arts & Culture: gigapíxel NO extraíble.** Tiles encriptados (JPEG con Huffman corrupto a
  propósito + 4 bytes basura de prefijo `0a0a0a0a`), token **por-tile** (no por-obra), y **CORS** →
  ni canvas del navegador ni libvips/sharp los decodifican ("Bogus Huffman table"). Solo el JS del
  visor los desencripta a blobs same-origin. Reconstruir = reversear su cifrado: frágil, no vale.
- **WikiArt = mejor fuente fácil pero DESPAREJA.** El **original** (URL sin sufijo `!`) es lo más
  grande: Guernica 3369px, *Old Guitarist* 5472px, pero Kandinsky 1135, Yellow-Red-Blue 824. Algunos
  íconos ni aparecen por HTTP (su búsqueda es **JS-rendered** → hay que resolver el slug en el navegador).
- **Decisión de calidad:** regla de oro = pocas excelentes. **Podar modernas <~1000px**; recuperar las
  importantes con el navegador (search JS de WikiArt / mejor versión); stitch de GA&C **descartado**
  (demasiado frágil para desatendido).

**Tooling Fase 4:**
- `wikiart.mjs` + configs `tools/wikiart/<col>.mjs` — baja de WikiArt el original más grande (reintentos).
- Navegador **"Perseo"** (deviceId 9a914fd1-399c-4cb0-8a16-4710e154dc81) ya seleccionado para Chrome MCP.
- `sharp` y `jimp` instalados (npm) por si hace falta procesar imágenes.

**Colecciones nuevas:** 13 Vanguardias · 14 Surrealismo · 15 Arte moderno americano/Pop.

## Estado general
**Para retomar tras compactación: leer `START_HERE.md` primero**, luego este archivo, `PLAN.md` y `tools/README.md`.
Ver `PLAN.md` para el estado por colección y el log de avance.
- **2026-06-28:** **17 COLECCIONES, 1102 OBRAS, ~5.8 GB, 1102 con ficha (100%), 0 huérfanos.**
  **Rescate de la col 17 (Doré):** los **155 archivos eran páginas de error HTML** (2 KB) — la descarga
  full-res original fue rate-limited (429) y Wikimedia sirvió un error con HTTP 200 que `downloadTo`
  guardó como `.jpg`. Re-bajados los 155 full-res con `dore-redownload.mjs` (URLs vía imageinfo,
  **valida magic bytes FF D8**, throttle serial). **Lección dura:** `downloadTo` NO valida contenido →
  para Wikimedia validar magic bytes + throttle; barrer integridad por magic bytes de todo el índice.
  **Dedup visual 155→98:** las ~4 ediciones (alemana "Göttliche Komödie", "Vision of Hell", etc.)
  duplicaban cada plancha 2-4×; revisión por hojas de contacto (`dore-montage.mjs`) + dHash 256-bit
  calibrado (`dore-dedup.mjs`); 57 dups/junk (incl. 1 imagen de libro de astronomía 1904 colada)
  **movidos** a `17_dore.../​_dedup_removed/` (recuperable, 690 MB) vía `dore-dedup-apply.mjs`.
  **+8 fichas a mano** (05/10/13/16) → 100% descritas. **Afrodita de Siracusa** tenía autor falso
  ("Antonio Canova"; es grecorromana anónima) → corregida y **movida 16→01** (`move-aphrodite.mjs`).
  Verificado: Ernst "Europa después de la lluvia" NO es recorte (formato real 54,8×147,8 cm). Tools nuevos:
  `dore-redownload`, `dore-dedup`, `dore-dedup-apply`, `dore-montage`, `move-aphrodite`.
- **2026-06-16 (cierre/compactación):** **17 COLECCIONES, 1159 OBRAS, ~4.7 GB, 1150 con ficha, 0 huérfanos.**
  Sistema de docs reorganizado (START_HERE.md + tools/README.md creados; _PROXIMA_SESION.md consolidado y borrado).
  Eliminados 2 duplicados reales (02 *Man Reading* baja-res; 12 *Amaranth* = copia mal titulada del *Ángel herido*).
  **Gotchas clave:** `_index.json` = `{collection, items:[]}` (no array); descripciones 01-15 viven en `tools/desc/NN.mjs`
  (editar ahí + `apply-desc`, NO el índice directo); la col 17 (Doré) es estructuralmente excepcional (sin museo/año por grabado).
- **2026-06-16:** **17 COLECCIONES, 1161 OBRAS, ~4.7 GB. 1152 con ficha.** Sumada **17 Doré · Divina
  Comedia** (155 grabados full-res, dedup visual con sharp, fichas por canto `dore.mjs`+`dore-desc.mjs`).
  Análisis de brechas (`gap.mjs`): de las 96 pinturas más famosas faltan ~3. Eliminado dup Rokeby Venus.
- **2026-06-16:** **GAP-FILL: 16 COLECCIONES, 1007 OBRAS, ~4.8 GB.** Análisis de brechas vs fama
  Wikidata → llenado del canon (+330): nueva 16 Neoclasicismo, esculturas antiguas en 01/05, y
  ampliación de 02/03/04/07/10/12/13. Descripciones es vía QID→es.wikipedia (preciso). 999/1007
  con ficha. Tools nuevos: `gap.mjs`, `sculptures.mjs`, `enrich-es.mjs`, `gap-desc.mjs`.
- **2026-06-15:** PROYECTO BASE — 15 COLECCIONES, 677 OBRAS, ~3.1 GB (run autónomo).
  677/677 con ficha (título_es · año · autor · escuela · técnica · museo · descripción es ·
  canon_rank). 0 huérfanos. Motor 100% Node. 01-06 temáticas (PD/CC0) · 07-12 canon europeo
  (Wikidata-first, PD) · 13-15 modernas s.XX (WikiArt, con copyright = uso personal, ≥800px).
  GA&C gigapíxel descartado (tiles encriptados). Ver reporte final + PLAN.md.
  **No entraron por res inusable (copyright):** Frida Kahlo, Lichtenstein (Whaam/Drowning Girl),
  Warhol Marilyn, Pollock Autumn Rhythm, Dalí Christ of St John, O'Keeffe Ram Skull.
  **A futuro:** burn de captions (`_captioned/`) + visor HTML con globito (pendientes, no pedidos aún).
