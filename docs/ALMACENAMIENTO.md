# ALMACENAMIENTO — dónde viven las imágenes

> Las imágenes (~7,4 GB) **no están en git** (`.gitignore`). Git guarda solo código, docs e `_index.json`. Formato de lo que se entrega a la app: `docs/FORMATO_DRIVE.md`.

## Tres copias, tres funciones
| Copia | Dónde | Para qué |
|---|---|---|
| **Biblioteca local** | Una carpeta por PC, fuera del repo. En cada PC, la ruta que guarda `.arte-local.json` (`<col>\landscape`, `portrait`, `_dedup_removed`) | Trabajar: todos los scripts la ven dentro del repo por enlaces |
| **Respaldo en Drive** | `Mi unidad\Galerías de arte\Respaldo` (PRIVADA) | Copia espejo; si una PC no tiene la biblioteca, se restaura de acá |
| **Galerías para la app** | `Mi unidad\Galerías de arte\Galerías` y `Galerías-prueba` (compartidas, Lector) | Lo que lee la app Museum Slideshow (otra estructura y nombres: no sirve para reconstruir la biblioteca) |

## Cómo se conecta el repo con la biblioteca
En cada colección, `landscape/`, `portrait/` y `_dedup_removed/` son **enlaces (junctions de Windows)** a la biblioteca, así ningún script cambió. La ruta de la PC se guarda en `.arte-local.json` (ignorado por git); el repo no fija ninguna ruta.
```bash
node tools/link-images.mjs --dir="RUTA" --save --apply   # una vez por PC
```
Una carpeta REAL con archivos nunca se toca (el script avisa). Solo funciona en Windows.

## Abrir el proyecto en OTRA PC
1. Clonar el repo (trae índices, fichas, docs, tools).
2. Si la PC ya tiene la biblioteca (disco externo, pendrive): `link-images.mjs --dir=RUTA --save --apply`.
3. Si no la tiene: `node tools/images-sync.mjs restore --dir=RUTA` (dry-run), luego `--apply`. Baja del Respaldo de Drive y rearma los enlaces.
4. `node tools/audit.mjs` debe dar 0 FALLAS.
Instalar Google Drive para escritorio en esa PC (con la cuenta de Guido) y dejar conectada solo `Galerías de arte`.

## Respaldar
`node tools/images-sync.mjs backup` (dry-run) → `--apply`. Solo copia `landscape/` y `portrait/` (no `_dedup_removed/`); **nunca borra**, ni en origen ni en Drive. Lo que se sube lo sube Drive para escritorio en segundo plano: no apagar la PC hasta que el ícono diga "al día".

## Decisiones (2026-11-02, Guido)
- **Imágenes fuera del repo** (hecho): biblioteca por PC + respaldo en Drive.
- **Estructura de colecciones: se mantiene la actual** (`NN_nombre/landscape|portrait`). Mezcla colecciones por autor (19–23) y por época/estilo (el grueso); es provisoria y se reordenará cuando la app esté pulida. Por eso las obras se referencian por `qid`/`sourceId`, no por carpeta ni `n`.
- **El repo conserva todo lo que no pesa:** índices, fichas, descartes. Falta un registro de obras *candidatas* (entró / pendiente de conseguir / descartada por criterio): propuesta `_candidatas.json`, ver `docs/procesos/FLUJO_AGENTES.md`.
- **Reconstrucción:** cada ficha guarda `image_url` y `sourceId`; casi todo se puede volver a bajar, pero es lento y lo ya podado no vuelve. El Respaldo de Drive es la red de seguridad real.

## Pendiente
`tools/export-drive.mjs` (biblioteca → carpeta `Galerías` para la app) · política de licencias para el enlace público (ver `FORMATO_DRIVE.md`) · probar `images-sync restore` en una PC real.
