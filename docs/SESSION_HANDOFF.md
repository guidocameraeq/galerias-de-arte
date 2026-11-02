# SESSION_HANDOFF — Arte

> Save game del proyecto. `cierre` lo SOBREESCRIBE ENTERO en cada sesión — acá nunca se apila historia (eso vive en CHANGELOG). Los números de estado se copian de `node tools/audit.mjs`, nunca de memoria. No guarda SHA: `git log` lo da.

**Cierre**: 2026-11-02

## Misión de la sesión
Ordenar el repo (README, docs, procesos), sacar las imágenes del repo hacia una biblioteca local + respaldo en Google Drive, y acordar con el agente de la app **Museum Slideshow** el formato de entrega.

## Qué se hizo
- **Rol aclarado:** este repo/agente = historiador y curador. La app (Android, TV de Guido) es otro proyecto con otro agente; comparten solo el formato de Drive (`docs/FORMATO_DRIVE.md`).
- **Repo:** `README.md` con banner (`docs/assets/banner.svg`); borrado `START_HERE.md`; `package.json` limpio; `AGENTS.md` actualizado (rol, imágenes fuera del repo, enlaces, Drive, licencias); `CIERRE.md` ahora hace push.
- **Docs nuevos:** `docs/FORMATO_DRIVE.md` (contrato v1 con la app), `docs/FICHAS_APP.md` (qué información lleva cada obra, propuesta de niveles), `docs/ALMACENAMIENTO.md` (3 copias, abrir en otra PC), `docs/procesos/FLUJO_AGENTES.md` (roles, flujo, qué se registra de cada obra).
- **Imágenes fuera del repo:** biblioteca local `E:\Guido\Fotos & Videos\Banco_Galerias_De_Arte` en la PC principal; `tools/link-images.mjs` crea junctions `landscape/`, `portrait/`, `_dedup_removed/`; ruta en `.arte-local.json` (git la ignora). Se movieron todas las imágenes ahí (pendrive); la 01 llegó después.
- **Drive:** Google Drive para escritorio instalado (unidad `I:`); carpeta `Mi unidad\Galerías de arte`. **Respaldo hecho** con `tools/images-sync.mjs backup --apply` (1382 archivos, 6,86 GB copiados sin errores; re-dry-run da 0 por copiar). Que Drive termine de subir a la nube **no se verificó**.
- **Con la app:** formato `galeria.json` v1 fijo con aclaraciones de curaduría (explicación 80–150 objetivo, piso 1000 px, `forma` manual en tondos, campos opcionales `licencia`/`fuente`/`id`). `Galerías-prueba` (Sana 6 obras incl. grilla 4K, Rota-json, Rota-archivo) subida a Drive, compartida por link, **probada en la TV**: OK. Scripts: `make-prueba-drive.mjs`, `make-prueba-json.mjs`, `check-prueba-json.mjs`.
- **Herramientas nuevas:** `link-images`, `images-sync`, `fichas-stats` (documentadas en `tools/README.md` §0b).

## Estado verificado (salida de `node tools/audit.mjs`)
- `TOTAL: 23 colecciones · 1382 obras · 1382 con ficha · 7.37 GB · 0 FALLAS · 62 AVISOS`
- Fichas (`node tools/fichas-stats.mjs`): solo 38 de 1382 explicaciones llegan a 80 palabras; 293 son extracto `Wikipedia-es`; 378 sin `title_es`; 224 sin museo; 310 sin técnica; 835 con `qid`.
- Licencias en los índices: ~198 obras "Con copyright"/"Uso personal" (no deberían ir a un enlace público sin decisión).
- Git: commits locales de la sesión **empujados al cerrar** (ver `git status -sb`).

## En curso
- Nada a medias. Esperando decisiones de Guido (abajo).

## Próximo paso CONCRETO
1. **Decisiones de Guido** que bloquean el exportador: (a) política de licencias para el link público (¿galerías con copyright solo con la cuenta de la TV?), (b) qué galerías publicar primero, (c) nivel de ficha (`docs/FICHAS_APP.md`), (d) OK al formato `_candidatas.json` (piloto Barroco).
2. Escribir `tools/export-drive.mjs` (dry-run, valida con el chequeo de `FORMATO_DRIVE.md`), exportar **una o dos** galerías a `Galerías/` y avisar al agente de la app (sesión "Inicio").
3. Reescribir fichas a 80–150 palabras en las galerías elegidas.

## Bloqueos
- Ninguno técnico. Pendiente que Guido: desmarcar el arranque automático de Google Drive (Preferencias), confirmar que la subida a la nube terminó, y probar `images-sync restore` en la otra PC.

## Archivos tocados
- Creados: `README.md`, `docs/assets/banner.svg`, `docs/FORMATO_DRIVE.md`, `docs/FICHAS_APP.md`, `docs/ALMACENAMIENTO.md`, `docs/procesos/FLUJO_AGENTES.md`, `tools/{link-images,images-sync,fichas-stats,make-prueba-drive,make-prueba-json,check-prueba-json}.mjs`.
- Modificados: `AGENTS.md`, `docs/procesos/CIERRE.md`, `docs/INVENTARIO.md`, `tools/README.md`, `.gitignore`, `package.json`.
- Eliminado: `START_HERE.md`. Fuera de git: `_export/Galerías-prueba/`.

## Contexto que no está en otro doc
- El agente de la app se llama "Inicio" (hubo 2 sesiones con ese nombre; verificar a quién escribir). Sus mensajes llegan solos.
- Cifras públicas del `README.md` y del banner (23 / 1.382) están duplicadas: actualizarlas a mano si cambian.
