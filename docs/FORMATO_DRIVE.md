# FORMATO_DRIVE — contrato con la app Museum Slideshow

> Este repo es el **lado curaduría**. La app (**Museum Slideshow**, Android para la TCL Google TV de Guido; repo y agente aparte) lee de una carpeta pública de Google Drive. Lo único que compartimos es **este formato**. La app define el formato; este doc es la copia del lado curaduría. Si discrepan, manda el doc de la app (`docs/formato-galeria.md` en su repo) y se corrige acá. **Confirmado en la TV el 2026-11-02 con `Galerías-prueba`: formato v1 fijo.**

## Reparto de trabajo
| Quién | Hace | NO hace |
|---|---|---|
| **Este repo (curaduría / historiador)** | Elegir obras, conseguir imágenes buenas, escribir las fichas, exportar y dejar todo en Drive | Nada de código Android, diseño en pantalla ni instalación en la TV |
| **Agente de la app** | Código Android, diseño, marcos, instalación | Curar ni descargar arte |
| **Guido** | Gestiona su Drive, comparte las carpetas, carga la clave de Drive en la app, poda galerías a mano | — |

Los dos agentes se avisan por mensaje entre sesiones. La clave de Drive la pone Guido del lado de la app: acá no se necesita ninguna.

## Carpetas en Drive (cuenta de Guido)
```
Mi unidad/Galerías de arte/          PRIVADA (trabajo)
  Galerías-prueba/                   compartida por link (Lector) — solo pruebas técnicas
  Galerías/                          compartida por link (Lector) — la que lee la app (pendiente: exportador)
  Respaldo/                          PRIVADA — copia de la biblioteca de imágenes (ver docs/ALMACENAMIENTO.md)
  _retiradas/                        PRIVADA — lo que export-drive saca de una galería (nunca borra)
```
**Marcos de cuadro** (pedido de la app, 2026-11-05): NO van por Drive; la app los empaqueta. Fotos CC0 (Met/Rijksmuseum) en la biblioteca local `_marcos/` + `marcos.json` (registro en `tools/marcos.json`). `negro-fino` lo dibuja la app.

**Nunca "Editor".** Solo `Galerías` y `Galerías-prueba` se comparten por enlace; `Respaldo` jamás.
Una colección de este repo = una subcarpeta de `Galerías/` (entera; Guido la poda a mano después). El nombre es el de la colección sin el prefijo numérico y con acentos (p. ej. `02_barroco` → `Barroco`).

## `galeria.json` (formato 1)
JSON válido UTF-8, sin comentarios ni comas sobrantes, ≤1 MB, nombre exacto `galeria.json`, en la subcarpeta de la galería.
```json
{
  "formato": 1,
  "titulo": "Impresionismo",
  "descripcion": "París, 1860-1890: pintar la luz y el momento.",
  "obras": [
    { "archivo": "monet-impresion-sol-naciente.jpg", "titulo": "Impresión, sol naciente",
      "autor": "Claude Monet", "vida_autor": "1840–1926", "anio": "1872", "movimiento": "Impresionismo",
      "tecnica": "Óleo sobre lienzo", "medidas": "48 × 63 cm", "ubicacion": "Museo Marmottan Monet, París",
      "forma": "rectangular", "explicacion": "Párrafo uno.\n\nPárrafo dos.",
      "credito": "Dominio público, vía Wikimedia Commons",
      "licencia": "Dominio público", "fuente": "https://…", "id": "Q328523" }
  ]
}
```
- **Obligatorios:** `formato` (el número 1), `titulo`, `obras`, y en cada obra `archivo` (nombre exacto de la imagen, con mayúsculas y extensión). El orden de `obras` es el orden de aparición.
- **Opcionales (todos texto):** `titulo`, `autor`, `vida_autor`, `anio` (texto: admite "c. 1503-1519"), `movimiento`, `tecnica`, `medidas`, `ubicacion`, `credito` (texto chico que se ve en pantalla), `explicacion`, y los tres que pidió curaduría: `licencia`, `fuente` (URL; la TV no la muestra), `id` (identificador estable, **único dentro de la galería**).
- **`forma`:** `"rectangular"` (por defecto), `"redonda"` u `"ovalada"`. **Hay que marcarla a mano en tondos y medallones**: la app no los detecta.
- **`explicacion`:** texto plano (sin Markdown ni HTML), párrafos separados por `\n\n`. Objetivo **80–150 palabras**; más corta también vale y la app la muestra igual.
- **`marco`:** no se usa por ahora (se define con fotos de marcos reales).
- **Imágenes:** JPG, PNG o WebP, hasta 50 MB c/u. Ideal ≥2000 px de lado largo (mejor 4K; la TV muestra 4K real); **piso aceptado 1000 px**. Nombres sin espacios ni caracteres raros, estilo `autor-titulo-anio.jpg`.

## Cómo reacciona la app a los errores (no se rompe)
Imagen que no está en la lista → se muestra al final sin ficha. Obra cuyo archivo no existe → se saltea. JSON roto → muestra las imágenes sin ficha, con el nombre de la carpeta como título. Campos desconocidos → los ignora. Todo queda en su pantalla de Estado.

## De nuestro `_index.json` al `galeria.json` (mapa para el exportador)
| `galeria.json` | Sale de | Nota |
|---|---|---|
| `archivo` | slug de `artist` + `title_es`/`title` + `year`, `.ext` | **Solo en la copia exportada**; la biblioteca no se renombra (regla dura 2). Extensión real del contenido (hay `.jpg` que son PNG/WebP, `W-EXT`) — a confirmar con la app |
| `titulo` | `title_es` \|\| `title` | |
| `autor` / `anio` | `artist` / `year` | |
| `movimiento` | `school` | |
| `tecnica` | `type` | puede ser null |
| `ubicacion` | `holding_museum` | **No** usar `museum` (= fuente de descarga) |
| `explicacion` | `description` | ver `docs/FICHAS_APP.md` |
| `licencia` / `credito` | `license` → texto normalizado | ver política abajo |
| `fuente` | `source_url` \|\| `image_url` | |
| `id` | `qid` → `sourceId` → `source_url` → `image_url` | Regla única en `tools/galerias.mjs` (`idsGaleria`), la usan `export-drive` y `drive-curation`. Si el id ya lo usó otra obra (`qid` genéricos repetidos en 01–06, `W-QID-DUP`) se usa su `sourceId` o se agrega `#n`. Las obras sin identificador tienen `sourceId` `local:…` (`assign-local-ids.mjs`). Estable aunque cambie el `n` o el archivo |
| `forma` | lista manual de tondos | no existe en el índice |
| `vida_autor`, `medidas` | **no existen en el índice** | omitir; completar solo donde se investigue |

## Política de licencias para Drive (decisión pendiente de Guido)
El enlace "cualquiera con el enlace" **no es privado**. Casi todo es dominio público, pero parte tiene copyright y se guarda para uso personal (valores `license` = "Con copyright (uso personal)" / "Uso personal"; cantidades: `node tools/fichas-stats.mjs` / consultar los índices). **Restricción técnica (agente de la app, 2026-11-02):** la app v1 lee Drive solo con una clave de API, o sea **únicamente carpetas "cualquiera con el enlace"**. Leer una carpeta privada compartida con una cuenta exigiría login de Google (OAuth) en la TV: cambio grande, fuera de v1. Por eso la salida "compartir solo con la cuenta de la TV" **hoy no existe**. Opciones para las ~198 obras con copyright de uso personal: (a) publicarlas igual por enlace (no listado, uso personal; riesgo bajo pero no es privado), (b) dejarlas fuera de `Galerías/` hasta que la app soporte login, (c) pedir a la app que sume OAuth. **Decide Guido** antes de exportar la biblioteca real; recomendación: (b) para empezar, exportando primero galerías de dominio público.

**Copias para la app:** la app baja el ORIGINAL de cada obra (~5 MB; a una por minuto son ~7 GB/día) y Drive limita las descargas de enlaces públicos. Propuesta: la exportación sube copias reducidas a 3840 px de lado mayor (los originales quedan intactos en la biblioteca y el Respaldo; la copia es solo un derivado de entrega). **Pendiente de OK de Guido** (choca con la regla dura 2 si se lee sin matiz).

## Curaduría de Guido (borra en Drive)
Guido poda las galerías **borrando imágenes** en `Galerías`. `export-drive.mjs` detecta lo borrado (estaba en el `galeria.json` anterior y ya no está la imagen): **no lo vuelve a subir** y lo sigue listando (la app lo saltea) para no perder la evidencia; si falta >30% de una galería no la toca (¿Drive sincronizando?). `node tools/drive-curation.mjs --apply` lo saca también del repo (recuperable) y regenera el `galeria.json` y el registro de candidatas. Si una obra cambia de título, `export-drive` renombra su archivo en Drive en vez de duplicarlo; los `id` no cambian.

## Chequeo antes de entregar (lo corre el exportador)
JSON válido · cada `archivo` coincide letra por letra con una imagen y no se repite · tondos con `forma` · ningún `id` repetido · sin Markdown en los textos · orden de la lista intencional. Para la prueba: `node tools/check-prueba-json.mjs`.

## Estado
- `Galerías-prueba` (Sana, Rota-json, Rota-archivo): hecha, validada en la TV. Generada por `tools/make-prueba-drive.mjs` + `tools/make-prueba-json.mjs` (la grilla 4K `grilla-4k.png` la provee el proyecto de la app).
- `export-drive.mjs` (biblioteca real → `Galerías/`): **pendiente.** Dry-run por defecto, sin tocar imágenes, valida con el chequeo de arriba. Avisar al agente de la app cuando exista `Galerías/`.
