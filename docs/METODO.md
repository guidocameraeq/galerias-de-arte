# METODO — cómo se construyó "Arte" y por qué

> Para quién: un agente sin memoria del proyecto, o alguien que quiere reusar el método (ver `docs/REUTILIZAR.md`).
> Alcance: el *cómo* y el *por qué*. El estado actual está en `node tools/audit.mjs`; los comandos de cada script en `tools/README.md`;
> umbrales de calidad en `docs/CALIDAD.md`; el diario en `docs/CHANGELOG.md`. Si un doc viejo (`docs/archive/legacy-2026-06/`) y el código discrepan, **manda el código**.
> Las citas son `archivo:línea` sobre `tools/`. `[NO VERIFICADO]` = no pude comprobarlo en el código.

## 1. Visión
- Biblioteca **curada** de obras de arte en **alta resolución**, para **uso personal** (slideshow en la TV del usuario). Motor 100% Node.js (sin Python).
- Regla de oro: **pocas obras excelentes > muchas mediocres**. La relevancia de la obra manda sobre su tamaño o formato.
- Cada obra: archivo `landscape/` o `portrait/` + ficha en `_index.json` (objeto `{collection, items:[...]}`, **no** array) + descripción en español.
- **NO se hace:** editar, recortar ni retocar la imagen; filtrar por aspect ratio (vertical y cuadrada entran igual; `w >= h` → landscape, `lib.mjs:146`).
- La colección es *uno-solo-eje físico*: carpeta por escuela/época. Autor, museo, año o fama se ven como vistas del índice, sin duplicar archivos.

## 2. Pipeline común (todas las vías terminan igual)
| Paso | Qué pasa | Dónde |
|---|---|---|
| 1. Adquirir | Resolver la obra en una fuente y obtener la URL de la mejor versión | ver §3 |
| 2. **Medir el archivo real** | `imgSize(buf)` sobre el buffer descargado, no sobre lo que promete la API | `lib.mjs:87-125`; `collect.mjs:163`; `canon.mjs:123` |
| 3. Limpiar metadata y nombre | `cleanTitle/cleanArtist/cleanYear` + `buildFilename` → `NN_Titulo_Autor_Año.jpg` (sin acentos, `_`, año desconocido = `sa`) | `lib.mjs:22-84` |
| 4. Clasificar | `orientationOf(w,h)`; si la orientación real difiere de la prevista, se mueve de carpeta | `collect.mjs:164-170`, `canon.mjs:124-125` |
| 5. Ficha | Se escribe el registro en `_index.json` (`saveIndex` incremental → idempotente ante cortes) | `lib.mjs:203-214`; `collect.mjs:171-180` |
| 6. Descartes | `logDiscard` → `_descartes/<col>.jsonl` con motivo | `lib.mjs:223`; **solo lo usan `collect/discover/dore-dedup`** (§6) |
| 7. Verificar | `fix-dims.mjs` re-mide del disco (verdad); falla con `ERR no se pudo medir` si el archivo no es JPEG/PNG (`fix-dims.mjs:18-19`) | tras cada colección |
| 8. Ficha en español | `wikidata-enrich` → `enrich-es` (QID→es.wikipedia) / `apply-desc` (`tools/desc/NN.mjs`) / `dore-desc` | ver `docs/DESCRIPCIONES.md` |

Idempotencia: la identidad es `museo:sourceId` (`lib.mjs:216-220`) o `qid`; no se re-baja lo que ya está.
Casi todos los scripts son dry-run salvo `--apply`. Excepción: `collect.mjs` baja por defecto y solo simula con `--dry` (`collect.mjs:61`).

## 3. Vías de adquisición (cuándo usar cada una)
| Vía | Cuándo | Script y comando | Cubrió |
|---|---|---|---|
| **a. Temática** (targets curados + barrido) | Colecciones definidas por *tema*, no por autor: hay que buscar mito, memento mori, arte egipcio | `node tools/collect.mjs --col=<colDir> [--max=N] [--dry]`; datos en `targets-0N.mjs`, registro en `collect.mjs:22-49` | 01–06 |
| **b. Canon por fama** (Wikidata-first) | Colecciones por *movimiento*: querés "las más famosas de estos autores" | `node tools/canon.mjs <colDir> [--apply] [--limit=N]`; config `tools/canon/<colDir>.mjs` | 07–12, 16 + ampliación de 02, 03, 04, 13 |
| **c. Modernas con copyright** | Obras del s.XX que no están en Commons en alta-res | `node tools/wikiart.mjs <colDir> [--apply]`; config `tools/wikiart/<colDir>.mjs` | 13, 14, 15 (y `upgrade.mjs` para mejorar 7 puntuales) |
| **d. Doré** | Una serie de grabados: muchas planchas, ediciones repetidas | `dore.mjs` → `dore-redownload.mjs` → `dore-dedup.mjs`/`dore-dedup-apply.mjs` → `dore-desc.mjs` | 17 |
| **e. Esculturas** | Obras anónimas/antiguas sin "autor" para el flujo b | `node tools/sculptures.mjs [--apply]` (lista `LIST`, `sculptures.mjs:16-29`) | Laocoonte, Venus de Milo, etc. en 01 y 05 |
| **f. Análisis de brechas** | Después de cerrar colecciones: ¿qué famoso falta? | `node tools/gap.mjs [minFame=28] [painting\|sculpture]` | Detectó el gap-fill (~330 obras) |

**a. Temática.** Dos etapas en `collect.mjs`: (1) *targets nombrados* resueltos con `resolveTarget` (Met/Cleveland/Wikimedia, scoring autor+título, `resolve.mjs:13,46,107`); (2) *descubrimiento* (`discover.mjs`: Met por subjects + depto, Wikimedia por categorías) para rellenar hasta `--max`. Por qué dos etapas: los targets garantizan los íconos; el barrido llena con lo que haya, ordenado por tamaño (`collect.mjs:128-130`). Se mezclan Met y Wikimedia en round-robin (`collect.mjs:65`). Cada colección necesita su `targets-0N.mjs` y su entrada en `COLLECTIONS`.
**b. Canon.** Por autor: `artistQID` elige, entre candidatos con descripción de artista, el de más sitelinks (`canon.mjs:26-40`); `worksOf` trae por SPARQL sus obras con `P18` (imagen), museo `P195`, año `P571`, ordenadas por `wikibase:sitelinks` (`canon.mjs:41-61`). Se juntan todos los autores, se dedupea y se toma el top `limit` por fama (`canon.mjs:95-99`). De `P18` solo se usa el *nombre de archivo* (`canon.mjs:114`); la URL real sale de `imageinfo` de Commons (`canon.mjs:63-74`). Por qué: el museo, año y autor salen del **mismo item** que la imagen → sin mezclar homónimas ni versiones. Corré siempre primero sin `--apply` y revisá la lista.
**c. WikiArt.** Obras con copyright: el original sin sufijo `!` es lo más grande (`wikiart.mjs:65-74`). Resuelve el slug configurado; si falla, hace match contra el listado del autor exigiendo **todas** las keywords del título (`wikiart.mjs:42-54`). Marca `image_quality` alta/media/baja (`:93`). UA de navegador porque WikiArt rechaza otros (`:10`).
**d. Doré.** `dore.mjs` camina categorías de Commons por canto, filtra basura (`dore.mjs:15`), piso 2400 px (`:14`) y dedupea visualmente. Hubo que re-bajar todo (§6) y deduplicar de nuevo con otro hash.
**f. Brechas.** `gap.mjs` cruza lo que tenemos (por `qid` y por título+autor, `gap.mjs:15-27`) contra el top de Wikidata por sitelinks y lista lo que falta; marca `©` si el año es ≥1925 (`gap.mjs:50`), porque ahí la alta-res libre es improbable.

## 4. Cómo se decide qué entra
- **Relevancia sobre tamaño:** lo que está en `_targets.md` / `targets-0N.mjs` entra aunque no llegue a Full HD, mientras supere el piso anti-basura (`collect.mjs:62,108`). El descubrimiento sí exige 1920 px (`discover.mjs:8`).
- **Fama objetiva = sitelinks de Wikidata** (nº de idiomas con artículo). Ordena el canon (`canon.mjs:98`) y se guarda como `canon_rank`. Para rankear usar `wikibase:sitelinks`, **no** `COUNT` (timeout).
- **Dedup, con distintas claves según la vía:**
  | Vía | Claves | Dónde |
  |---|---|---|
  | collect (01–06) | `museo:sourceId` entre colecciones; título(4 palabras)+autor; autor+dimensiones | `collect.mjs:71-85,133-147` |
  | canon / sculptures / gap | `qid`; título(4 palabras)+apellido | `canon.mjs:20-21,77-82` |
  | prune-canon | `qid`; apellido+dimensiones exactas (a propósito *sin* título) | `prune-canon.mjs:17-20` |
  | Doré | dHash 16×16 = 256 bits, clusters con Hamming ≤ umbral | `dore-dedup.mjs:15-23,38-45` |
- **Exclusiones:** 06 (memento mori) tiene exclusión **dura** de temática cristiana/Jesús por regex (`targets-06.mjs:66`), aplicada en Met y Wikimedia (`discover.mjs:35,134`). Épocas acotadas con `maxYear` (04→1900, 05→1000 a.C.-consciente, 06→1910) y filtros anti-basura `BAD`/`MODERN`/`JUNK_TITLE` (`discover.mjs:61-65`). Los autores de `canon` se eligen a mano (`tools/canon/*.mjs`); `canon.mjs` **no** tiene filtro de época ni de resolución.
- **Poda posterior:** `prune-canon.mjs` (saca lado largo <800 o lado corto <300, `:31`) y `prune-modern.mjs` (lado largo <1000, `:9,15`).

## 5. Decisiones y descartes
| Decisión | Alternativa descartada | Razón | Fecha aprox |
|---|---|---|---|
| Solo Node, sin Python | Pillow/ImageMagick | No están instalados; se parsean cabeceras JPEG/PNG (`lib.mjs:87-111`) | 2026-06-13 |
| No filtrar por aspect ratio ni recortar | Quedarse solo con apaisadas | Verticales = celular; la obra se respeta tal cual | 2026-06-13 |
| Piso duro 1000 px de lado largo; ≥1920 solo preferencia en descubrimiento | Exigir Full HD a todo | Un ícono de 1200 px vale más que una obra menor de 4K (`lib.mjs:229-230`) | 2026-06-13 |
| Cap de 8000 px en Wikimedia (render JPEG, nunca upscale) | Bajar el original gigante (100+ MB) | Peso; ver `resolve.mjs:151-159`, `canon.mjs:69-72` | 2026-06-13 |
| Cleveland: bajar `print` JPEG (~3400 px) | El `full` TIFF (8000+ px) | No hay conversor ni parser de TIFF; se anota el TIFF en `note` (`resolve.mjs:63-73`) | 2026-06-13 |
| Nombre de archivo con el **autor curado** | El `Artist` de Wikimedia | Suele ser el usuario que subió la foto (`resolve.mjs:190-194`) | 2026-06-13 |
| Dedup por contenido, no solo por id | Solo `museo:sourceId` | 3× *The Natchez* en 04 (`collect.mjs:132-135`) | 2026-06-14 |
| **Licencia ya no filtra** (se registra, no se descarta) | Solo dominio público | Es uso personal. Salvedad: `discover.mjs:53` y `resolve.mjs:89` **todavía** filtran PD/CC0, o sea que 01–06 siguen siendo PD; `canon.mjs` y `wikiart.mjs` no filtran | 2026-06-15 |
| Wikidata-first para el canon | Targets + barrido (como 01–06) | Museo/año/autor del mismo item; sin lío de versiones | 2026-06-15 |
| WikiArt por HTTP (`og:image` + text-list) | "PROHIBIDO scrapear" de la regla original | Única vía práctica a modernas con copyright. [NO VERIFICADO: no hay línea explícita que derogue la regla vieja; es práctica de la Fase 4] | 2026-06-15 |
| Google Arts & Culture gigapíxel **descartado** | Reconstruir los tiles | Tiles cifrados (JPEG corrupto a propósito + prefijo basura), token por tile, CORS; frágil para correr desatendido | 2026-06-15 |
| Podar modernas <~1000 px | Aceptar baja-res | Regla de oro. Pocas piezas clave quedaron fuera (Frida, Lichtenstein, etc.): ver `docs/TODO.md` | 2026-06-15 |
| Descripciones por QID→es.wikipedia (`enrich-es.mjs`) | Buscar el artículo por título | Búsqueda por título dio mislabels; el sitelink exacto no | 2026-06-16 |
| Doré: average-hash 8×8 → **dHash 16×16 + revisión visual** | Quedarse con aHash (umbral 12) | aHash confundía planchas distintas por layout tonal común; calibrado dup ≤11 vs distinta ≥56 (`tools/README.md`) | 06-16 → 06-28 |
| **Mover** a `_dedup_removed/` en vez de borrar (Doré) | Borrar | Recuperable si hubo un error de revisión. Desde 2026-10-15 **todo** retiro MUEVE (`remove-work.mjs`, `prune-*.mjs`, `dore-dedup.mjs --apply`); antes `prune-*` y `dore-dedup --apply` borraban | 2026-06-28 |
| **Separación bipolar Pintura vs. Escultura (18_escultura_griega)** | Mezclar escultura y pintura en una sola carpeta | Slideshows independientes en la TV; 01 queda como pinacoteca pura y 18 como arqueología/escultura clásica | 2026-10-15 |
| **Curaduría narrativa de mitos (Hazaña vs. Dios)** | Búsquedas taxonómicas genéricas ("Greek mythology") | Buscadores devuelven 80% Venus y ninfas posando; buscar por ciclo narrativo (Titanomaquia, Trabajos de Hércules, Perseo, Inframundo, Troya) trae las obras épicas | 2026-10-15 |

## 6. Lecciones duras (bugs reales)
| Síntoma | Causa | Qué se hizo | Cómo evitarlo |
|---|---|---|---|
| Imagen más chica que la prometida (render a ~3840 px; una fuente enorme cayó a 1920) | Wikimedia **clampea** los thumbs grandes; `thumbwidth` miente | Re-medir el buffer real y guardar *esas* dims (`collect.mjs:163`); `fix-dims.mjs` como verificación | Nunca confiar en la API para dims; los JPEG ≤8000 se bajan como original (sin clamp) |
| **155 archivos de la col 17 eran HTML de error de 2 KB** con extensión `.jpg` | Rate-limit 429: Wikimedia respondió página de error **con HTTP 200**; `lib.downloadTo` solo chequea `r.ok` (antes de 2026-10-15) y guarda lo que venga | `dore-redownload.mjs`: URL por imageinfo, valida magic bytes FF D8 / PNG (`:17-19`), serial con throttle (`:98`), reintenta con backoff (`:57`) | Validar magic bytes + throttle serial en toda descarga de Wikimedia. **`downloadTo` ya valida desde 2026-10-15** (`looksLikeImage`; reintenta y, si no se recupera, lanza sin escribir). `dore.mjs` baja con su propio `fetch` sin validar: no re-correrlo. `fix-dims.mjs` y `tools/audit.mjs` lo detectan |
| Autor equivocado (`Daderot`, `Commonists`; *Afrodita de Siracusa* = "Canova") | `Artist` de Commons = uploader; metadata de Wikidata/WikiArt errónea | Autor curado en targets (`resolve.mjs:193`); Afrodita corregida a anónima y movida 16→01 (`move-aphrodite.mjs`) | Autor curado a mano; en canon, `artistQID` prefiere "pintor + más sitelinks" (`canon.mjs:32-37`) para no tomar homónimos |
| Arte digital/IA/contemporáneo en una colección histórica | Categorías temáticas amplias de Commons ("Skulls in art", "Mountains in art") | Solo categorías por artista o escuela acotada + `MODERN` + `maxYear` (`discover.mjs:63,130-133`) | No usar categorías amplias; siempre `maxYear` |
| Fotos de réplicas/instalaciones o facsímiles modernos (Gasometer Oberhausen matcheaba "Primavera"; Wasserman/Budge en 05) | La *descripción* de Commons nombra la obra aunque no sea ella | El nombre de archivo pesa 5 vs 2 en el score (`resolve.mjs:129-134`); `BAD`/`BAD_WORDS`; en 05 `maxYear=1000` a.C.-consciente | Filtrar por nombre de archivo primero; palabras-veneno |
| WikiArt devolvía otra obra | Su buscador es JS-rendered; slugs parecidos | `bestSlug` exige *todas* las keywords (`wikiart.mjs:51-53`); `upgrade.mjs` rechaza si el aspecto difiere >12% (`:49`) | Slugs verificados en el config; chequeo de aspecto al reemplazar |
| Misma obra en dos carpetas o dos versiones (*Rokeby Venus*, *Man Reading*, *Amaranth* = copia mal titulada) | Dedup solo por id, o título distinto entre fuentes | Dedup por qid + título + dims (§4); duplicados eliminados a mano | Correr `gap.mjs`/`audit.mjs`; ojo con series homónimas (*Adele I/II*, *Sainte-Victoire*), por eso `prune-canon` no usa título |
| Búsquedas del Met devolvían 0 | `hasImages=true` + `departmentId` en `/search` sobreconstriñe | Buscar por término con `hasImages=true` y filtrar el depto en `/objects/{id}` (`discover.mjs:17,26`) | No combinar esos filtros |
| Item basura (07 "ética ambiental" como Rafael) | Glitch de Wikidata | Eliminado a mano | Revisar la lista en dry-run antes de `--apply` |
| Duplicados colados por variantes ortográficas (Pollaiuolo/Pollaiolo, espacios en J. M. W. Turner, sufijos) | Comparación estricta de cadenas `===` en target vs catálogo existente | Se detectaron 3 duplicados, se retiraron a `_dedup_removed/` con `remove-work.mjs` y se reemplazaron (Reni, Moreau, Turner) | Normalización fuzzy con tokenización, remoción de stop-words y matching por raíces |
| `remove-work.mjs` ignoraba fichas multilínea | Parser asumía regex de una sola línea `^  \{ n: (\d+),` | Fichas generadas con formateador multilínea quedaban desvinculadas | Parser ampliado para detectar tanto formato single-line como multiline |
| **Colección dominada por bocetos pálidos y croquis menores (Kubin)** | Priorizar el atajo técnico de una sola API (Leopold Museum entregaba 3500 px fácil) sobre el canon artístico y la fuerza visual | Purgados 16 bocetos y afiches con `remove-work.mjs`; se invirtió el método: investigación del canon primero, recolección después; se cosecharon 15 obras maestras cumbres (color y pesadilla densa) | **Investigar y definir la lista de obras representativas del artista ANTES de salir a buscar descargas**; nunca dejar que la disponibilidad fácil de una API sesgue la curaduría |

## 7. Cronología mínima (2026)
- **06-13** Setup + Fase 1: motor Node y colección 01; luego 02–06 (hasta 06-14) con `collect.mjs`.
- **06-15** Fase 2 (fichas en español, `tools/desc/`); Fase 3 (canon Wikidata-first, 07–12); Fase 4 (modernas WikiArt 13–15); se relaja la licencia.
- **06-16** Gap-fill por fama (+~330 obras, nueva 16, esculturas); sube la col 17 (Doré, 155 grabados).
- **06-28** Rescate de la 17 (archivos HTML), dedup 155→98 por dHash + revisión visual, fichas al 100%.
- **2026-10-15** Reorganización de docs a `AGENTS.md` + `docs/`. Creación de `18_escultura_griega` (64 obras) y expansión épica de `01_mitologia_griega_romana` (+77 obras). Total: 1234 obras. Diario completo: `docs/CHANGELOG.md`.
