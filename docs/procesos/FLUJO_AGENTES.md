# FLUJO_AGENTES — quién hace qué cuando hay que salir a buscar arte

> Agnóstico de agente (Claude, Gemini, OpenCode…). **El paso a paso para agregar una colección está en `docs/procesos/NUEVA_COLECCION.md`** (checklist único); este doc explica los roles y qué se registra de cada obra. Un solo agente escribe por vez (regla dura 7). En Claude Code hay **3 subagentes reales** en `.claude/agents/` (`investigador-curatorial`, `verificador-visual`, `redactor-fichas`: solo leen o escriben su propio archivo) y el skill `/nueva-coleccion`; el cosechador y quien aplica cambios al índice es siempre el agente principal.

## Los roles
| Rol | Qué hace | Herramientas | Sale con |
|---|---|---|---|
| **1 · Historiador** | Define qué entra en una galería: canon del tema, quién y qué obras, qué NO (y por qué). Investiga *antes* de bajar nada | Wikipedia, Wikidata, `tools/gap.mjs`, `docs/galerias/NN_*.md` | Lista de objetivos (`targets-*.mjs` o `canon/NN.mjs`) |
| **2 · Cosechador** | Busca, verifica y baja las imágenes | **`harvest.mjs`** (motor genérico, lista `tools/targets/NN.json`); vías específicas `collect`, `canon`, `wikiart`, `dore*` (ver `tools/README.md`) | Obras en la biblioteca + `_index.json`; descartes en `_descartes/` |
| **3 · Verificador de calidad** | Aplica los gates; ve las imágenes si hace falta; saca lo que no sirve | `audit.mjs`, `fix-dims.mjs`, `remove-work.mjs`, `docs/CALIDAD.md` | `audit` en 0 FALLAS; sin avisos nuevos injustificados |
| **4 · Redactor de fichas** | Escribe la ficha en español de una fuente (y la larga de la app) | `wikidata-enrich`, `enrich-es`, `tools/desc/NN.mjs` + `apply-desc` | `description` + `description_source` |
| **5 · Exportador** | Convierte la biblioteca en carpetas para la app y trae de vuelta la curaduría de Guido | `export-drive.mjs`, `drive-curation.mjs`, `images-sync.mjs` | `Galerías/` en Drive + aviso al agente de la app |
| **6 · Archivista** | Registra lo hecho, lo descartado y lo pendiente | `cierre`, `docs/galerias/`, `_descartes/`, `docs/CHANGELOG.md` | Handoff + TODO + commit |

## Flujo para una galería nueva o una ampliación
1. **Inicio** (`docs/procesos/INICIO.md`): `audit` + git. Confirmar la misión con Guido.
2. **Historiador:** investigar el canon *primero* (lección de Kubin: investigar → recolectar, no al revés). Leer la galería en `docs/galerias/` si existe. Armar la lista de objetivos y mostrársela a Guido.
3. **Cosechador, dry-run:** correr el script sin `--apply`; mostrar a Guido qué bajaría (regla dura 5). **Esperar el OK.**
4. **Cosechador, apply:** bajar con validación de magic bytes y **medir el archivo real**. Un descargador a la vez, serial (Wikimedia rate-limita).
5. **Verificador:** `audit`; gates de `docs/CALIDAD.md` (piso 1000 px, es LA obra, no réplica/detalle/mockup, dedup). Mirar las imágenes dudosas. Sacar lo que no sirve con `remove-work.mjs` (nunca a mano).
6. **Redactor:** fichas de una fuente (`DESCRIPCIONES.md`), a `tools/desc/NN.mjs`, `apply-desc`. Para la app, nivel de ficha según `docs/FICHAS_APP.md`.
7. **Documentar la galería:** `docs/galerias/NN_nombre.md` (qué entró, qué se descartó y por qué, obras cumbre).
8. **Exportador** (cuando Guido decida publicar): `export-drive.mjs` → `Galerías/`; avisar al agente de la app.
9. **Cierre** (`docs/procesos/CIERRE.md`): handoff, TODO, CHANGELOG, `audit`, commit y push.

## Qué se registra de cada obra (sí / no / casi)
| Situación | Dónde queda hoy |
|---|---|
| Entró | `<col>/_index.json` |
| Se buscó y se descartó al bajar (baja resolución, no se encontró, basura) | `_descartes/<col>.jsonl` — **incompleto** (no lo loguean `canon`, `wikiart`, `sculptures`, `prune-*`; solo existe para 01–06, 17 y 20) |
| Se sacó después (duplicada, mala calidad, fuera de tema) | `<col>/_dedup_removed/` (en la biblioteca, no en git) + línea en `_descartes/` |
| **Importante pero no la conseguimos** (sin versión buena, copyright) | `<col>/_candidatas.json`, estado `pendiente` (`tools/candidatas.mjs`) |
| **Descartada** (duplicada, baja calidad, fuera de tema/período, baja resolución al descubrir) | `<col>/_candidatas.json`, estado `descartada` (sale de `_descartes/` + `tools/candidatas-manual.json`) |
El registro está **hecho para las 23 colecciones** (`node tools/candidatas.mjs --gap --apply`). Límite honesto: solo 8 colecciones tienen historial de descartes (los scripts viejos no los registraban); para el resto el registro tiene las brechas de Wikidata y la lista manual. Cada archivo lo dice en `cobertura`.

## Reglas que cruzan todos los roles
Dry-run y OK de Guido antes de bajar/podar en masa · el archivo en disco es la verdad · las imágenes no se editan · `qid`/`sourceId`, no `n`, para referenciar · evidencia (`audit`) o "NO VERIFICADO" · una sesión = una misión.

## Subagentes: decisión tomada (2026-11-03)
Se adoptó la opción **B**: subagentes solo para tareas de **lectura en paralelo** (investigar el canon, revisar a ojo hojas de contacto) y para escribir **un único archivo propio** (`tools/desc/NN.mjs`). Nunca escriben `_index.json` ni descargan: eso es del agente principal. Opción C (subagentes que escriben índices) descartada hasta que exista el lock técnico (`docs/TODO.md` 🟢). Gemini/OpenCode siguen `NUEVA_COLECCION.md` con un solo agente.
