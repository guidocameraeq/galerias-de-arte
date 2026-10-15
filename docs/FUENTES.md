# FUENTES — de dónde sale cada cosa y las trampas de cada una

> Si el código y un doc viejo (`docs/archive/legacy-2026-06/`) se contradicen, **manda el código**.
> Referencias `archivo:línea` son de `tools/`. `[NO VERIFICADO]` = sale solo de docs viejos, no hay código que lo pruebe.
> Hub: `AGENTS.md`. Método: `docs/METODO.md`. Calidad/pisos: `docs/CALIDAD.md`. Fichas: `docs/DESCRIPCIONES.md`.

## 1. Tabla de fuentes

| Fuente | Qué aporta | Acceso (verificado) | Auth / UA | Límites y etiqueta | Scripts |
|---|---|---|---|---|---|
| **The Met** | Imagen original + metadata; solo PD | `collectionapi.metmuseum.org/public/collection/v1/search?q=…&hasImages=true` → `objects/{id}` (`resolve.mjs:14-22`) | Sin key. UA `Arte-PublicDomain-Project/1.0` (`resolve.mjs:7`) | Se corta a 20 ids por búsqueda (`resolve.mjs:17`) / 12 en descubrimiento (`discover.mjs:11`). Exige `isPublicDomain` y `primaryImage`. `museum='The Met'`, `license='Public Domain'` | `resolve`, `discover`, `collect`, `enrich-desc` (ficha) |
| **Cleveland (Open Access)** | Imagen + metadata CC0; texto curatorial | `openaccess-api.clevelandart.org/api/artworks/?q=…&cc0=1&has_image=1&limit=15` (`resolve.mjs:48`); detalle `/api/artworks/{id}` → `.data` (`enrich-desc.mjs:69`) | Sin key. Mismo UA que Met | `museum='Cleveland'`, `license='CC0'`. Dims vienen de la API, no se miden (`resolve.mjs:68`) | `resolve`, `enrich-desc` |
| **Art Institute of Chicago** | **Nunca implementado**: no hay código ni obras con `museum` AIC | IIIF `info.json` solo figura en docs viejos `[NO VERIFICADO]` | — | No contar con esta fuente sin escribirle un resolutor | ninguno |
| **Wikimedia Commons** | Volumen principal: obras de museos europeos, grabados, esculturas | API `commons.wikimedia.org/w/api.php`: `list=search` (`resolve.mjs:109`), `list=categorymembers` (`discover.mjs:97`), `prop=imageinfo` con `iiprop=url\|size\|mime\|extmetadata` y `iiurlwidth` (`resolve.mjs:101`). Nombre de archivo vía `Special:FilePath/…` que viene de Wikidata P18 (`canon.mjs:56,114`) | Sin key. UA `Arte-PD-Collection/1.0 (<email de contacto>)` | Techo 8000 px lado largo (`resolve.mjs:171`); sin upscalear. `museum` = `Wikimedia`, `Wikimedia/Commons` o `Wikidata/Commons` según el script | `resolve`, `discover`, `canon`, `sculptures`, `dore*`, `enrich-desc` |
| **Wikidata** | Ranking de fama, QID, museo, año, autor, movimiento | SPARQL `query.wikidata.org/sparql?format=json&query=…` (`canon.mjs:48`, `gap.mjs:36`); `w/api.php` con `wbsearchentities` y `wbgetentities` (`canon.mjs:28,35`; lotes de 50: `wikidata-enrich.mjs:28`) | UA `Arte-PD-Collection/1.0` + `Accept: application/sparql-results+json` | Fama = `wikibase:sitelinks ?n` (`canon.mjs:43`). Propiedades usadas: P170 autor, P18 imagen, P195 museo, P571 año (`canon.mjs:43-45`); P186 material, P135 movimiento, P31 tipo (`wikidata-enrich.mjs:13,54`) | `canon`, `gap`, `sculptures`, `wikidata-enrich`, `enrich-es` |
| **es.wikipedia** | Resumen en español de la obra | QID → título vía `wbgetentities&props=sitelinks&sitefilter=eswiki` (`enrich-es.mjs:30`) → `es.wikipedia.org/api/rest_v1/page/summary/{título}?redirect=true` (`enrich-es.mjs:18`) | UA `Arte-PD-Collection/1.0` | Descarta `type=disambiguation`. `description_source = "Wikipedia-es: <título>"` | `enrich-es` |
| **en.wikipedia** | Resumen alternativo (por título o búsqueda) | REST summary + `w/api.php?list=search&srlimit=1` (`enrich-desc.mjs:33,40`) | Idem | Se rechaza la biografía del autor (`enrich-desc.mjs:47`) | `enrich-desc` |
| **WikiArt (HTTP)** | Modernas con copyright (cols 13-15) y mejoras puntuales | Páginas HTML: `www.wikiart.org/en/{artista}/all-works/text-list` (`wikiart.mjs:37`) y `/en/{slug}` | **UA de navegador obligatorio** (`wikiart.mjs:10`, `upgrade.mjs:9`) | `license='Con copyright (uso personal)'`, `museum='WikiArt'`, `image_quality` alta/media/baja (`wikiart.mjs:93`) | `wikiart`, `upgrade` |
| **Europeana** | No usada. Requiere key gratuita; no hay código | — | — | Descartada por falta de key | ninguno |
| **Rijksmuseum / NGA / Smithsonian** | Solo nombrados como roadmap en docs viejos; sin código | — | — | No existen en el pipeline | ninguno |
| **Google Arts & Culture** | **Descartada.** Gigapíxel no extraíble (tiles encriptados, token por tile, CORS) `[NO VERIFICADO: hallazgo manual en docs viejos]` | — | — | No volver a intentarlo | ninguno |
| **Navegador (Chrome MCP)** | Planeado como "nivel 3 best-effort"; **ningún script ni obra lo usa**. Solo sirvió para investigar Arts & Culture. Si hiciera falta, es a mano, obra por obra | — | — | Calidad despareja | ninguno |

## 2. User-Agent, ritmo y reintentos (lo real)

**UA.** Todas las APIs: `Arte-PD-Collection/1.0 (<email de contacto>)` (`canon.mjs:15`, `gap.mjs:10`, `sculptures.mjs:8`, `enrich-*.mjs`, `wikidata-enrich.mjs:10`, `dore*.mjs`). Excepción: `resolve.mjs:7` usa `Arte-PublicDomain-Project/1.0` (lo heredan `discover` y `collect`). Solo `wikiart.mjs` y `upgrade.mjs` mandan UA de navegador (`Mozilla/5.0 … Chrome/120`), porque WikiArt rechaza UAs no-browser (dato de docs viejos; el código lo respeta). No pongas UA de navegador en las APIs de museos/Wikimedia.

**Ritmo (pausas típicas por request).** Met 80-150 ms (`resolve.mjs`, `discover.mjs`); Commons 100-200 ms; Wikidata 90-200 ms; WikiArt 200-600 ms (`wikiart.mjs:86,107`); `dore-redownload` 350 ms serial (`:98`). No hay límite global de concurrencia salvo `dore.mjs` (5 en paralelo, `:88`) — justo el que provocó el desastre de abajo.

**Reintentos.**
- `getJSON` (`lib.mjs:149`): 4 reintentos por defecto (los scripts suelen pasar 2-4); reintenta ante 429, ≥500, 403, **respuesta que empieza con `<`** (HTML con 200, `lib.mjs:156`) y JSON inválido; espera `500*(i+1)+400*i` ms. Sí detecta el HTML disfrazado.
- `downloadTo` (`lib.mjs`): 3 reintentos, espera `600*(i+1)`; mira `r.ok`, errores de red **y desde 2026-10-15 valida por magic bytes** (`looksLikeImage`): una página de error HTML con HTTP 200 cuenta como intento fallido (reintenta; si no se recupera, lanza y no escribe). `{validate:false}` lo desactiva (solo para no-imágenes).
- `wikiart.mjs` `getText`: 3 intentos, 404 → `null`; `bestImage` valida con `imgSize` (si es HTML no mide y salta).

**Falla clave de Wikimedia.** Cuando rate-limita descargas de originales, a veces devuelve una **página de error HTML con HTTP 200**; `downloadTo` (antes de 2026-10-15, cuando no validaba) la guardaba como `.jpg` (~2 KB). Así quedaron rotos 155 archivos de la col 17 (fuente: comentario `dore-redownload.mjs:1-4` y log 2026-06-28 del PLAN viejo). Causa de fondo: `dore.mjs` baja 5 en paralelo (`:88`) y no chequea `r.ok` (`:100`). Mitigación vigente: `dore-redownload.mjs` = URL autoritativa por `imageinfo` (`:27-46`) + **valida magic bytes** JPEG `FF D8` / PNG `89 50 4E 47` y tamaño >1000 B (`:17-19`) + descarga serial con backoff (`:48-60`). Regla: **toda descarga nueva de Wikimedia debe validar magic bytes y ser serial**. Desde 2026-10-15 `canon.mjs`, `sculptures.mjs` y `collect.mjs` quedan cubiertos porque pasan por `downloadTo`, que valida. Sigue sin validar el `fetch` propio de `dore.mjs` (no lo re-corras; usá `dore-redownload.mjs`). Barrido de integridad: `node tools/audit.mjs`.

## 3. Trampas por fuente

**Met**
- `search` con `hasImages=true` **y** `departmentId` devuelve 0 (docs viejos `[NO VERIFICADO]`; el código esquiva el problema: busca global y filtra `o.department` por **nombre** en el detalle, `discover.mjs:26`, lista en `targets-01.mjs:57`). Barrido por `/objects?departmentIds=` (deptos 10 Egipto, 13 Greco-Romano) es solo teoría de docs viejos: ningún script lo usa.
- Medir sin bajar: `measureRemote` pide `Range: bytes=0-262143` (**256 KB**, `lib.mjs:130`; el doc viejo dice 128 KB: manda el código). Si no mide, baja entero y reutiliza el buffer (`preBuffer`).
- Met ignora mayúsculas; probá grafías (Dionysos/Dionysus).

**Cleveland**
- `images.full` es TIFF y el parser solo lee JPEG/PNG → se elige el JPEG más grande entre `print`/`web`/`full` (`resolve.mjs:66-69`, en la práctica `print` ~3400 px); queda nota `note` si había TIFF (`:72-73`). Dims salen de la API.

**Wikimedia Commons**
- El `thumburl` que *promete* `iiurlwidth` puede no entregarse: renders enormes se **clampean (~3840 px de ancho, a veces menos)** `[NO VERIFICADO en código; viene de docs viejos]`. Por eso se **mide el buffer descargado** y se guarda eso (`collect.mjs:163`, `canon.mjs:123`); `fix-dims.mjs` re-mide del disco. JPEG ≤8000 px se baja como original (sin render, sin clamp): `canon.mjs:69`.
- Scoring (`resolve.mjs:98-137`): el **nombre de archivo** pesa más que la descripción (5 vs 2 por autor, 1.5 vs 0.5 por palabra del título); umbral `sc>=3`; palabras-veneno en el nombre (detail, copy, engrav, replica, installation, gasometer…). Entre válidos, se prefiere el que cumple lado largo ≥1000 y luego mayor score/tamaño (`:142-144`).
- `discover.mjs`: además `BAD`, `MODERN` (arte digital/IA/3D), `JUNK_TITLE` y `maxYear` **consciente de a.C.** (`:61-65,130`). Usar categorías por artista o escuela acotada; las temáticas amplias traen IA.
- Autor: el campo `Artist` de Commons suele ser el uploader. Para targets nombrados se usa el **autor curado** en el nombre de archivo y el de Commons va a `artist_museum` (`resolve.mjs:190-194`, `collect.mjs:173`).
- Los títulos de Commons traen markup Wikibase (`title QS:P1476,…`): limpiar con `cutQS`/`cleanTitle` de `lib.mjs`.
- **Licencia hoy** (ver sec. 5): `resolve.mjs` y `discover.mjs` todavía filtran PD/CC0 (`PD_OK`); `canon.mjs`, `sculptures.mjs` y `dore*.mjs` **no consultan licencia**: el campo `license` que escriben es texto fijo (`'Dominio público (verificar)'`, `canon.mjs:129`; `'Dominio público'`, `sculptures.mjs:98`). No lo tomes como verificado.

**Wikidata**
- Ranking: `ORDER BY DESC(?n)` sobre `wikibase:sitelinks ?n` precalculado (`canon.mjs:43-47`). Docs viejos: no usar `COUNT` (timeout) `[NO VERIFICADO]`. SPARQL falla con `!r.ok` y no reintenta (`canon.mjs:49`, `gap.mjs:37`): reintentá a mano ante 502/timeout.
- Homónimos: el QID del autor se elige entre candidatos cuya descripción matchea `paint|sculpt|artist|…` y, entre ésos, el de **más sitelinks** (`canon.mjs:32-38`). Para obra suelta (`wikidata-enrich.mjs:51`) se verifica apellido del creador (>3 letras).
- Items con basura: un error de Wikidata coló "ética ambiental" como obra de Rafael (log viejo; se podó a mano, `prune-canon.mjs`). Revisá el top antes de `--apply` (`canon.mjs` corre en dry-run sin `--apply`, `:104`).
- Museo: `wikidata-enrich.mjs` prefiere el museo de la **fuente de descarga** (Met/Cleveland, `:69-73`) sobre P195 (una obra tiene versiones/réplicas en varios museos); P195 solo si se verificó el autor.
- Año: `YEAR(?date)` de P571; en `sculptures.mjs:88` el prefijo `-` indica a.C. `gap.mjs:50` marca "©" por heurística (año ≥1925).

**es/en Wikipedia**: nunca buscar por título para es: ir por sitelink del QID (preciso, sin mislabel). `enrich-desc.mjs` (búsqueda por texto) sí puede errar → por eso rechaza biografías.

**WikiArt**
- La imagen correcta es `og:image` de la página de la obra (`wikiart.mjs:26`); el fallback "primer `.jpg` de uploads*.wikiart.org" (`:28`) puede ser otra imagen. Se saca el sufijo `!…` para obtener el **original** (`:31`).
- Orden de prueba: original → `!HD.jpg` → `!Large.jpg`; devuelve el **primero** con lado largo ≥700 (`:66-70`), no el mayor.
- Resolver slug: primero `/en/{slug}`; si falla, `all-works/text-list` del artista y match por keywords que **debe contener todas** (si no, `null`, para no mislabelear) (`wikiart.mjs:42-54`).
- La búsqueda del sitio es JS-rendered: no sirve por HTTP; ningún script la usa. `upgrade.mjs` no reemplaza si el aspecto difiere >12 % o si no es >15 % más grande (`:49-50`).
- Calidad despareja: algunos íconos solo existen a <1000 px (se podan con `prune-modern.mjs`, min 1000).

## 4. Elegir fuente para una obra nueva

1. ¿Está en **Met** (PD, `primaryImage`) o **Cleveland** (CC0)? → ahí: metadata limpia y museo seguro (`resolve.mjs`).
2. Si no: ¿tiene **QID en Wikidata con P18**? → `canon.mjs` (y `sculptures.mjs` para anónimas/antiguas): museo, año, fama y autor salen del mismo item. (Según el diseño original, Louvre, Prado, Uffizi, National Gallery y Vaticano no ofrecen API abierta de alta resolución: sus obras de dominio público llegan por Wikimedia/Wikidata. [NO VERIFICADO hoy]).
3. ¿Moderna con copyright o P18 de baja res? → **WikiArt** (`wikiart.mjs` + config en `tools/wikiart/`) o `upgrade.mjs` si ya está y querés mejorarla.
4. ¿Resolución baja igual? Registrá `image_quality` y no la fuerces; bajo el piso duro de 1000 px se descarta (ver `docs/CALIDAD.md`). Obra icónica de tamaño menor: entra si la calidad es decente.
5. Siempre: dedup (QID + título/autor) antes de bajar, **medir el archivo real**, **validar magic bytes**, descarga serial en Wikimedia.

## 5. Qué NO usar / política vigente

| Tema | Regla inicial (superada) | Vigente |
|---|---|---|
| Licencia | "solo dominio público" | Desde 2026-06-15 es **uso personal**: se registra `license`, no se descarta por ella. OJO: `resolve.mjs`/`discover.mjs` aún filtran PD/CC0 por código; para 01-06 no hace falta cambiarlo, para obra nueva con copyright usá `wikiart.mjs`/`canon.mjs` o relajá el filtro conscientemente |
| Scraping | "PROHIBIDO scrapear, solo APIs oficiales" | **Superada en la práctica**: WikiArt se usa por HTTP/HTML (`wikiart.mjs`). Sigue sin usarse (solo con pedido explícito del usuario para una obra puntual): Google Arts & Culture y sitios de museos |
| Google Arts & Culture | prohibido | Descartado también por inviable (tiles encriptados) |
| Esculturas | "foto 3D no es PD salvo marcada" | No se filtra; `sculptures.mjs` no verifica licencia de la foto (es uso personal) |
| Cristiano (col 06) | exclusión dura de temática cristiana | Sigue vigente en `targets-06.mjs` (`EXCLUDE_CHRISTIAN_06`) |

Prohibido siempre: bajar sin medir/validar; paralelizar descargas de Wikimedia; UA de navegador en APIs; recortar o editar imágenes (ver `docs/CALIDAD.md`); confiar en `thumbwidth`/`width` de la API en vez del archivo.
