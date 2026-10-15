# tools/ — Índice de scripts del proyecto "Arte"

Mapa de **todos** los scripts de `tools/` y subcarpetas (`canon/`, `wikiart/`, `desc/`).
Pensado para **retomar el proyecto sin leer el código**. Para el panorama completo ver `AGENTS.md`
(reglas) y `docs/` (`METODO`, `CALIDAD`, `INVENTARIO`, `DESCRIPCIONES`, `FUENTES`); para el estado vivo,
`node tools/audit.mjs` y `docs/SESSION_HANDOFF.md`.

> **Convenciones comunes**
> - **Motor 100% Node.js** (v26, `fetch` nativo). Sin Python/Pillow. Deps npm: `sharp` (revisión visual/dedup de Doré: `dore*.mjs`); `jimp` está instalado y sin uso.
> - **`_index.json` es `{collection, items:[...]}`** (objeto, no array). Las obras están en `.items`.
> - **Dry-run por defecto:** casi todos los scripts de escritura **NO tocan disco/`_index.json` salvo `--apply`**. Idempotentes.
> - **User-Agent identificable** `Arte-PD-Collection/1.0 (eq.chatgpt@gmail.com)`, **salvo** `wikiart.mjs`/`upgrade.mjs` que usan UA de navegador (WikiArt rechaza UAs no-browser).
> - Las rutas `<colDir>` son la carpeta de colección, p.ej. `02_barroco`.

---

## 0. Verificación (correla antes de decir "listo")

| Script | Uso |
|---|---|
| `audit.mjs` | **Garantía de calidad ejecutable. Solo lectura, sin red, ~10 s.** Valida por colección: forma de `_index.json`, que cada archivo exista y sea imagen real (magic bytes), dims reales = índice, orientación, huérfanos, fichas, duplicados y fichas autoradas desfasadas. Imprime los totales de estado (obras/fichas/GB). Exit 1 si hay FALLAS. `node tools/audit.mjs [--col=NN] [--all] [--json]`. Códigos: `docs/CALIDAD.md` §7. |

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
| `desc/01…16.mjs` | Datos de descripciones autoradas (es) por colección (`n`, `titulo`, `escuela`, `tipo`, `d`). **Se vuelcan POR `n`**: si se poda/renumera/mueve una obra, sacá su entrada acá (`audit` avisa `W-DESC-STALE`). La 16 solo tiene 3 entradas. |
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

---

## Mapa rápido por fase
- **Fase 1 (01–06):** `collect.mjs` + `lib`/`resolve`/`discover` + `targets-0N.mjs`.
- **Fase 3 (07–12, 16):** `canon.mjs` + `canon/*.mjs` + `sculptures.mjs`.
- **Fase 4 (13–15):** `wikiart.mjs` + `wikiart/*.mjs`.
- **17 Doré:** `dore.mjs` + `dore-desc.mjs` (usan `sharp`).
- **Fichas (es):** `wikidata-enrich.mjs` → `apply-desc.mjs` (`desc/*.mjs`) + `enrich-es.mjs`.
- **Calidad:** `cleanup-names`, `fix-dims`, `prune-canon`, `prune-modern`.
- **Auditoría:** `gap.mjs`, `dryrun.mjs`.

> **Sub-proyecto futuro (sin tooling aún):** visor con globito flotante o quemado de captions (`_captioned/`) para la TV.
