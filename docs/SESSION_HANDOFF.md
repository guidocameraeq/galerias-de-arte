# SESSION_HANDOFF — Arte

> Save game del proyecto. `cierre` lo SOBREESCRIBE ENTERO en cada sesión — acá nunca se apila historia (eso vive en CHANGELOG). Los números de estado se copian de `node tools/audit.mjs`, nunca de memoria. No guarda SHA: `git log` lo da.

**Cierre**: 2026-11-04

## Misión de la sesión (2026-11-02 → 04)
Ordenar el repo y los procesos, sacar las imágenes del repo, acordar con la app **Museum Slideshow** el formato de entrega, publicar las galerías en Drive y dejar un **sistema autónomo** para agregar colecciones (probado con una colección real).

## Qué se hizo
- **Rol:** este repo/agente = historiador y curador; la app (Android, TV de Guido) es otro proyecto con otro agente. Comparten solo el formato (`docs/FORMATO_DRIVE.md`, `galeria.json` v1, confirmado en la TV).
- **Repo prolijo:** colecciones movidas a **`colecciones/NN_nombre/`** (raíz limpia: `docs/`, `tools/`, `_descartes/`, README); `lib.mjs` centraliza la ruta (`colsBase`/`colPath`/`listCols`) y se adaptaron los scripts que la buscaban en la raíz. README con banner; `AGENTS.md`/`CLAUDE.md` al día; docs nuevos `FORMATO_DRIVE`, `FICHAS_APP`, `ALMACENAMIENTO`, `procesos/NUEVA_COLECCION`, `procesos/FLUJO_AGENTES`. Sin mail ni rutas locales en el código (User-Agent con link al repo).
- **Imágenes fuera del repo:** biblioteca local por PC (ruta en `.arte-local.json`, enlaces con `link-images.mjs`); respaldo privado en Drive (`images-sync.mjs`).
- **Publicación:** las 24 colecciones exportadas a Drive `Galerías` (compartida por enlace, aprobado por Guido incluyendo copyright de uso personal), con `export-drive.mjs` (no re-sube lo que Guido borra, renombra en vez de duplicar, freno 30%).
- **Sistema de colecciones:** motor genérico `tools/harvest.mjs` (lista `tools/targets/NN.json`), subagentes Sonnet `investigador-curatorial` / `verificador-visual` / `redactor-fichas`, skill `/nueva-coleccion`, registro de lo que no entró `colecciones/NN/_candidatas.json` (`candidatas.mjs`), curaduría desde Drive `drive-curation.mjs`. Fichas clavadas por **id** (973 + nuevas; probado renumerando una colección). Revisión de código independiente: bugs corregidos y re-probados en sandbox.
- **Prueba real:** colección **24 Ukiyo-e** (14 obras de museo) armada de punta a punta con el proceso; publicada en Drive. Guido la aprobó.
- **Calidad:** fichas de Realismo n30–40 que estaban corridas, corregidas; revisión visual de las obras sin `qid` (hallazgos en `docs/TODO.md`).

## Estado verificado (salida de `node tools/audit.mjs`)
- `TOTAL: 24 colecciones · 1396 obras · 1396 con ficha · 7.42 GB · 0 FALLAS · 62 AVISOS`
- Tras mover a `colecciones/`: `link-images` 72 enlaces existentes; `export-drive --all` contra Drive sin borrados ni cambios; `harvest`, `candidatas`, `apply-desc`, `drive-curation`, `contact-sheets`, `remove-work` (dry) y `gap` leen bien la carpeta nueva.
- Candidatas: 41 pendientes · 610 descartadas (`node tools/candidatas.mjs`).

## En curso
- Nada a medias. El repo sigue **privado**: hacerlo público lo hace Guido desde GitHub → Settings → Change visibility (8 commits viejos tienen `eq.chatgpt@gmail.com` como autor).

## Próximo paso CONCRETO
1. Guido: decidir originales vs copias de 3840 px para la app (alivia el bloqueo anti-abuso de Drive) y confirmar en la TV que aparecen las 24 galerías.
2. Elegir la próxima colección y correr `/nueva-coleccion` (o ampliar una existente), o atacar los pendientes de calidad: *Kanbara* (24 n8, "según Hiroshige"), Rothko 15 n12, mockups de 19/23, fotos rotadas de 18.
3. Reescribir fichas a 80–150 palabras en las galerías que Guido elija (`redactor-fichas`).

## Bloqueos
- Ninguno técnico. De Guido: desmarcar el arranque automático de Google Drive; confirmar que la subida a la nube terminó.

## Contexto que no está en otro doc
- El agente de la app es la sesión "Galerías de arte y protector de pantalla"; sus mensajes llegan solos. Ya sabe del cambio de ids (13–15, 22–23) y de la galería Ukiyo-e.
- Las cifras públicas del `README.md` y del banner (24 / 1.396) están duplicadas: actualizarlas a mano si cambian.
