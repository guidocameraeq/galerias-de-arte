# tools/ — Índice de scripts del proyecto "Arte"

Mapa de **todos** los scripts de `tools/` y subcarpetas (`canon/`, `wikiart/`, `desc/`).
Pensado para **retomar el proyecto sin leer el código**. Para el panorama completo ver `AGENTS.md`
(reglas) y `docs/` (`METODO`, `CALIDAD`, `INVENTARIO`, `DESCRIPCIONES`, `FUENTES`); para el estado vivo,
`node tools/audit.mjs` y `docs/SESSION_HANDOFF.md`.

> **Convenciones comunes**
> - **Motor 100% Node.js** (v26, `fetch` nativo). Sin Python/Pillow. Deps npm: `sharp` (revisión visual/dedup de Doré: `dore*.mjs`); `jimp` está instalado y sin uso.
> - **`_index.json` es `{collection, items:[...]}`** (objeto, no array). Las obras están en `.items`.
> - **Dry-run por defecto:** casi todos los scripts de escritura **NO tocan disco/`_index.json` salvo `--apply`**. Idempotentes.
> - **User-Agent identificable** `Arte-PD-Collection/1.0 (+https://github.com/guidocameraeq/galerias-de-arte)`, **salvo** `wikiart.mjs`/`upgrade.mjs` que usan UA de navegador (WikiArt rechaza UAs no-browser).
> - Las rutas `<colDir>` son la carpeta de colección, p.ej. `02_barroco`.

---

## 0. Verificación (correla antes de decir "listo")

| Script | Uso |
|---|---|
| `audit.mjs` | **Garantía de calidad ejecutable. Solo lectura, sin red, ~10 s.** Valida por colección: forma de `_index.json`, que cada archivo exista y sea imagen real (magic bytes), dims reales = índice, orientación, huérfanos, fichas, duplicados y fichas autoradas desfasadas. Imprime los totales de estado (obras/fichas/GB). Exit 1 si hay FALLAS. `node tools/audit.mjs [--col=NN] [--all] [--json]`. Códigos: `docs/CALIDAD.md` §7. |

## 0b. Imágenes fuera del repo, Drive y app (ver `docs/ALMACENAMIENTO.md`, `docs/FORMATO_DRIVE.md`)

| Script | Uso |
|---|---|
| `link-images.mjs` | Conecta el repo con la biblioteca de imágenes de ESTA PC: crea enlaces (junctions Windows) `landscape/`, `portrait/`, `_dedup_removed/` en cada colección. No toca carpetas reales con archivos. Dry-run por defecto. `node tools/link-images.mjs [--dir=RUTA] [--save] [--apply]` (ruta guardada en `.arte-local.json`) |
| `images-sync.mjs` | Respaldo/restauración contra Drive (`Galerías de arte/Respaldo`, privada). Solo copia, nunca borra; excluye `_dedup_removed`. Dry-run por defecto. `node tools/images-sync.mjs backup\|restore [--apply]`. `restore` rearma los enlaces |
| `fichas-stats.mjs` | Solo lectura. Por colección: palabras de la explicación (la app pide 80–150), origen Wikipedia-es vs a mano, museo/técnica/año/`title_es`/`qid` completos. Es la fuente de números de `docs/FICHAS_APP.md` |
| `contact-sheets.mjs` | Solo lectura. Hojas de contacto (miniatura + "n título — autor, año") para revisar a ojo que la ficha corresponda a la imagen. Por defecto las obras sin `qid`. `node tools/contact-sheets.mjs --out=RUTA [--col=a,b] [--all-items]` |
| `candidatas.mjs` | Genera `<col>/_candidatas.json` de las 23 colecciones: obras que NO entraron (pendientes importantes / descartadas, con motivo) desde `_descartes/`, `tools/candidatas-manual.json` y (`--gap`, red) las famosas de Wikidata que faltan. Dry-run por defecto. `node tools/candidatas.mjs [--gap] [--min-fame=28] [--apply]` |
| `make-prueba-drive.mjs` | Baja 5 obras de Commons para `_export/Galerías-prueba/Sana` (serial, valida magic bytes). Solo pruebas |
| `make-prueba-json.mjs` | Arma los `galeria.json` de `Galerías-prueba` (Sana, Rota-json, Rota-archivo) y copia las imágenes de prueba. Incluye la grilla 4K que provee el proyecto de la app |
| `check-prueba-json.mjs` | Valida `galeria.json` de una carpeta de galerías: JSON válido, archivos existentes, ids repetidos, imágenes sin listar. `node tools/check-prueba-json.mjs [carpeta]` |
| `harvest.mjs` | **Motor genérico de colección nueva.** Lee `tools/targets/<col>.json` (plantilla `_ejemplo.json`), resuelve cada imagen (url → Commons → qid/P18), dedup contra toda la biblioteca, mide el archivo real, piso, orientación, índice incremental, registra rechazos en `_descartes/` y fichas por id en `tools/desc/<col>.mjs`. Se niega a bajar si faltan los enlaces de la biblioteca. Dry-run por defecto. `node tools/harvest.mjs <col> [--apply] [--limit=N]` |
| `galerias.mjs` | Título visible de cada colección (carpeta en Drive y título en la app). Agregar la colección nueva acá |
| `drive-curation.mjs` | Trae al repo lo que Guido borra en Drive (`Galerías`): `remove-work` de cada obra borrada (motivo `curaduria`), regenera su `galeria.json` y las candidatas. Freno >30%. Dry-run por defecto. `node tools/drive-curation.mjs [--drive=RUTA] [--force] [--apply]` |
| `desc-add-ids.mjs` | Clava cada ficha de `tools/desc/` a su obra por id estable (ya corrido el 2026-11-03: 973 fichas). Idempotente. `node tools/desc-add-ids.mjs [--col=X] [--apply]` |
| `assign-local-ids.mjs` | Da `sourceId` `local:<col>:<slug>` a obras sin ningún identificador (hecho para 22 y 23). Idempotente. `[--apply]` |
| `export-drive.mjs` | Biblioteca → carpetas para la app (`docs/FORMATO_DRIVE.md`): una colección = una subcarpeta con imágenes + `galeria.json` v1. Copia las imágenes tal cual (extensión real); `--max-side=3840` hace copias reducidas (derivado; el original no se toca). Valida (archivos, ids, 50 MB, Markdown). Tondos: `tools/forma-tondos.json` o `forma` del índice. **No re-sube lo que Guido borró en Drive** y **renombra** (no duplica) si cambió el título. Reemplaza versiones viejas con el mismo nombre y aparta lo que ya no está en la galería a `Galerías de arte/_retiradas/` (nunca borra). Sin `--out` encuentra Drive solo. Dry-run por defecto. `node tools/export-drive.mjs (--col=a,b | --all) [--out=RUTA] [--max-side=N] [--apply]` |

## 1. Motor / librería (no se ejecutan directo)

| Script | Propósito |
|---|---|
| `lib.mjs` | **Núcleo.** `slugify`/`buildFilename`, limpieza de metadata (`cutQS`/`cleanArtist`/`cleanYear`/`cleanTitle`), medición JPEG/PNG sin Pillow (`imgSize`/`measureRemote` por Range), `getJSON` con reintentos, `downloadTo` con backoff **y validación de contenido por magic bytes** (`looksLikeImage`; rechaza páginas de error), `loadIndex` (lanza si el JSON está roto)/`saveIndex`/`idKey`/`alreadyHave` (idempotencia), `logDiscard`. Constantes `MIN_LONG_SIDE`=1000 / `PREFER_LONG_SIDE`=1920. |
| `resolve.mjs` | Resolutores de targets **nombrados** por fuente (`resolveMet`/`resolveCleveland`/`resolveWMC`) con scoring autor+título. Exporta `UA` y `resolveTarget`. |
| `discover.mjs` | Barrido de **descubrimiento** (`discoverMet` por subjects+dept; `discoverWMC` por categorías con filtros anti-basura `BAD`/`MODERN`/`JUNK_TITLE` y `maxYear` consciente de a.C.). Devuelve hits filtrados, sin descargar. |

## 2. Adquisición (descargan e indexan obras)

### Fase 1 — Temáticas 01–06 (PD/CC0, motor `collect.mjs`)
| Script | Uso |
|---|---|
| `collect.mjs` | Runner 01–06: resuelve targets + descubrimiento (Met+Wikimedia), dedup, descarga, clasifica, mide el archivo real, escribe índice, loguea descartes. `node tools/collect.mjs --col=02_barroco [--max=70] [--dry]` |
| `targets-01.mjs`…`targets-06.mjs` | Datos **curados** por colección (TARGETS + config de descubrimiento). `targets-06` incluye exclusión cristiana. |

### Fase 3 — Canon europeo por fama (Wikidata-first, motor `canon.mjs`)
| Script | Uso |
|---|---|
| `canon.mjs` | Por artista trae sus obras más famosas (sitelinks) con imagen P18, museo P195, año P571; dedup contra todo; baja full-res de Commons (capa 8000) e indexa. `node tools/canon.mjs <colDir> [--apply] [--limit=N]` |
| `canon/07…16.mjs` | Configs (artistas + perArtist/limit/minFame). Cubren **07–12, 16** y la ampliación de **02, 03, 04, 13**. `canon/13` trae solo vanguardistas en dominio público. |
| `sculptures.mjs` | Esculturas anónimas/antiguas (Laocoonte, Venus de Milo…): resuelve por **nombre** en Wikidata, baja P18, indexa en su época. Lista `LIST` editable. `node tools/sculptures.mjs [--apply]` |

### Expansión Mitología Griega & Escultura Antigua (Colecciones 01 y 18)
| Script | Uso |
|---|---|
| `migrate-greek-sculptures.mjs` | Migra las 9 esculturas clásicas de `01_mitologia_griega_romana` (Laocoonte, Venus de Milo, Samotracia, Riace, Discóbolo, Apolo Belvedere, Gálata moribundo, Augusto, Afrodita de Siracusa) a la nueva `18_escultura_griega`. Mueve archivos físicos, renumera y actualiza índices. Dry-run por defecto. `node tools/migrate-greek-sculptures.mjs [--apply]` |
| `targets-18-sculptures.mjs` | Inventario curado de 64 obras maestras de escultura griega y arqueología: 9 migradas + 37 de museos griegos (NAMA, Acrópolis, Delfos, Olimpia, Heraklion) + 18 de museos internacionales (Louvre, Vaticano, MANN Nápoles, Roma Terme/Capitolinos, BM, Múnich, Berlín). Con fichas en español y fuentes verificadas. |
| `harvest-18-sculptures.mjs` | Verificación remota en Wikimedia Commons y descarga/indexación para `18_escultura_griega`. Valida piso ≥1000px, orientación y licencias. Dry-run por defecto. `node tools/harvest-18-sculptures.mjs [--check] [--apply]` |
| `targets-01-paintings.mjs` | Inventario curado de 35 pinturas mitológicas clásicas de dioses, semidioses y héroes (Botticelli, Tiziano, Tintoretto, Bronzino, Caravaggio, Annibale Carracci, Rubens, Velázquez, Poussin, Guido Reni, Rembrandt, Girodet, David, Ingres, Cabanel, Leighton, Waterhouse, Burne-Jones, De Morgan, Moreau) 100% libre de duplicados con otras colecciones, para transformar `01_mitologia_griega_romana` en una pinacoteca mitológica de referencia. |
| `harvest-01-paintings.mjs` | Verificación remota y descarga/indexación de las pinturas mitológicas en `01_mitologia_griega_romana`. Dedup estricto. Valida piso ≥1000px y orientaciones. Dry-run por defecto. `node tools/harvest-01-paintings.mjs [--check] [--apply]` |
| `targets-01-epic-myths.mjs` | Inventario curado de 42 pinturas mitológicas épicas (Zeus y Olimpo, Titanomaquia, serie completa de 10 Trabajos de Hércules de Zurbarán del Prado, Pollaiolo, Perseo, Teseo, Inframundo/Tártaro, Troya y la Odisea por Giulio Romano, Cornelis van Haarlem, Wtewael, Rubens, Perugino, Füger, Perino del Vaga, Zurbarán, Reni, Moreau, Giordano, Piero di Cosimo, Burne-Jones, Watts, Tiziano, Ribera, Jan Brueghel, Delacroix, Tiepolo, David, Motte, Turner, Böcklin). 0 duplicados en el repositorio, fichas completas. |
| `harvest-01-epic-myths.mjs` | Verificación remota en Wikimedia Commons, resolución con capa WMC (8000px), descarga e indexación de las 42 pinturas épicas en `01_mitologia_griega_romana`. Actualiza `_index.json` y `tools/desc/01_mitologia_griega_romana.mjs`. Dry-run por defecto. `node tools/harvest-01-epic-myths.mjs [--check] [--apply]` |

### Colección 19 — Marcelo Canevari (Arte contemporáneo / Naturalismo argentino)
| Script | Uso |
|---|---|
| `targets-19-canevari.mjs` | Inventario curado de 25 obras maestras de Marcelo Canevari (Mindy Solomon Gallery, Galería COTT, Salón Nacional, Indie Hoy, JOIA, Booooooom), con fichas en español y metadatos verificados. |
| `harvest-19-canevari.mjs` | Verificación remota, validación de contenido (magic bytes), descarga e indexación de las 25 obras en `19_marcelo_canevari`. Valida piso ≥1000px y orientaciones. Dry-run por defecto. `node tools/harvest-19-canevari.mjs [--apply]` |

### Colección 20 — Alfred Kubin (Simbolismo / Expresionismo austríaco)
| Script | Uso |
|---|---|
| `targets-20-kubin.mjs` | Inventario curado de 41 obras maestras de Alfred Kubin (Leopold Museum Viena, Lenbachhaus Múnich, MoMA/Commons), con fichas en español y metadatos verificados. |
| `harvest-20-kubin.mjs` | Verificación remota, validación de contenido (magic bytes), descarga e indexación de las 41 obras en `20_alfred_kubin`. Valida piso ≥1000px y orientaciones. Dry-run por defecto. `node tools/harvest-20-kubin.mjs [--apply]` |

### Colección 21 — Rob Gonsalves (Realismo mágico / Ilusionismo canadiense)
| Script | Uso |
|---|---|
| `targets-21-gonsalves.mjs` | Inventario curado de 25 obras maestras de Rob Gonsalves (Estate oficial de Rob Gonsalves, Marcus Ashley Gallery), con fichas en español y metadatos verificados (≥1000 px). |
| `harvest-21-gonsalves.mjs` | Verificación remota, validación de contenido (magic bytes), descarga e indexación de las 25 obras en `21_rob_gonsalves`. Valida piso ≥1000px y orientaciones. Dry-run por defecto. `node tools/harvest-21-gonsalves.mjs [--apply]` |

### Fase 4 — Modernas s.XX (WikiArt, copyright/uso personal)
| Script | Uso |
|---|---|
| `wikiart.mjs` | Baja modernas de **WikiArt** a máxima resolución (original > `!HD` > `!Large`); `og:image` + match estricto por keywords + fallback text-list. UA de navegador. `node tools/wikiart.mjs <colDir> [--apply]` |
| `wikiart/13…15.mjs` | Configs de obras (autor, título, título_es, año, slug, museo) para `wikiart.mjs`. |

### Colección 17 — Doré (standalone, usa `sharp`)
| Script | Uso |
|---|---|
| `dore.mjs` | Baja los grabados de Doré de Commons full-res: camina categorías por canto, filtra basura, **dedupe visual** (average-hash con `sharp`, umbral Hamming 12), en paralelo con timeout. **⚠ No re-ejecutar:** baja con su propio `fetch`, sin validar contenido (así quedaron rotos los 155 archivos originales); para Doré usá `dore-redownload.mjs`. `node tools/dore.mjs [--apply]` |
| `dore-redownload.mjs` | **Re-baja** los grabados rotos (páginas de error HTML guardadas como `.jpg`): URL autoritativa vía imageinfo, **VALIDA magic bytes**, throttle serial anti-429, re-mide dims. Idempotente (salta los ya válidos). `node tools/dore-redownload.mjs [--apply] [--limit=N]` |
| `dore-dedup.mjs` | Reporta clusters de planchas duplicadas con **dHash 16×16 (256 bits)** calibrado (dup verdadero ≤11, plancha distinta ≥56). Mucho más fino que el aHash 8×8 (que confundía por el layout tonal común). `node tools/dore-dedup.mjs [--th=18]` |
| `dore-montage.mjs` | Genera una **hoja de contacto** etiquetada (grid nXX) de un canto, para dedup visual eficiente. `node tools/dore-montage.mjs <Infierno\|Purgatorio\|Paraiso> <canto>` |
| `dore-dedup-apply.mjs` | Aplica el dedup revisado a ojo: **MUEVE** (no borra) los dups/junk a `_dedup_removed/` y los saca del índice. Lista `REMOVE` editable. Tras correrlo: `dore-desc.mjs` renumera. **De un solo uso, ya ejecutado: aborta siempre** (su lista `REMOVE` usa la numeración original). Para sacar una obra usá `remove-work.mjs`. `node tools/dore-dedup-apply.mjs [--apply]` |

## 3. Limpieza / medición / poda
| Script | Uso |
|---|---|
| `cleanup-names.mjs` | Re-normaliza title/artist/year y renombra archivos. `node tools/cleanup-names.mjs <colDir> [--apply]` |
| `fix-dims.mjs` | Re-mide cada archivo **del disco** (verdad), corrige width/height/bytes y mueve si la orientación real difiere. `node tools/fix-dims.mjs <colDir> [--apply]` |
| `prune-canon.mjs` | Poda del canon 07–12: saca diminutas (<800 de lado largo o <300 de corto) y dups entre colecciones (protege 01–06), **renumera**. Con `--apply` MUEVE a `_dedup_removed/` (antes borraba). **Una pasada: NO re-correr** (en dry propone sacar obras ya aceptadas y la renumeración desfasa `tools/desc/`). `node tools/prune-canon.mjs [--apply]` |
| `prune-modern.mjs` | Poda modernas: saca lado largo `< min` (def 1000; **`--min=0` NO lo desactiva**) y/o `--remove=n1,n2`, **renumera+renombra**. Con `--apply` MUEVE a `_dedup_removed/` (antes borraba). **Una pasada: NO re-correr** (también saca las modernas ≥800 ya aceptadas). Para una sola obra: `remove-work.mjs`. `node tools/prune-modern.mjs <col> [--min=1000] [--remove=1,2] [--apply]` |
| `remove-work.mjs` | **Saca UNA obra de forma recuperable** (el camino normal): mueve el archivo a `<col>/_dedup_removed/`, quita el item del índice (no renumera), loguea el descarte y limpia su entrada de `tools/desc/<col>.mjs`. Dry-run por defecto. `node tools/remove-work.mjs <colDir> (--n=N | --sourceId=ID) [--why=dup|baja_calidad|fuera_de_tema|error|otro] [--note="…"] [--apply]` |

## 4. Descripciones / fichas (metadata en español)
> **Flujo vigente:** (a) descripciones **a mano** en `tools/desc/<col>.mjs` → volcadas por `apply-desc.mjs` (fuente de verdad de 01-15); respaldadas por (b) **`enrich-es.mjs`** (resumen es vía QID). El `qid` lo pobla `wikidata-enrich.mjs`, que **corre antes** que `enrich-es`/`gap`/`prune-canon`.

| Script | Uso |
|---|---|
| `wikidata-enrich.mjs` | Enriquece campos **estructurados** de Wikidata (`holding_museum` P195, `type` P186, `school` P135, `canon_rank`=sitelinks, **`qid`**). `node tools/wikidata-enrich.mjs <colDir> [--apply]` |
| `enrich-es.mjs` | Descripción es **100% precisa**: por `qid` → sitelink exacto de es.wikipedia → resumen (sin búsqueda por título = sin mislabel). Idempotente. `node tools/enrich-es.mjs <colDir> [--apply] [--force]` |
| `apply-desc.mjs` | Vuelca las descripciones **a mano** (`tools/desc/<col>.mjs`) al índice. **Camino principal de fichas 01-15.** `node tools/apply-desc.mjs <colDir> [--apply]` |
| `desc/01…16, 18–21.mjs` | Datos de descripciones autoradas (es) por colección (`n`, `titulo`, `escuela`, `tipo`, `d`). **Se vuelcan POR `n`**: si se poda/renumera/mueve una obra, sacá su entrada acá (`audit` avisa `W-DESC-STALE`). |
| `gen-targets-md.mjs` | Genera `_targets.md` (tabla curada de objetivos) de las colecciones 01–06 desde `targets-0N.mjs`. |
| `dore-desc.mjs` | Pobla la **17** (Doré): título_es (Cántica + Canto en romano) + descripción por canto. Lee `_cantos.json`. `node tools/dore-desc.mjs` |
| `enrich-desc.mjs` | *(legado fase 1)* Descripción corta en **inglés** (Cleveland→Wikipedia→Met). Superado por el flujo es; fallback. |

## 5. Análisis / dry-run (no descargan)
| Script | Uso |
|---|---|
| `gap.mjs` | **Análisis de brechas:** cruza todo lo bajado (por `qid` y título+autor) contra el top de Wikidata por fama y reporta las famosas que **faltan**. `node tools/gap.mjs [minFame=28] [painting\|sculpture]` |
| `dryrun.mjs` | Resuelve targets y reporta sin descargar. **Hardcodeado a TARGETS_01.** |

## 6. Un solo uso, ya ejecutados (registro)
| Script | Estado |
|---|---|
| `gap-desc.mjs` | Polish de gap-fill (borró item basura + escribió fichas a mano, por `n`). Aplicado; **aborta si se ejecuta** (re-correrlo desfasaría fichas). |
| `upgrade.mjs` | Mejoró ~7 obras puntuales de WikiArt con chequeo de aspecto. Aplicado; reusable editando `TARGETS`. |
| `move-aphrodite.mjs` | Movió "Afrodita de Siracusa" 16→01 corrigiendo autor falso (Canova→anónima grecorromana). Aplicado. |
| `integrate-dark-art.mjs` | Integración de 8 upgrades en alta resolución + 8 obras maestras oscuras nuevas desde lote externo `dark_art`. Aplicado; si se re-ejecuta verifica la integridad de las 16 obras en disco/índice. |

---

## Mapa rápido por fase
- **Fase 1 (01–06):** `collect.mjs` + `lib`/`resolve`/`discover` + `targets-0N.mjs`.
- **Fase 3 (07–12, 16):** `canon.mjs` + `canon/*.mjs` + `sculptures.mjs`.
- **Fase 4 (13–15):** `wikiart.mjs` + `wikiart/*.mjs`.
- **17 Doré:** `dore.mjs` + `dore-desc.mjs` (usan `sharp`).
- **18 Escultura griega:** `migrate-greek-sculptures.mjs` + `targets-18-sculptures.mjs` + `harvest-18-sculptures.mjs`.
- **19 Marcelo Canevari:** `targets-19-canevari.mjs` + `harvest-19-canevari.mjs` + `desc/19_marcelo_canevari.mjs`.
- **20 Alfred Kubin:** `targets-20-kubin.mjs` + `harvest-20-kubin.mjs` + `desc/20_alfred_kubin.mjs`.
- **21 Rob Gonsalves:** `targets-21-gonsalves.mjs` + `harvest-21-gonsalves.mjs` + `desc/21_rob_gonsalves.mjs`.
- **Fichas (es):** `wikidata-enrich.mjs` → `apply-desc.mjs` (`desc/*.mjs`) + `enrich-es.mjs`.
- **Calidad:** `cleanup-names`, `fix-dims`, `prune-canon`, `prune-modern`.
- **Auditoría:** `gap.mjs`, `dryrun.mjs`, `audit.mjs`.

> **Sub-proyecto futuro (sin tooling aún):** visor con globito flotante o quemado de captions (`_captioned/`) para la TV.
