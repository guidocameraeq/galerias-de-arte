# ALMACENAMIENTO — dónde viven las imágenes

> Las imágenes (~7,4 GB) **no están en git** (`.gitignore`). Git guarda solo código, docs e `_index.json`.

## Hoy
- **Copia de trabajo:** carpeta local del proyecto, en la PC donde se cosecha. Al 2026-11-02 las imágenes están en *otra PC* de Guido y se traen por pendrive; en esta PC solo hay índices y docs (`node tools/audit.mjs` da `F-MISSING` hasta que lleguen).
- **Reconstrucción:** cada ficha guarda `image_url` y `sourceId`, así que casi todo se puede volver a bajar. Pero es lento y lo ya apartado/podado no vuelve.

## En diseño: sincronización con Google Drive
Objetivo: además del disco local, tener las imágenes en una carpeta de Google Drive que consume la app *Museum Slideshow* (proyecto aparte, lo mantiene otro agente).

- **Contrato de formato** (carpeta `Galerías/<galería>/` + `galeria.json` v1): lo define el agente de la app; este repo se ajusta. Ver el acuerdo en la conversación entre agentes y, cuando exista, `docs/FORMATO_DRIVE.md`.
- **Plan:** `tools/export-drive.mjs` (pendiente) arma una carpeta de salida desde los `_index.json`, copia las imágenes sin tocarlas y genera cada `galeria.json`. Dry-run por defecto. Guido sube o sincroniza esa carpeta con Drive.
- **Pendiente de decidir:** galerías grandes enteras o partidas; qué campos opcionales extra (`fuente`, `licencia`, `id`).

## Decisiones (2026-11-02, Guido)
- **Imágenes fuera del repo (HECHO 2026-11-02).** Viven en una biblioteca local por PC (esta PC: `E:GuidoFotos & VideosBanco_Galerias_De_Arte`, la ruta se guarda en `.arte-local.json`, ignorado por git). `node tools/link-images.mjs --apply` crea en cada colección enlaces (junctions) `landscape/`, `portrait/` y `_dedup_removed/` hacia la biblioteca, así ningún script cambia. En otra PC: `node tools/link-images.mjs --dir=RUTA --save --apply`. Si la biblioteca no está, bajar la última copia de Google Drive. Una carpeta REAL con archivos nunca se toca (el script avisa).
- **Estructura de carpetas: se mantiene la actual** (`NN_nombre/landscape|portrait`). Hoy mezcla colecciones por autor (19–23, monográficas) y por época/estilo (el grueso). Es provisoria: se reordenará cuando la app esté pulida y se vea cómo se usan las galerías. Referenciar obras por `qid`/`sourceId`, no por carpeta o `n`, para que reorganizar sea barato.
- **El repo debe conservar todo lo que no pesa:** índices, fichas, descartes y, por pedir, un registro de obras candidatas por colección (entró / pendiente de conseguir / descartada por criterio, con motivo). Propuesta `_candidatas.json`, piloto Barroco; falta el OK de formato.
