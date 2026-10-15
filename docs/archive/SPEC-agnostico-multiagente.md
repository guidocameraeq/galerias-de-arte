✅ IMPLEMENTADO 2026-10-15 — borrador de diseño; el resultado final está en AGENTS.md, docs/ y docs/CHANGELOG.md (algunos datos de "Contexto" son los de antes de la reorganización)

# SPEC: Proyecto levantable por cualquier agente + documentación de proceso — Arte
Hacer que "Arte" arranque igual desde Claude, Gemini CLI, OpenCode u otro agente, y dejar documentado cómo se construyó y cómo se garantiza la calidad.
- Estado: IMPLEMENTADO (plan aprobado y ejecutado el 2026-10-15)
- Fecha: 2026-10-15

## Por qué (el dolor)
Hoy el proyecto solo lo levanta bien Claude, y aun así de forma frágil: todo el conocimiento está en un `CLAUDE.md` de 322 líneas que mezcla reglas, estado, calibraciones y diario, y **se contradice** (arriba dice "solo dominio público / PROHIBIDO scrapear / 6 colecciones"; abajo, la realidad: uso personal, WikiArt, 17 colecciones). Un agente que lee de arriba para abajo aprende lo viejo. Además la garantía de calidad (resolución, piezas buenas, inventario, fichas) existe como conocimiento disperso y como one-liners que se tipearon a mano, no como algo ejecutable. Cuando cambie de agente o quiera reusar el método en otro proyecto, hay que reconstruirlo de memoria.

## Contexto del código (de la exploración — nombres REALES)
- Raíz: 17 carpetas de colección (`01_mitologia_griega_romana` … `17_dore_divina_comedia`), `tools/` (33 `.mjs` + `canon/` 11 + `wikiart/` 3 + `desc/` 16), `_descartes/*.jsonl`, `package.json` (deps `sharp`, `jimp`). ~6,5 GB, 1102 obras.
- Docs actuales: `CLAUDE.md` (322 líneas), `PLAN.md` (180), `START_HERE.md` (55), `tools/README.md` (98). El "log de avance" está duplicado en CLAUDE.md ("Estado general") y PLAN.md.
- **No hay**: git, `.claude/` (skills/hooks), `AGENTS.md`, `GEMINI.md`, ni `docs/`. No hay tests ni un chequeo único.
- Inventario: un `<col>/_index.json` con forma `{collection, items:[…]}` (objeto, no array) por colección; descartes en `_descartes/<col>.jsonl`; originales movidos a `17_*/_dedup_removed/`.
- Garantías de calidad que existen pero dispersas: piso 1000 px (modernas 800); medir el archivo REAL descargado (Wikimedia clampea renders); `fix-dims.mjs` re-mide del disco; validar magic bytes (solo en `dore-redownload.mjs`, **NO en `lib.downloadTo`** → bug latente para cualquier descarga futura); dedup por qid+título y por dHash 256-bit (solo Doré); nunca editar/recortar ni filtrar por aspect ratio.
- Fichas: descripciones 01-15 se editan en `tools/desc/NN.mjs` + `apply-desc.mjs`; 16 y gap-fill vía `enrich-es.mjs` (QID→es.wikipedia); 17 vía `dore-desc.mjs`.
- Cómo cargan contexto los otros agentes (fuentes de terceros, a verificar en uso): OpenCode lee `AGENTS.md` (si falta, cae a `CLAUDE.md`); Gemini CLI lee `GEMINI.md` por defecto y acepta `@archivo.md` y `context.fileName`; Claude Code no lee `AGENTS.md` solo → `@AGENTS.md` en `CLAUDE.md`. En Windows el symlink pide admin/Modo desarrollador → usar importación, no symlink.

## AGREGA (lo nuevo)
(pendiente — se completa con la aprobación del plano)

## MODIFICA (lo existente que se toca)
(pendiente)

## NO SE TOCA (obligatoria)
(pendiente)

## Criterios de aceptación (3-8, verificables)
(pendiente)

## Supuestos
(pendiente)

## Riesgos y decisiones ⚠️
(pendiente)

### Alternativas evaluadas y descartadas
(pendiente)
