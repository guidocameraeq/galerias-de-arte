# SESSION_HANDOFF — Arte

> Save game del proyecto. `cierre` lo SOBREESCRIBE ENTERO en cada sesión — acá nunca se apila historia (eso vive en CHANGELOG). Los números de estado se copian de `node tools/audit.mjs`, nunca de memoria. No guarda SHA: `git log` lo da.

**Cierre**: 2026-11-03

## Misión de la sesión
Ordenar el repo y los procesos, sacar las imágenes del repo (biblioteca local + respaldo en Drive), acordar con el agente de la app **Museum Slideshow** el formato de entrega y publicar las galerías.

## Qué se hizo
- **Rol:** este repo/agente = historiador y curador; la app (Android, TV de Guido) es otro proyecto/agente. Comparten solo el formato (`docs/FORMATO_DRIVE.md`).
- **Repo ordenado:** `README.md` con banner, `AGENTS.md` actualizado, docs nuevos (`FORMATO_DRIVE`, `FICHAS_APP`, `ALMACENAMIENTO`, `procesos/FLUJO_AGENTES`), `CIERRE.md` ahora hace push.
- **Imágenes fuera del repo:** biblioteca `E:\Guido\Fotos & Videos\Banco_Galerias_De_Arte`; `link-images.mjs` (junctions); ruta en `.arte-local.json`. Respaldo en Drive `Galerías de arte/Respaldo` con `images-sync.mjs` (6,86 GB, sin errores).
- **Publicación:** Guido aprobó publicar todo por enlace público (incluye ~198 obras con copyright). `export-drive.mjs` exportó las **23 colecciones** (1382 obras, originales; solo la de Eakins reducida a 3840 px por el límite de 50 MB) a `Mi unidad/Galerías de arte/Galerías`. Los 23 `galeria.json` validan. Rococó se vio bien en la TV.
- **Errores de fichas corregidos:** `10_realismo` n30–40 estaban corridos un lugar (y *Los luchadores* tenía la ficha de otra obra); corregido en el repo y en Drive (10 archivos renombrados, sin duplicar). Barrido título-vs-Wikidata de las 835 obras con `qid`: sin otro desfase.
- **Herramientas nuevas:** `link-images`, `images-sync`, `export-drive`, `fichas-stats`, `contact-sheets`, `make-prueba-*`, `check-prueba-json` (`tools/README.md` §0b).

- **Proceso de colección nueva (2026-11-03):** `docs/procesos/NUEVA_COLECCION.md` (checklist de 9 pasos), 3 subagentes en `.claude/agents/` (`investigador-curatorial`, `verificador-visual`, `redactor-fichas`; solo leen o escriben su propio archivo) y skill `/nueva-coleccion`. Hoy NO hay motor genérico: cada colección se arma copiando `targets-NN` + `harvest-NN`.
- **Registro de candidatas hecho para las 23 colecciones:** `<col>/_candidatas.json` (37 pendientes importantes, 607 descartadas, con motivo) generado por `tools/candidatas.mjs --gap --apply`; decisiones manuales en `tools/candidatas-manual.json`. Solo 8 colecciones tienen historial de descartes (cada archivo lo dice en `cobertura`).

## Estado verificado (salida de `node tools/audit.mjs`)
- `TOTAL: 23 colecciones · 1382 obras · 1382 con ficha · 7.37 GB · 0 FALLAS · 62 AVISOS`
- Fichas: `node tools/fichas-stats.mjs` (solo 39 de 1382 explicaciones llegan a 80 palabras; 293 son `Wikipedia-es`).
- Drive: **no verificado** que Drive para escritorio haya terminado de subir los ~7 GB a la nube.

## En curso
- **Revisión visual de fichas vs imagen (obras sin `qid`): TERMINADA**, resultados en `docs/TODO.md` (error real en `15 n12` Rothko; fotos rotadas en 18; mockups en 19/23; metadatos basura en `artist`). Nada se modificó.
- **Bloqueo de la app:** la 1ª sincronización masiva chocó con el anti-abuso de Google (403) al bajar ~7 GB por enlace público. El agente de la app la hace más lenta; si persiste, exportar copias reducidas (`export-drive --max-side=3840`).

## Próximo paso CONCRETO
1. Con Guido: revisar los 37 pendientes de `_candidatas.json` y los hallazgos de la revisión visual (`docs/TODO.md`); corregir `15 n12` y el campo `artist` de todo el catálogo; si se corrige algo, re-exportar esa galería con `export-drive.mjs`.
2. Con el agente de la app (sesión "Galerías de arte y protector de pantalla"): confirmar que bajan las 23 galerías y si hace falta pasar a copias de 3840 px.
3. Decidir con Guido: originales vs 3840 px; qué fichas reescribir primero (`docs/FICHAS_APP.md`); OK al formato `_candidatas.json`; qué hacer con las candidatas a sacar.

## Bloqueos
- Ninguno técnico. De Guido: desmarcar el arranque automático de Google Drive; confirmar que la subida a la nube terminó; probar `images-sync restore` en la otra PC.

## Archivos tocados
- Creados: `tools/{link-images,images-sync,export-drive,fichas-stats,contact-sheets,make-prueba-drive,make-prueba-json,check-prueba-json}.mjs`, `tools/forma-tondos.json`, `docs/{FORMATO_DRIVE,FICHAS_APP,ALMACENAMIENTO}.md`, `docs/procesos/FLUJO_AGENTES.md`, `README.md`, `docs/assets/banner.svg`.
- Modificados: `AGENTS.md`, `docs/{INVENTARIO,TODO,CHANGELOG,SESSION_HANDOFF}.md`, `docs/procesos/CIERRE.md`, `tools/README.md`, `tools/desc/10_realismo.mjs`, `10_realismo/_index.json`, `.gitignore`, `package.json`. Eliminado: `START_HERE.md`. Fuera de git: `_export/`, `.arte-local.json`.

## Contexto que no está en otro doc
- El agente de la app se llama "Galerías de arte y protector de pantalla" (antes "Inicio"). Sus mensajes llegan solos.
- La carpeta Drive `Galerías` ya está compartida (Lector) y su ID lo tiene la app. `Respaldo` es privada.
- Las cifras del `README.md` y del banner (23 / 1.382) están duplicadas: actualizarlas a mano si cambian.
