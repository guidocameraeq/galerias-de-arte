# INVENTARIO — contrato de datos de las piezas

Cómo está armado el inventario: carpetas, nombres, esquema de `_index.json`, claves de identidad,
descartes y cómo tocarlo sin romperlo. Verificado contra los `_index.json` reales y `tools/*.mjs`
(fecha: 2026-10-15). Si algo acá discrepa con el código o los datos, mandan ellos.
**Conteos y estado vivo: `node tools/audit.mjs`** (solo lectura, sin red; exit 1 si hay FALLAS).
Ver también: `AGENTS.md`, `docs/METODO.md`, `docs/FUENTES.md`, `docs/DESCRIPCIONES.md`, `docs/CALIDAD.md`.

## 1. Estructura de carpetas

```
<raíz>/
├── NN_nombre/                  colecciones 01..23
│   ├── _index.json             LA fuente de verdad de la colección: {collection, items:[...]}
│   ├── landscape/  portrait/   los JPG; carpeta = campo `orientation` de cada obra
│   ├── _targets.md             SOLO 01–06: tabla curada de objetivos (la genera gen-targets-md.mjs desde targets-0N.mjs)
│   ├── _cantos.json            SOLO 17: mapa sourceId -> "Inferno 01" (cántica + canto); lo lee dore-desc.mjs
│   └── _dedup_removed/         SOLO 17: planchas duplicadas MOVIDAS (recuperables); fuera del índice
├── _descartes/<NN_nombre>.jsonl   log de lo rechazado (ver §5); no existe para 07–16
└── tools/                      scripts Node (núcleo: tools/lib.mjs); índice en tools/README.md
```

| Colección | Qué es / cómo entró |
|---|---|
| `01_mitologia_griega_romana` | **LA prioritaria (100 obras).** Pinacoteca mitológica de referencia: pintura europea de tema mitológico clásico (Renacimiento→s.XIX: Botticelli, Tiziano, Tintoretto, Rubens, Velázquez, Poussin, David, Cabanel, Waterhouse, Moreau) + *Loba capitolina*. Las 9 esculturas clásicas migraron a la colección 18. Fichas curadas en `tools/desc/01_mitologia_griega_romana.mjs` |
| `02_barroco`, `03_gotico`, `04_romanticismo` | 02 pintura barroca dramática, de claroscuro · 03 gótico, medieval tardío · 04 paisajes sublimes y lo épico romántico. Targets + barrido (`collect.mjs`) y luego ampliadas con canon por fama (`canon.mjs`) |
| `05_egipcio` | Met "Egyptian Art" (dept 10): arte y artefactos del antiguo Egipto. Met + Wikimedia (`collect.mjs`), + esculturas canon |
| `06_macabro_memento_mori` | Memento mori, vanitas, danza de la muerte, muerte mitológica, brujería, lo siniestro **secular**; época barroca/semi-renacentista/clásica. **Sin temática cristiana** (exclusión dura). `collect.mjs` |

El alcance fino de 01–06 (qué obras son targets y por qué) vive en `<col>/_targets.md` y en `tools/targets-0N.mjs`.
| `07_alto_renacimiento`, `08_impresionismo`, `09_postimpresionismo`, `10_realismo`, `11_rococo`, `12_simbolismo_modernismo`, `16_neoclasicismo` | Canon europeo por fama Wikidata (`canon.mjs`, PD) |
| `13_vanguardias` | Mixto: parte canon PD (`canon.mjs`) + parte WikiArt con copyright (`wikiart.mjs`) |
| `14_surrealismo`, `15_pop_americano` | Modernas con copyright, uso personal (`wikiart.mjs`) |
| `17_dore_divina_comedia` | Grabados de Doré, standalone (`dore.mjs`, `dore-desc.mjs`, `sharp`) |
| `18_escultura_griega` | Galería dedicada a la escultura griega y arqueología clásica (64 obras maestras): 9 migradas de 01 (Laocoonte, Venus de Milo, Samotracia, Riace, Discóbolo, Apolo Belvedere, Gálata moribundo, Augusto, Afrodita de Siracusa) + 55 cosechadas de museos de Grecia (Atenas NAMA, Acrópolis, Delfos, Olimpia, Heraklion) e internacionales (Louvre, Vaticano, MANN Nápoles, Roma Terme/Capitolinos). Fichas curadas en `tools/desc/18_escultura_griega.mjs` |
| `19_marcelo_canevari` | Retrospectiva y selección curada del pintor y naturalista argentino contemporáneo Marcelo Canevari (25 obras): series *La fiesta del fuego*, *Fuerza Mayor*, colaboraciones (*Post Mortem* con Pocetti / tapa de Dillom, *Iberá* y *Las ofrendas* con su padre) y escenas de fauna/realismo mágico. Fichas curadas en `tools/desc/19_marcelo_canevari.mjs` |
| `20_alfred_kubin` | Monográfica curada del dibujante, ilustrador y escritor austríaco Alfred Kubin (41 obras maestras): visiones de pesadilla, alegorías de la muerte, quimeras abisales, sátiras grotescas e ilustraciones apocalípticas y literarias (*Der Krieg*, *Die andere Seite*, *Das Feuerpferd*). Fuentes: Leopold Museum (35 obras a 3500 px), Lenbachhaus (4 obras a 2000 px) y MoMA/Commons (2 obras). Fichas curadas en `tools/desc/20_alfred_kubin.mjs` |
| `21_rob_gonsalves` | Retrospectiva y selección curada del maestro canadiense del realismo mágico e ilusionismo Rob Gonsalves (25 obras maestras): transformaciones arquitectónicas, marinas y oníricas (*El sol zarpa*, *Islas que zarpan*, *Aquí llega la marea*, *Gótico salvaje*, *Rompecabezas inacabado*). Fuentes: Estate oficial de Rob Gonsalves (Squarespace CDN), Marcus Ashley Gallery (Lake Tahoe) y escaneos de alta resolución (≥1000 px). Fichas curadas en `tools/desc/21_rob_gonsalves.mjs` |
| `22_zdzislaw_beksinski` | Monográfica curada del maestro del surrealismo distópico polaco Zdzisław Beksiński (25 obras maestras del período fantástico 1970–1985): figuras esqueléticas, crucifixiones paganas, torres de fuego, arquitecturas óseas y paisajes apocalípticos (*Los amantes*, *AA78*, *La torre carmesí*, *El cañón de los soldados espectrales*, *El árbol de osamentas*). Fuentes: escaneos limpios sin recortar ni franjas de WikiArt (serie `untitled-584`..`606`) y Wikimedia Commons (≥1000 px, hasta 2268 px). Fichas curadas en `tools/desc/22_zdzislaw_beksinski.mjs` |
| `23_mariusz_lewandowski` | Monográfica curada del pintor surrealista polaco contemporáneo Mariusz Lewandowski (25 obras maestras): paisajes metafísicos monumentales, deidades colosales, umbrales oceánicos y portadas célebres del doom metal (*Esencia de la libertad* / *Mirror Reaper*, *Encuentro en el otro lado*, *Amnesia*, *La gran batalla medieval*, *Acto de humildad* / *Stygian*, *El convoy de la muerte*, *El demiurgo*). Fuentes: escaneos directos de óleo sobre lienzo en alta resolución del archivo oficial del Estate / galería oficial (≥1000 px, hasta 2048 px). Fichas curadas en `tools/desc/23_mariusz_lewandowski.mjs` |

## 2. Convención de nombres de archivo

`NN_Titulo_Autor_Año.jpg` — la arma `buildFilename(n, title, artist, year)` (`tools/lib.mjs:22-28`):

- `NN` = `n` del índice con `padStart(2,'0')` (`n`≥100 queda de 3 dígitos). **El prefijo SIEMPRE es `n`.**
- `slugify` (`lib.mjs:10-20`): quita acentos (NFD), `&`→`y`, todo no `[A-Za-z0-9]` → `_`, colapsa `_`, recorta.
  Vacío → `Sin_titulo`. Máximos: título 60, autor 28 (vacío → `Anonimo`), año 12.
- Año vacío → `sa`. Años pueden ser `c1500`, `1500_BC` (los produce `cleanYear`, `lib.mjs:48-56`).
- La extensión es **siempre `.jpg`**, aunque el contenido sea PNG/WebP (ver §8).
- Se **renombra** (el nombre cambia, `n` queda) con `cleanup-names.mjs` (re-normaliza title/artist/year).
  Se **renumera** (cambia `n` Y nombre) con `prune-canon.mjs` / `prune-modern.mjs` (compactan 1..N) y
  `dore-desc.mjs` (reordena Infierno→Purgatorio→Paraíso y renombra en dos pasadas con temporal).
- Por eso `n` y `file` NO son identificadores estables: para referenciar una obra usá `qid` o `sourceId` (§4).

## 3. Diccionario de campos de `_index.json`

Forma: objeto `{ "collection": "<NN_nombre>", "items": [ ... ] }`. **No es un array.**
Grupos: **T** = 01–06 · **C** = 07–12 y 16 (canon) · **M** = 13–15 · **D** = 17. Porcentajes = presencia aprox. al 2026-10-15
(derivados leyendo los índices). `—` = ninguna.

| Campo | Tipo | Qué es | Lo llena | Presencia / obligatorio |
|---|---|---|---|---|
| `n` | number | Número correlativo dentro de la colección. Único por colección, NO necesariamente contiguo (§8) | todos los adquisidores; renumeran `prune-*`, `dore-desc` | 100%. **Obligatorio** |
| `file` | string | Nombre de archivo (§2) | idem + `cleanup-names` | 100%. **Obligatorio** |
| `orientation` | `landscape`\|`portrait` | `w>=h` → landscape (cuadradas también). Carpeta donde vive el archivo (`orientationOf`, `lib.mjs:146`) | adquisidores; corrige `fix-dims` | 100%. **Obligatorio** |
| `title` | string | Título original (inglés/idioma fuente), limpiado con `cleanTitle`. En D = `title_es` | adquisidores; `dore-desc` en D | 100%. **Obligatorio** |
| `title_es` | string | Título en español | `apply-desc.mjs`, `gap-desc.mjs`, `wikiart.mjs`, `sculptures.mjs`; `dore-desc` (D: `"Cántica · Canto N"`) | T 73% · C 48% · M 78% · D 100%. Opcional: si falta, usar `title` |
| `artist` | string | Autor curado/limpio (`cleanArtist`); anónimo = `Anonimo` (lo normal) o `Anónimo` (1 caso, `move-aphrodite`) | adquisidores | 100%. **Obligatorio** |
| `artist_museum` | string | Autor tal como lo dice el museo (antes de limpiar) | solo `collect.mjs:173` | T 35% · resto — . Opcional |
| `year` | **string** | Año/época. Casi siempre `1888`, `c1500`, `1500_BC`; hay texto libre residual (`"Late 15th century."`, `"XVII Secolo"`) y 10 vacíos | adquisidores + `cleanYear` | 100% (puede ser `""`). **Obligatorio** |
| `classification` | string | Clasificación del museo (`painting`, `Paintings`…) | `collect.mjs` | T 69% · resto — |
| `museum` | enum | **Fuente de descarga**, NO el museo donde está la obra: `The Met` · `Cleveland` · `Wikimedia` · `Wikidata/Commons` · `WikiArt` · `Wikimedia/Commons` (D) | adquisidores | 100%. **Obligatorio** |
| `holding_museum` | string\|null | Museo real (Wikidata P195 o fuente). Texto en español | `canon.mjs`, `wikidata-enrich.mjs`, `apply-desc.mjs`, `wikiart.mjs` | T 86% · C 100%(6% null) · M 100% (22% null) · D siempre `null` (a propósito) |
| `museum_confidence` | enum | De dónde sale `holding_museum`: `fuente` (Met/Cleveland) · `wikidata` (canon) · `wikidata?` (match de autor sin verificar) · `falta` | `canon.mjs`, `wikidata-enrich.mjs` | T 79% · C 100% · M 27% (solo canon) · D — |
| `license` | string | Registro, NO filtro. Valores heterogéneos: `Public Domain`, `Public domain`, `CC0`, `Dominio público`, `Dominio público (verificar)`, `Con copyright (uso personal)` | adquisidores | 100%. **Obligatorio** (no comparar por igualdad exacta) |
| `source_url` | string | Página de la obra (museo, Wikidata, WikiArt o Commons) | adquisidores | 100%. **Obligatorio** |
| `image_url` | string | URL desde donde se bajó (puede ser un render, no el original) | adquisidores | 100%. **Obligatorio** |
| `width`,`height` | number | Píxeles REALES del archivo en disco | adquisidores (miden el buffer); corrige `fix-dims` | 100%. **Obligatorio** |
| `bytes` | number | Tamaño del archivo en disco | idem | 100%. **Obligatorio** |
| `sourceId` | string | Id en la fuente: objectID Met, id Cleveland, `File:…` de Commons. Clave de dedup (§4) | adquisidores | ~95% — falta en todas las de `wikiart.mjs` (13–15 `kind:moderno`) |
| `kind` | enum | Cómo entró: `named` (target curado) · `discovery` (barrido) · `canon` · `escultura-canon` · `moderno` (WikiArt) · `dore-dante` | adquisidores | 100%. **Obligatorio** |
| `school` | string | Escuela/movimiento (ej. `Barroco`, `Romanticismo (ilustración)`). Para canon = título de la colección salvo que `wikidata-enrich`/`apply-desc` lo cambien | `canon.mjs`, `wikiart.mjs`, `wikidata-enrich`, `apply-desc` | 100% |
| `type` | string\|null | Técnica/soporte en español (`Óleo sobre lienzo`) | `wikidata-enrich`, `apply-desc`, `wikiart.mjs`, `sculptures.mjs` | clave en 100%; `null` en ~30% de T/C |
| `canon_rank` | number | Fama = nº de sitelinks de Wikidata | `canon.mjs`, `wikidata-enrich`, `sculptures` | T 75% · C 100% · M 27% (solo canon) · D — |
| `qid` | string | Item Wikidata `Q…`. **Confiable solo en `kind` canon/escultura-canon.** En `named`/`discovery` lo asigna `wikidata-enrich` por búsqueda de título → puede ser un concepto genérico repetido (§4) | `canon.mjs:129`, `sculptures.mjs:98`, `wikidata-enrich.mjs` | T 75% · C 100% · M 27% · D — |
| `description` | string | Ficha en español: qué muestra y qué significa (`docs/DESCRIPCIONES.md`) | `apply-desc`, `enrich-es`, `gap-desc`, `wikiart.mjs`, `dore-desc` | 100% (0 vacías hoy) |
| `description_source` | string | Trazabilidad: `Síntesis (Claude, fundada en Wikipedia/curatoría)` · `Wikipedia-es: <artículo>` · `Síntesis (Claude, sobre la Divina Comedia)` · marcadores `(sin canto)`/`(canto sin texto)` en D | idem | 100% |
| `image_quality` | `baja`\|`media`\|`alta` | Nota de calidad en obras con fuente despareja (WikiArt: ≥2400 alta, ≥1500 media, resto baja) | `wikiart.mjs`, `upgrade.mjs`, `gap-desc.mjs` | M 74%, unas pocas en T/C; resto — |
| `canto` | number | Número de canto (1..34) | solo `dore-desc.mjs:85` | D 100%, resto — |

**Col 17 (Doré), faltantes por diseño:** sin `holding_museum` (siempre `null`), sin `qid`/`canon_rank`/`museum_confidence`,
`year` fijo `"1861"`, `title_es`=`title`=`"Infierno · Canto V"` (hay varias planchas por canto; `n` las distingue),
`type`=`Grabado`. Varias obras comparten título; es normal en D.

## 4. Claves de identidad y dedup

| Clave | Dónde | Detalle |
|---|---|---|
| `idKey(museum, sourceId)` = `"museo:id"` | `lib.mjs:216-220` (`alreadyHave`) | Idempotencia de `collect.mjs`: no re-baja lo que ya está en SU índice (`collect.mjs:91`) **ni en las otras colecciones** (`loadExternalKeys`, `collect.mjs:73-85`) |
| `qid` + título-autor (`taKey`) | `canon.mjs:63-97`, `sculptures.mjs:64-72` | Antes de bajar, cruza contra TODAS las carpetas `NN_*`. Salta si el `qid` o título+autor ya existen |
| título-apellido | `wikiart.mjs:77` | Solo contra la propia colección (no mira otras) |
| contenido (título+autor, autor+WxH) | `collect.mjs:134-146` | Dedup dentro del barrido, antes de descargar |
| `qid` o apellido+WxH | `prune-canon.mjs:17-20` | Poda a posteriori de 07–12: lo que repite algo de 01–06 o de una colección previa se borra. **No incluye 13–17 ni 16** (`ALL`, `prune-canon.mjs:10-12`) |
| dHash 256 bits | `dore-dedup.mjs` | Solo col 17: duplicados visuales entre ediciones |

- **Idempotente:** re-correr un adquisidor no duplica. Aun así `n` nuevo = `max(n)+1`
  (`collect.mjs:89`, `canon.mjs:110`, `wikiart.mjs:78`) → los huecos nunca se rellenan solos.
- **`qid` repetido en 01–06 no implica duplicado.** Ej.: varias "Madonna and Child" (Duccio, Crivelli, Verrocchio…) comparten
  un `qid` genérico porque `wikidata-enrich.mjs:35-59` toma el item más famoso por búsqueda de título. Usarlo como clave única
  solo en canon. `audit.mjs` lo avisa como `W-QID-DUP` (aviso, no falla).

## 5. `_descartes/<colección>.jsonl`

Una línea JSON por descarte, append-only (`logDiscard(rootDir, collection, entry)`, `lib.mjs:223-227`).
**Solo escriben:** `collect.mjs` (01–06) y `dore-dedup*.mjs` (17). `canon`, `sculptures`, `wikiart`, `prune-*` NO loguean:
que no haya archivo para 07–16 es normal. No hay esquema fijo; siempre trae `reason`:

| `reason` | Quién | Campos extra típicos |
|---|---|---|
| `no_match` | target nombrado sin resolver (`collect.mjs:101`) | `kind:"named"`, `n`, `title`, `artist`, `err` |
| `low_res` | lado largo < piso (`collect.mjs:109`, `discover.mjs:38,112`) | `long`, `title`, `source_url`, `stage` |
| `excluded` / `junk_title` / `modern` / `too_modern` | filtros de `discover.mjs:35-134` | `title`, `stage`, `year` |
| `dup` | dedup por contenido (`collect.mjs:145`) | `stage:"dedup-content"`, `title` |
| `download_error` | falló la descarga (`collect.mjs:183`) | `err`, `image_url` |
| `dup_visual` | Doré (`dore-dedup-apply.mjs`, `dore-dedup.mjs --apply`) | `n`, `file`, `sourceId`, `moved_to:"_dedup_removed"` |
| `dup` · `baja_calidad` · `fuera_de_tema` · `error` · `otro` (`--why=`) | `remove-work.mjs` (cualquier colección) | `n`, `file`, `sourceId`, `qid`, `title`, `note`, `moved_to` |

(`modern` está en el código pero no aparece hoy en ningún `.jsonl`.)
## 6. Agregar / quitar / mover una obra sin romper nada
**Regla:** nunca editar a mano `_index.json` ni mover/borrar JPG a mano. Siempre por script, o creá un script nuevo con el patrón
de `move-aphrodite.mjs` / `dore-dedup-apply.mjs` (dry-run por defecto, `--apply` para escribir). Un solo escritor a la vez por `_index.json`.

| Quiero… | Script | Notas |
|---|---|---|
| Agregar a 01–06 | `collect.mjs --col=<colDir COMPLETO, p.ej. 02_barroco> [--max=N] [--dry]` (+ `targets-0N.mjs`) | Sin `--col` usa la 01 en silencio. Baja salvo `--dry`. `--max` cuenta obras NUEVAS: re-correr una colección terminada agrega hasta N más |
| Agregar canon (07–12, 16, ampliar 02/03/04/13) | `canon.mjs <colDir> --apply` (+ `canon/NN.mjs`) | Cruza dedup contra todo. **¿collect o canon?** `collect.mjs` solo tiene registro para 01–06 (temáticas, por tema); para ampliar 02/03/04 con "las más famosas" se usa `canon.mjs` |
| Agregar escultura antigua | `sculptures.mjs --apply` | Edita la lista `LIST` |
| Agregar moderna (13–15) | `wikiart.mjs <colDir> --apply` (+ `wikiart/NN.mjs`) | Sin `sourceId`/`qid` |
| Agregar plancha de Doré | no hay camino seguro: `dore.mjs` baja sin validar y no se re-ejecuta; escribir un script nuevo que use `downloadTo` (valida) y luego `dore-desc.mjs` | `dore-desc` renumera TODO y no tiene dry-run (copiá `_index.json` y la carpeta antes) |
| Agregar/cosechar escultura griega (18) | `harvest-18-sculptures.mjs [--apply]` (+ `targets-18-sculptures.mjs`) | Valida piso ≥1000px, orientación y licencias. Dry-run por defecto |
| Agregar/cosechar Marcelo Canevari (19) | `harvest-19-canevari.mjs [--apply]` (+ `targets-19-canevari.mjs`) | Valida piso ≥1000px, orientación y magic bytes. Dry-run por defecto |
| Agregar/cosechar Alfred Kubin (20) | `harvest-20-kubin.mjs [--apply]` (+ `targets-20-kubin.mjs`) | Valida piso ≥1000px, orientación y magic bytes. Dry-run por defecto |
| Agregar/cosechar Rob Gonsalves (21) | `harvest-21-gonsalves.mjs [--apply]` (+ `targets-21-gonsalves.mjs`) | Valida piso ≥1000px, orientación y magic bytes. Dry-run por defecto |
| Completar `qid`/museo/escuela | `wikidata-enrich.mjs <colDir> --apply` | Corre antes que `enrich-es`/`prune-canon` |
| Completar ficha | `apply-desc.mjs` (`tools/desc/NN.mjs`) o `enrich-es.mjs` | Editá `tools/desc/NN.mjs`, no el índice |
| Corregir dims/orientación | `fix-dims.mjs <colDir> --apply` | Re-mide del disco; mueve entre `landscape/`↔`portrait/` |
| Re-normalizar nombres | `cleanup-names.mjs <colDir> --apply` | Idempotente |
| **Quitar UNA obra (cualquier colección)** | `remove-work.mjs <colDir> --n=N [--why=dup\|baja_calidad\|…] --apply` (o `--sourceId=…`) | **El camino normal.** Mueve el archivo a `_dedup_removed/`, quita el item (NO renumera), loguea el descarte y limpia su entrada de `tools/desc/`. Dry-run por defecto |
| Quitar varias por criterio (pasada puntual) | `prune-modern.mjs` / `prune-canon.mjs` | **NO re-correr:** en dry proponen sacar obras ya aceptadas (excepciones de `docs/CALIDAD.md` §4) y renumeran (desfasa `tools/desc/`). Con `--apply` ahora MUEVEN a `_dedup_removed/` (antes borraban) |
| Quitar en Doré | `remove-work.mjs 17_dore_divina_comedia --n=N --apply` | `dore-dedup-apply.mjs` es de un solo uso y aborta; `dore-desc.mjs` renumera después |
| Mover entre colecciones | copiar `move-aphrodite.mjs` | Escribe AMBOS índices, rearma `file` con `buildFilename`, ocupa o deja un hueco de `n` |

Atención: quitar a mano un JPG, o poner uno nuevo sin entrada en el índice, rompe el inventario (huérfano / `F-MISSING`). Las imágenes no están en git: lo que se borra de verdad no vuelve; por eso todo pasa por `remove-work.mjs` (mueve, no borra). Recuperar una obra apartada = devolver el archivo a su carpeta y reinsertar el item (hoy sin script: `_descartes/<col>.jsonl` guarda sus datos).

**Invariantes tras cada cambio:** (1) el archivo existe en `<col>/<orientation>/<file>`; (2) `width`/`height`/`bytes` = archivo real (medir el buffer, no lo que promete la API); (3) `orientation` = `w>=h ? landscape : portrait`; (4) `n` único y `file` empieza con su `n` zero-padded; (5) cero huérfanos y cero entradas repetidas; (6) `description` no vacía. Cerrar siempre con `node tools/audit.mjs`.

## 7. Invariantes verificables (`tools/audit.mjs`)

Solo lectura. Códigos: **F-** = falla (exit 1), **W-** = aviso. Hoy chequea:
`F-INDEX` (forma `{collection,items}`, no array) · `F-N-DUP` (`n` repetido) · `F-MISSING` (falta archivo o está en la otra orientación) ·
`F-DUPFILE` · `F-TINY` (< 20 KB: típica página de error) · `F-MAGIC` (no es JPEG/PNG/WebP) · `F-DIMS` (índice ≠ cabecera real) ·
`F-ORIENT` · `F-ORPHAN` (en disco, no en índice) · `W-PREFIX` (prefijo ≠ `n`) · `W-EXT` (extensión `.jpg`, contenido no-JPEG) ·
`W-DIMS` · `W-RES` (bajo el piso: 1000 px, 800 en 13–15) · `W-DESC` (sin ficha) · `W-DESC-STALE` (`tools/desc/<col>.mjs` desfasado del índice) · `W-TITLE-DUP` · `W-QID-DUP` · `W-N-GAP` (`n` no contiguo).
Audit no juzga si la obra es buena o la correcta (`docs/CALIDAD.md`).

## 8. Gotchas

- **`.jpg` que no es JPEG.** `buildFilename` fuerza `.jpg` y `downloadTo` guarda los bytes tal cual, sin convertir (solo exige que sean una imagen: JPEG/PNG/WebP/TIFF).
  Hay varios PNG y algún WebP con extensión `.jpg` (foto 2026-10-15; la lista viva es `node tools/audit.mjs --all` → `W-EXT`; p. ej. `03_gotico/portrait/69_Virgen_del_canciller_Rolin_Jan_van_Eyck_1500.jpg` es **WebP**).
  Los visores/TV suelen abrirlos bien, pero herramientas que asumen JPEG fallan. `lib.mjs` `imgSize` mide JPEG, PNG y WebP (desde 2026-10-15). No convertir ni renombrar sin pedido (política: NO editar imágenes); decisión pendiente en `docs/TODO.md`.
- **Descarga que "anda" y es basura.** Wikimedia puede devolver una página de error HTML con HTTP 200 (pasó con toda la col 17). Desde 2026-10-15 `downloadTo`
  valida por magic bytes y rechaza la no-imagen (reintenta; si no se recupera, lanza sin escribir). Lo que baje por otro camino (`dore.mjs` usa su propio `fetch`) debe validar
  magic bytes (`FF D8`) y tamaño (patrón `dore-redownload.mjs`). `audit.mjs` lo caza con `F-MAGIC`/`F-TINY`.
- **`n` no contiguo.** Puede haber huecos por podas/movidas (`remove-work.mjs`, `move-aphrodite.mjs`; lista viva: `audit` → `W-N-GAP`). Es válido
  (solo aviso); nunca asumas `items.length === max(n)` ni `items[i].n === i+1`. Los adquisidores agregan con `max(n)+1`: los huecos no se rellenan solos.
- **`museum` ≠ museo.** `museum` es la fuente de descarga; el museo real es `holding_museum`. Filtrar "obras del Prado" con `museum` no funciona.
- **`year` es string** y mezcla formatos; no lo ordenes numéricamente sin parsear (`c`, `_BC`, texto libre).
- **`license` no es filtro** (uso personal); las de "Con copyright" no se publican.
- **`_cantos.json` (17)** tiene más claves que obras en el índice (incluye entradas de planchas ya movidas a `_dedup_removed/`): no usarlo para contar.
- **Un solo escritor** sobre cada `_index.json`: los scripts leen-modifican-reescriben todo el archivo; dos corridas en paralelo se pisan.
- **Sin `sourceId` en las de WikiArt** → `loadExternalKeys` las ve como `WikiArt:undefined`; su dedup es solo título-apellido.
