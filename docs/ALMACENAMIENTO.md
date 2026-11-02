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
