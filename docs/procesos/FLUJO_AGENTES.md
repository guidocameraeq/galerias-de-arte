# FLUJO_AGENTES — quién hace qué cuando hay que salir a buscar arte

> Agnóstico de agente (Claude, Gemini, OpenCode…). Hoy **un solo agente hace todos los roles, uno por vez** (regla dura 7: un escritor por `_index.json`). Los roles ordenan el trabajo y dejan claro qué gate corresponde a cada paso; si algún día se parten en subagentes, esta tabla es el reparto. **No hay subagentes definidos** (`.claude/agents/` no existe): decisión pendiente, ver al final.

## Los roles
| Rol | Qué hace | Herramientas | Sale con |
|---|---|---|---|
| **1 · Historiador** | Define qué entra en una galería: canon del tema, quién y qué obras, qué NO (y por qué). Investiga *antes* de bajar nada | Wikipedia, Wikidata, `tools/gap.mjs`, `docs/galerias/NN_*.md` | Lista de objetivos (`targets-*.mjs` o `canon/NN.mjs`) |
| **2 · Cosechador** | Busca, verifica y baja las imágenes | `harvest-*.mjs`, `collect.mjs`, `canon.mjs`, `wikiart.mjs` (ver `tools/README.md`) | Obras en la biblioteca + `_index.json`; descartes en `_descartes/` |
| **3 · Verificador de calidad** | Aplica los gates; ve las imágenes si hace falta; saca lo que no sirve | `audit.mjs`, `fix-dims.mjs`, `remove-work.mjs`, `docs/CALIDAD.md` | `audit` en 0 FALLAS; sin avisos nuevos injustificados |
| **4 · Redactor de fichas** | Escribe la ficha en español de una fuente (y la larga de la app) | `wikidata-enrich`, `enrich-es`, `tools/desc/NN.mjs` + `apply-desc` | `description` + `description_source` |
| **5 · Exportador** | Convierte la biblioteca en carpetas para la app | `export-drive.mjs` (pendiente), `check-prueba-json.mjs`, `images-sync.mjs` | `Galerías/` en Drive + aviso al agente de la app |
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
| **Importante pero no la conseguimos** (sin versión buena, copyright) | **Hoy solo en `docs/TODO.md` y `docs/galerias/NN_*.md`, a mano** |
| **Descartada por criterio del historiador** (fuera de período, irrelevante) | **No hay registro sistemático** |
Para cerrar los dos últimos huecos, propuesta `<col>/_candidatas.json`: por cada obra vista, `estado` (`entró` / `pendiente` / `descartada`), `motivo`, `qid`, fuente, qué se intentó. Piloto Barroco. **Falta OK de Guido sobre el formato.** Es lo que permite, al curar una galería nueva, saber qué obra importante falta y por qué.

## Reglas que cruzan todos los roles
Dry-run y OK de Guido antes de bajar/podar en masa · el archivo en disco es la verdad · las imágenes no se editan · `qid`/`sourceId`, no `n`, para referenciar · evidencia (`audit`) o "NO VERIFICADO" · una sesión = una misión.

## Decisión pendiente: subagentes
Opciones: **(A)** dejar un solo agente con estos roles (hoy; simple, sin riesgo de pisar índices); **(B)** subagentes de Claude solo para tareas de *lectura* en paralelo (investigar el canon de varias escuelas, revisar visualmente lotes de imágenes), manteniendo un único escritor; **(C)** subagentes que escriben, con lock. Recomendación: **B** cuando haya una galería grande para investigar; **C** descartada hasta que exista el lock técnico (`docs/TODO.md` 🟢). Los subagentes son cosa de Claude Code; Gemini/OpenCode siguen este mismo doc con un solo agente.
