# NUEVA_COLECCION — proceso para agregar una colección (o ampliar una)

> Agnóstico de agente (Claude, Gemini, OpenCode…). Es el **checklist único**: si mañana hay que bajar una galería nueva, se sigue esto de arriba a abajo. Reglas duras: `AGENTS.md`. Roles: `docs/procesos/FLUJO_AGENTES.md`. Gates de calidad: `docs/CALIDAD.md`. Fichas: `docs/DESCRIPCIONES.md`. Contrato con la app: `docs/FORMATO_DRIVE.md`.
> **Una sola persona/agente escribe por vez** sobre los `_index.json` (regla 7). Los subagentes de Claude (`.claude/agents/`) solo **leen e informan** o escriben su propio archivo de fichas; el cosechador y el que aplica cambios al índice es siempre el agente principal.

## Qué existe hoy y qué NO (para no hacerse ilusiones)
- **Existe:** un motor con varias vías de descarga (`collect`, `canon`, `wikiart`, `sculptures`, `harvest-*`), el método (`docs/METODO.md` §3), los gates (`docs/CALIDAD.md`), `audit`, `remove-work`, el registro de candidatas (`tools/candidatas.mjs`) y la exportación (`export-drive.mjs`).
- **NO existe (todavía):** un único comando "crear colección". Cada colección nueva se armó con scripts propios (`targets-NN.mjs` + `harvest-NN.mjs`, copiados de la anterior). Mientras no haya un motor genérico, **copiá el harvest de la colección más parecida** (tabla del paso 3) y adaptalo. Pendiente en `docs/TODO.md`.
- Los "agentes" de abajo son **roles**; en Claude Code hay tres como subagentes reales y un skill `/nueva-coleccion`; en otros agentes se siguen como pasos.

## Paso 0 — Preparar el terreno
1. `node tools/audit.mjs` en 0 FALLAS **antes** de empezar (si no, arreglá o anotá lo que ya estaba roto). Si da `F-MISSING` masivo, esta PC no tiene la biblioteca de imágenes conectada → `docs/ALMACENAMIENTO.md` (`link-images.mjs`). La ruta de las imágenes es **por PC** (`.arte-local.json`), nunca va en el repo.
2. Crear `NN_nombre/_index.json` con `{ "collection": "NN_nombre", "items": [] }` y correr `node tools/link-images.mjs --apply` (crea las carpetas en la biblioteca de esa PC y los enlaces `landscape/`, `portrait/`, `_dedup_removed/`).
3. Decidir con Guido **el alcance en una línea**: ¿por tema, por movimiento/época, por autor (monografía)? ¿Rango de años? ¿Exclusiones duras? ¿Cuántas obras como techo (pocas y excelentes)?

## Paso 1 — Historiador: investigar el canon ANTES de bajar nada
*(subagente `investigador-curatorial`, solo lee)*
- Armar la **lista de objetivos**: qué autores y qué obras son LAS importantes de ese tema/época, con una línea de por qué. Fuentes: Wikipedia/Wikidata (fama = sitelinks), catálogos de museos, estate oficial (monografías). Leer `docs/galerias/` de las colecciones vecinas y `<col>/_candidatas.json` de las que se solapan (qué falta, qué se descartó) para no repetir ni pisar.
- Marcar **qué NO entra y por qué** (fuera de período, irrelevante, réplicas, bocetos). Lección de Kubin: investigar el canon primero, recolectar después; los bocetos menores no.
- Salida: un archivo `tools/targets-NN-nombre.mjs` (o `tools/canon/NN_nombre.mjs`) con título, autor, año, museo y la ficha en español de cada obra, **con la fuente de cada dato**. Mostrárselo a Guido.

## Paso 2 — Elegir la vía de descarga (`docs/METODO.md` §3)
| Tipo de colección | Vía | Plantilla para copiar |
|---|---|---|
| Por **tema** (mitos, memento mori) | `collect.mjs` + `targets-0N.mjs` | `targets-01.mjs` |
| Por **movimiento** (muchos autores famosos) | `canon.mjs` + `tools/canon/NN.mjs` | `tools/canon/08_impresionismo.mjs` |
| **Modernas con copyright** | `wikiart.mjs` + `tools/wikiart/NN.mjs` | `tools/wikiart/14_surrealismo.mjs` |
| **Monografía** de un artista (estate/galería/museo) | `harvest-NN-*.mjs` + `targets-NN-*.mjs` + `docs/procesos/ADQUISICION_MONOGRAFICA.md` | `harvest-22-beksinski.mjs` |
| **Esculturas / antigüedades** | `sculptures.mjs` / `harvest-18-sculptures.mjs` | `harvest-18-sculptures.mjs` |
| **Serie de grabados** | ver Doré (`dore*.mjs`) | — |

## Paso 3 — Cosechador: dry-run, OK de Guido, descarga
*(el agente principal)*
1. **Dry-run** del script (sin `--apply`); mostrarle a Guido la lista de lo que bajaría y **esperar su OK** (regla dura 5).
2. `--apply`: descargas **seriales**, `downloadTo` con validación de magic bytes, **medir el archivo real** (no lo que promete la API), piso de lado largo ≥1000 px (≥800 en 13–15), sin editar ni convertir.
3. Todo lo que se rechaza al bajar debe quedar registrado con `logDiscard` (`tools/lib.mjs`) en `_descartes/<col>.jsonl`. **Hoy no lo hacen** `canon`, `wikiart`, `sculptures` ni los `harvest-*`: si usás uno de ellos, anotá los rechazos a mano en `tools/candidatas-manual.json` (paso 6). (Pendiente: parchearlos.)

## Paso 4 — Verificador de calidad
*(`audit` + subagente `verificador-visual`)*
1. `node tools/audit.mjs --col=NN`: 0 FALLAS; revisar cada AVISO nuevo (`W-RES`, `W-EXT`, duplicados, `W-QID-DUP`).
2. `node tools/fix-dims.mjs <col>` (dry) si hay dudas de medidas.
3. **Revisión visual obligatoria** (el `audit` NO ve que la ficha corresponda a la imagen): `node tools/contact-sheets.mjs --out=RUTA --col=NN_nombre --all-items` y mirar cada hoja. Buscar: otra obra distinta, **mockups o fotos de sala/pared/marco**, pósters con texto, portadas de libro, fotos rotadas, repetidas, marcas de agua grandes.
4. Lo que no sirve se saca **solo** con `node tools/remove-work.mjs <col> --n=N --apply` (recuperable, loguea). Nunca a mano.

## Paso 5 — Redactor de fichas
*(subagente `redactor-fichas` escribe SOLO `tools/desc/NN_nombre.mjs`)*
- Español, **de una fuente** (nunca de memoria), qué muestra y qué significa, objetivo **80–150 palabras** para la app (`docs/FICHAS_APP.md`); `description_source` real.
- Aplicar: `node tools/apply-desc.mjs <col>` (dry) → `--apply`. **Trampa:** pega por `n`; tras podar/renumerar, sacar la entrada de la obra borrada o la ficha cae en otra (`W-DESC-STALE`). Después de aplicar, repetir la revisión visual del paso 4.3 en una muestra: es donde aparecen las fichas corridas.
- Completar campos: `node tools/wikidata-enrich.mjs <col>` (qid, museo, técnica).

## Paso 6 — Registro de candidatas (lo que NO entró)
Para poder curar después sin volver a investigar:
1. Si hubo obras importantes que no se consiguieron, o descartes por criterio, agregarlos a `tools/candidatas-manual.json` (`col`, `estado` `pendiente`|`descartada`, `titulo`, `autor`, `motivo`, `detalle`).
2. `node tools/candidatas.mjs --gap` (dry) → `--apply`. Regenera `<col>/_candidatas.json` de todas las colecciones: pendientes (importantes no conseguidas, incluidas las famosas de Wikidata que faltan) y descartadas, cada una con motivo. Las que entraron NO se duplican: viven en `_index.json`.
3. Revisar el resultado de la colección nueva y confirmar que `cobertura` dice que tiene historial.

## Paso 7 — Documentar
- `docs/galerias/NN_nombre.md` (copiar el formato de una existente): concepto, fuentes, scripts, criterios de selección y exclusión, obras cumbre, estado técnico. Agregarla a `docs/galerias/README.md`.
- Una ficha de colección en `docs/INVENTARIO.md` (tabla) si tiene reglas propias; scripts nuevos en `tools/README.md`.
- Si la colección tiene reglas especiales (exclusión temática, ficha distinta), una línea en `AGENTS.md` "Trampas".

## Paso 8 — Publicar a la app (solo cuando Guido decida)
1. `node tools/export-drive.mjs --col=NN_nombre --out="<carpeta Galerías en Drive>" [--big-max-side=3840]` (dry-run primero). Valida JSON, archivos, ids, límite de 50 MB, Markdown.
2. Tondos/medallones: marcarlos en `tools/forma-tondos.json` (`qid` o `sourceId` → `redonda`/`ovalada`).
3. Respaldar las imágenes nuevas: `node tools/images-sync.mjs backup --apply`.
4. Avisar al agente de la app con el nombre exacto de la carpeta. No tocar Drive por API ni por links; solo por la carpeta montada.
5. Licencias: las obras con copyright de uso personal van por enlace público **solo con decisión expresa de Guido** (`FORMATO_DRIVE.md`).

## Paso 9 — Cierre
`docs/procesos/CIERRE.md`: `audit` en 0 FALLAS, handoff, CHANGELOG, TODO, commit y push.

## Definición de "colección terminada" (checklist)
- [ ] `audit --col=NN` en 0 FALLAS; avisos justificados.
- [ ] Revisión visual hecha (hojas de contacto), sin mockups ni fichas corridas.
- [ ] Todas las obras con ficha en español de una fuente.
- [ ] `_candidatas.json` generado, con `cobertura` con historial.
- [ ] `docs/galerias/NN_nombre.md` y entrada en `tools/README.md`.
- [ ] Imágenes respaldadas en Drive; `export-drive` hecho si se publica.
- [ ] Handoff/TODO/CHANGELOG al día y commit.
