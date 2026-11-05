# CALIDAD — cómo garantizamos que las piezas son buenas

Lector: agente sin memoria. Estado vivo (cantidades, fallas): `node tools/audit.mjs` y `docs/TODO.md`. Método general: `docs/METODO.md`. Fuentes: `docs/FUENTES.md`. Si este doc y el código discrepan, manda el código.

## 1. Qué significa "calidad" acá

1. **Relevancia > tamaño (regla de oro).** Pocas obras excelentes antes que muchas mediocres. Una obra icónica entra aunque no llegue a Full HD, mientras supere el piso.
2. **La resolución es un piso, no un criterio de relevancia.** Piso duro anti-basura; Full HD+ es solo *preferencia* en el barrido de descubrimiento (donde sobra de dónde elegir).
3. **Fidelidad:** no se recorta, edita ni retoca. Se respeta el aspecto original (no se filtra por aspect ratio).
4. **Tiene que ser LA obra:** no réplica, detalle, grabado de la obra, foto de instalación, facsímil ni arte digital/IA.
5. **El archivo en disco es la verdad,** no lo que promete la API.

## 2. Gates (relevados del código)

| Gate | Qué asegura | Umbral | Dónde | Cómo verificar |
|---|---|---|---|---|
| Piso de lado largo | Nada de basura chica | `MIN_LONG_SIDE = 1000` | `tools/lib.mjs:229`; usado en `collect.mjs:62,108` (nombrados), `resolve.mjs:143` (prefiere candidato ≥piso) | `node tools/audit.mjs` (AVISO <1000) |
| Piso del canon 07–12 | Poda de diminutas (**una pasada, no re-correr**) | min lado <300 **o** lado largo <800 se aparta (MUEVE a `_dedup_removed/`) | `prune-canon.mjs:31` | ídem |
| Piso modernas 13–15 | WikiArt es despareja | bajada: ≥700 (`wikiart.mjs:70`); poda default 1000 (`prune-modern.mjs:9`; `--min=0` NO lo desactiva; una pasada, no re-correr); audit tolera ≥800 | ver arriba | ídem |
| Piso Doré (17) | Grabados nítidos | lado largo ≥2400 | `dore.mjs:14` | ídem |
| Preferencia Full HD | Elegir lo más grande al descubrir | `PREFER_LONG_SIDE = 1920` (`lib.mjs:230`); el filtro efectivo es `DISCOVERY_FLOOR = 1920` (`discover.mjs:8,38,112`) | **solo descubrimiento**, nunca nombrados | log `_descartes/*.jsonl` (`reason: low_res`) |
| Techo Wikimedia | No bajar monstruos | lado largo máx. 8000 (render JPEG, sin upscalear) | `resolve.mjs:171`, `canon.mjs:69-70`, `discover.mjs:115`, `dore.mjs:95`, `sculptures.mjs:55` | `audit.mjs` (dims) |
| Medir el archivo REAL | Wikimedia clampea renders (~3840 px) y la API promete más | re-medir el buffer descargado | `collect.mjs:163`, `canon.mjs:123`, `dore.mjs:101` | `node tools/fix-dims.mjs <col>` (dry) |
| `fix-dims.mjs` | Índice = disco | corrige width/height/bytes y mueve de carpeta | `fix-dims.mjs:14-28` | `--apply` para escribir |
| Dedup por contenido (descubrimiento) | Sin repetidos | título+autor (4 palabras >3 letras) o autor+dims exactas | `collect.mjs:132-145` | `audit.mjs` (h) |
| Dedup entre colecciones | Una obra, una carpeta | `qid`, o autor+dims exactas | `prune-canon.mjs:17-20`; `canon.mjs:76-97` (qid o título+autor) | `audit.mjs` (h) |
| Dedup visual Doré | Mismas planchas en varias ediciones | dHash 256 bits, `--th` default 18 | `dore-dedup.mjs:12,15-21`; `dore.mjs:40,76` usa aHash, Hamming ≤12 (más grueso) | sección 3 |
| Anti-basura descubrimiento | Sin detalles/copias/IA/modernos | regex `BAD`, `MODERN`, `JUNK_TITLE`, `maxYear` por colección (con excepción a.C.) | `discover.mjs:61-65,108,125-132` | log `reason: junk_title/modern/too_modern` |
| Scoring de match (nombrados) | Que sea LA obra | archivo +5 vs descripción +2; token en archivo +1.5 vs +0.5; veneno `BAD_WORDS` descarta | `resolve.mjs:98,121,129-136` | `node tools/dryrun.mjs` |
| Fama (canon) | Relevancia por proxy | sitelinks Wikidata ≥ `minFame` (default 4; configs usan 4–6) | `canon.mjs:44`, `tools/canon/*.mjs` | `canon.mjs <col>` sin `--apply` (lista por fama) |
| Chequeo de aspecto | No reemplazar por otra imagen | rechaza si el aspecto difiere >12% | `upgrade.mjs:49` (`< 0.12`) | `node tools/upgrade.mjs` (dry) |
| Magic bytes | Que sea imagen y no HTML de error | JPEG `FF D8`, PNG o WebP, >1000 B (TIFF se rechaza: nada lo mide) | `lib.mjs` `looksLikeImage` + `downloadTo(…, {validate:true})` (default; desde 2026-10-15); `dore-redownload.mjs:17-19,54` | `audit.mjs` (b) |

### Hueco que había (CERRADO 2026-10-15): `lib.downloadTo` no validaba contenido
Antes, `downloadTo` aceptaba cualquier `r.ok` y escribía el buffer tal cual. Si Wikimedia rate-limiteaba (429) pero respondía HTML con HTTP 200, se guardaba un `.jpg` que era una página de error. Pasó en la colección 17 (155 archivos de 2 KB; rescatados con `dore-redownload.mjs`). Agravante: `collect.mjs`, `canon.mjs`, `dore.mjs` y `sculptures.mjs` hacen `imgSize(buf) || {w: API, h: API}` → con un archivo no-imagen, **el índice quedaba con las dims prometidas por la API y nada fallaba**.
**Hoy:** `downloadTo` valida por magic bytes (`looksLikeImage`: JPEG/PNG/WebP) y trata una no-imagen como intento fallido: reintenta con backoff y, si no se recupera, **lanza error** sin escribir el archivo (probado contra un servidor local que responde HTML con 200). Se puede desactivar con `{validate:false}` solo para descargas que no sean imágenes.
**Lo que sigue abierto:** `dore.mjs` baja con su propio `fetch` (no usa `downloadTo`, no mira `r.ok`, 5 en paralelo): **no lo re-corras**; para Doré usá `dore-redownload.mjs`. Y como defensa en profundidad, correr `node tools/audit.mjs` después de CADA descarga masiva.

Otros límites de medición: `imgSize` mide JPEG, PNG y WebP (WebP desde 2026-10-15; antes devolvía `null`). `measureRemote` pide Range de 256 KB (`lib.mjs:130`; el doc viejo decía 128 KB). Cleveland sirve `full` como TIFF (no medible): se baja el `print` JPEG (~3400 px).

## 3. Revisión visual de duplicados (planchas repetidas entre ediciones)

Caso real: Doré (17) tenía cada plancha 2–4× por ediciones distintas.

1. **Hoja de contacto:** `node tools/dore-montage.mjs <Infierno|Purgatorio|Paraiso> <canto>` → `_inspect/montage_<cantica>_<canto>.jpg` (grilla etiquetada `nXX WxH sourceId`, celda 300 px).
2. **Candidatos por dHash:** `node tools/dore-dedup.mjs [--th=N]` (dry por default; agrupa por Hamming ≤ `th`). Calibración documentada: duplicado verdadero ≈ ≤11 bits, plancha distinta ≈ ≥56 de 256 — **viene de `tools/README.md` viejo; el código solo imprime pares hardcodeados** (`dore-dedup.mjs:34-36`, con números `n` de la numeración original) [NO VERIFICADO: no se recalculó]. Entre 12 y 55 hay zona gris: decide un humano/agente con ojos.
3. **Decisión:** se conserva el mejor escaneo (mayor área, luego bytes). Se aplica con `node tools/remove-work.mjs <col> --n=N --apply` (**MUEVE** a `<col>/_dedup_removed/` —recuperable—, saca del índice, loguea y limpia la ficha). `dore-dedup-apply.mjs` fue el script de UNA pasada de Doré y hoy aborta.
4. **Regla ante la duda:** conservar ambos o mover; **nunca borrar**.
5. Revisar imágenes exige un agente que **VEA** (leer el JPG de la hoja). Sin ojos, el dHash con `--th` bajo (≤11) es la alternativa: solo toma duplicados casi seguros, deja el resto sin tocar.

**Trampas verificadas (y su estado):**
- `dore-dedup.mjs --apply` antes **borraba** (`fsp.rm`), contra la regla. **Corregido 2026-10-15:** ahora MUEVE a `_dedup_removed/`.
- `dore-dedup-apply.mjs` tiene una lista `REMOVE` hardcodeada con la numeración ORIGINAL (hasta n=155); el índice actual está renumerado 1..N. **Corregido 2026-10-15:** ahora **aborta siempre** (antes la guarda dependía de que `_dedup_removed/` tuviera archivos). Para un dedup nuevo: `remove-work.mjs`.
- `prune-canon.mjs` y `prune-modern.mjs` **antes borraban** (`unlink`); desde 2026-10-15 con `--apply` MUEVEN a `_dedup_removed/`. Siguen siendo de **una pasada, no re-correr**: en dry proponen sacar obras ya aceptadas (excepciones de §4) y **renumeran** (desfasa `tools/desc/`). Para sacar UNA obra: `remove-work.mjs`.

## 4. Excepciones conocidas y aceptadas (criterios, no lista)

El estado vivo está en `node tools/audit.mjs` (AVISOS) y `docs/TODO.md`. Criterios:

| Criterio | Ejemplo |
|---|---|
| Obra icónica cuyo original libre es chico; entra por relevancia | Wright of Derby (col 10): originales de 750 px en Commons |
| Moderna con copyright: WikiArt es despareja, se marca `image_quality` (`alta` ≥2400, `media` ≥1500, si no `baja`; `wikiart.mjs:93`) | col 13–15: Picasso *La mujer que llora* 960 px, Kandinsky 824 px (`baja`) |
| Escultura/foto 3D sin foto libre de calidad | Giambologna *Rapto de las Sabinas* (col 07, 640 px) |
| Calidad extrema pero nunca se ve entera | gigapíxel Uffizi: se baja render de 8000 px |

Hay obras *bajo* los pisos por motivos históricos (p.ej. Puvis de Chavannes en la 12; lista viva: `node tools/audit.mjs` → `W-RES`). `prune-canon` fue una pasada puntual: no impide agregar luego obras chicas. Cada una debe justificarse en `docs/TODO.md` o corregirse.

## 5. Checklist para incorporar una obra nueva

1. ¿Es relevante? Para canon: `fame` (sitelinks) ≥ `minFame` de su config. Para temática: está en `_targets.md`.
2. Resolver la fuente por API (Met/AIC/Cleveland/Commons/Wikidata); ver `docs/FUENTES.md`.
3. Verificar que sea la obra: nombre de archivo y título sin palabras-veneno (detail/copy/engraving/replica/installation…).
4. Medir dimensiones **antes** de bajar (Range o `imageinfo`) y exigir lado largo ≥1000 (≥800 si es 13–15). Una obra NUEVA por debajo se descarta, salvo aceptación explícita del usuario (anotarla en §4).
5. Bajar la versión más grande; Wikimedia: original si JPEG ≤8000, si no render a 8000.
6. Magic bytes: `downloadTo` ya los valida y rechaza HTML de error; igual se confirma en el paso 10 con `audit.mjs`.
7. Re-medir el archivo en disco y guardar ESAS dims; ubicar en `landscape/` si w≥h, si no `portrait/`.
8. Dedup contra TODAS las colecciones (qid, título+autor, autor+dims).
9. Registrar `license`, `image_quality` si <1500 o con copyright, y la ficha (`docs/DESCRIPCIONES.md`).
10. Correr `node tools/audit.mjs`: debe terminar sin FALLAS.

## 5b. Excepción al "no recortar": planchas de Doré en páginas de libro (2026-11-04)
Guido autorizó recortar **solo el margen de papel y el fondo** de las planchas de la colección 17 que en Commons existen únicamente como foto de página (edición Moeser/Polona). Reglas: (1) solo con `tools/dore-crop.mjs` (detecta el grabado como la mayor zona no-papel y corta el rectángulo; sin retoque, sin reescalado, sin cambio de color); (2) nunca si hay una versión limpia ≥2000 px; (3) cada obra recortada lleva `processing: "recorte de margen (dore-crop.mjs)"` y `source_page` con el archivo original de Commons; (4) revisión visual de TODAS las recortadas antes de dar la colección por buena. No se extiende a otras colecciones sin nueva decisión.

## 6. Qué NO garantizamos

- **Relevancia = proxy por fama de Wikidata** (sitelinks), no juicio curatorial; puede colar obras menores o dejar afuera una importante sin P18.
- **Licencias:** el proyecto es de uso personal; se *registra* `license` pero no se filtra. Muchas dicen "Dominio público (verificar)" y **no están verificadas** obra por obra.
- **Descripciones** sintetizadas de fuentes sin revisión humana obra por obra.
- **Modernas con copyright** pueden quedar en baja resolución (best-effort).
- Que cada título/autor/museo del índice sea exacto (hubo errores, p.ej. una Afrodita con autor falso).
- Que el match de Wikimedia sea siempre la obra correcta: el scoring es heurístico.

## 7. Verificación ejecutable: `node tools/audit.mjs`

Por colección valida: (a) `_index.json` con forma `{collection, items}` y `n` únicos; (b) cada archivo existe, empieza con magic bytes JPEG/PNG/WebP y pesa >20 KB; (c) dims del índice = dims reales del header; (d) orientación coherente (w≥h → landscape); (e) lado largo ≥1000 (≥800 en 13–15), si no **AVISO**; (f) sin archivos huérfanos en disco; (g) cobertura de fichas; (h) duplicados por qid/título. Salida: totales + FALLAS/AVISOS; código de salida ≠0 si hay FALLA. Es la fuente de los números de estado; no copiar cifras a otros docs.
**Códigos:** FALLAS (rompen el inventario) `F-INDEX` `F-N-DUP` `F-MISSING` `F-DUPFILE` `F-TINY` `F-MAGIC` `F-DIMS` `F-ORIENT` `F-ORPHAN`. AVISOS (a revisar) `W-RES` (bajo el piso de revisión) `W-EXT` (extensión `.jpg` con contenido PNG/WebP: algunos visores la rechazan) `W-DESC` `W-DESC-STALE` (`tools/desc/<col>.mjs` desfasado: re-correr `apply-desc` pegaría fichas equivocadas) `W-QID-DUP` `W-TITLE-DUP` `W-N-GAP` `W-PREFIX` `W-DIMS`. `--col=NN` limita a una colección, `--all` no recorta los avisos, `--json` salida máquina-legible.
**Pisos del audit:** 1000 px de lado largo (800 en 13–15) son pisos de *revisión*: lo que queda debajo es AVISO, no error, porque el código aplica pisos distintos por vía (tabla de arriba) y hay excepciones aceptadas (sección 4).
